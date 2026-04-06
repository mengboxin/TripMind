from langgraph.constants import START, END
from langgraph.graph import StateGraph
from langgraph.prebuilt import tools_condition

from graph_chat.assistant import CtripAssistant, assistant_runnable, primary_assistant_tools
from graph_chat.base_data_model import ToFlightAssistant, ToCarAssistant, ToHotelAssistant, \
    ToTripAssistant
from graph_chat.state import State
from tools.tools_handler import create_tool_node_with_fallback, _print_event

def build_primary_graph(builder: StateGraph) -> StateGraph:
    """构建主助理的工作流图，采用与子助理相同的模式"""
    # 添加主助理节点
    builder.add_node('primary_assistant', CtripAssistant(assistant_runnable))
    # 添加主助理工具节点
    builder.add_node(
        "primary_assistant_tools", create_tool_node_with_fallback(primary_assistant_tools)  # 主助理工具节点，包含各种工具
    )

    def route_primary_assistant(state: dict):
        """
        根据当前状态 判断路由到 子助手节点。
        :param state: 当前对话状态字典
        :return: 下一步应跳转到的节点名
        """
        route = tools_condition(state)  # 判断下一步的方向
        if route == END:
            return END  # 如果结束条件满足，则返回END
        tool_calls = state["messages"][-1].tool_calls  # 获取最后一条消息中的工具调用
        if tool_calls:
            if tool_calls[0]["name"] == ToFlightAssistant.__name__:
                return "enter_flight_assistant"  # 跳转至航班预订入口节点
            elif tool_calls[0]["name"] == ToCarAssistant.__name__:
                return "enter_car_assistant"  # 跳转至租车预订入口节点
            elif tool_calls[0]["name"] == ToHotelAssistant.__name__:
                return "enter_hotel_assistant"  # 跳转至酒店预订入口节点
            elif tool_calls[0]["name"] == ToTripAssistant.__name__:
                return "enter_trip_assistant"  # 跳转至游览预订入口节点
            return "primary_assistant_tools"  # 否则跳转至主助理工具节点
        raise ValueError("无效的路由")  # 如果没有找到合适的工具调用，抛出异常

    # 添加条件边，路由主助理的决策
    builder.add_conditional_edges(
        'primary_assistant',
        route_primary_assistant,
        [
            "enter_flight_assistant",    # 航班助理入口
            "enter_car_assistant",       # 租车助理入口
            "enter_hotel_assistant",     # 酒店助理入口
            "enter_trip_assistant",      # 旅游助理入口
            "primary_assistant_tools",   # 主助理工具节点
            END,
        ]
    )
    # 连接工具节点回到主助理
    builder.add_edge('primary_assistant_tools', 'primary_assistant')

    return builder

def route_to_workflow(state: dict) -> str:
    """
    如果我们在一个委托的状态中，直接路由到相应的助理。
    :param state: 当前对话状态字典
    :return: 应跳转到的节点名
    """
    dialog_state = state.get("dialog_state")
    if not dialog_state:
        return "primary_assistant"  # 如果没有对话状态，返回主助理
    return dialog_state[-1]  # 返回最后一个对话状态
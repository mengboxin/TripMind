from langchain_core.messages import ToolMessage
from langgraph.constants import END
from langgraph.graph import StateGraph
from langgraph.prebuilt import tools_condition

from graph_chat.agent_assistant import flight_runnable, flight_sensitive_tools, flight_safe_tools, \
    car_runnable, car_safe_tools, car_sensitive_tools, hotel_runnable, \
    hotel_safe_tools, hotel_sensitive_tools, trip_runnable, trip_safe_tools, \
    trip_sensitive_tools
from graph_chat.assistant import CtripAssistant
from graph_chat.base_data_model import CompleteOrEscalate
from graph_chat.entry_node import create_entry_node
from tools.tools_handler import create_tool_node_with_fallback


# 航班助手的 子工作流
def build_flight_graph(builder: StateGraph) -> StateGraph:
    """构建 航班预订助理的子工作流图"""
    # 添加入口节点，当需要更新或取消航班时使用
    builder.add_node(
        "enter_flight_assistant",
        create_entry_node("Flight Updates & Booking Assistant", "flight_assistant"),  # 创建入口节点，指定助理名称和新对话状态
    )
    builder.add_node("flight_assistant", CtripAssistant(flight_runnable))  # 添加处理航班更新的实际节点

    builder.add_edge("enter_flight_assistant", "flight_assistant")  # 连接入口节点到实际处理节点

    # 添加敏感工具和安全工具的节点
    builder.add_node(
        "flight_sensitive_tools",
        create_tool_node_with_fallback(flight_sensitive_tools),  # 敏感工具节点，包含可能修改数据的操作
    )
    builder.add_node(
        "flight_safe_tools",
        create_tool_node_with_fallback(flight_safe_tools),  # 安全工具节点，通常只读查询
    )

    def route_flight_assistant(state: dict):
        """
        根据当前状态路由航班更新流程。

        :param state: 当前对话状态字典
        :return: 下一步应跳转到的节点名
        """
        route = tools_condition(state)  # 判断下一步的方向
        if route == END:
            return END  # 如果结束条件满足，则返回END
        tool_calls = state["messages"][-1].tool_calls  # 获取最后一条消息中的工具调用
        did_cancel = any(tc["name"] == CompleteOrEscalate.__name__ for tc in tool_calls)  # 检查是否调用了CompleteOrEscalate
        if did_cancel:
            return "leave_skill"  # 如果用户请求取消或退出，则跳转至leave_skill节点
        safe_tool_names = [t.name for t in flight_safe_tools]  # 获取所有安全工具的名字
        if all(tc["name"] in safe_tool_names for tc in tool_calls):  # 如果所有调用的工具都是安全工具
            return "flight_safe_tools"  # 跳转至安全工具处理节点
        return "flight_sensitive_tools"  # 否则跳转至敏感工具处理节点

    # 添加边，连接敏感工具和安全工具节点回到航班更新处理节点
    builder.add_edge("flight_sensitive_tools", "flight_assistant")
    builder.add_edge("flight_safe_tools", "flight_assistant")

    # 根据条件路由航班更新流程
    builder.add_conditional_edges(
        "flight_assistant",
        route_flight_assistant,
        ["flight_sensitive_tools", "flight_safe_tools", "leave_skill", END],
    )

    # 此节点将用于所有子助理的退出
    def pop_dialog_state(state: dict) -> dict:
        """
        弹出对话栈并返回主助理。
        这使得完整的图可以明确跟踪对话流，并根据需要委托控制给特定的子图。
        :param state: 当前对话状态字典
        :return: 包含新的对话状态和消息的字典
        """
        messages = []
        last = state["messages"][-1]
        if hasattr(last, "tool_calls") and last.tool_calls:
            # 注意：目前不处理LLM同时执行多个工具调用的情况
            messages.append(
                ToolMessage(
                    content="正在恢复与主助理的对话。请回顾之前的对话并根据需要协助用户。",
                    tool_call_id=state["messages"][-1].tool_calls[0]["id"],
                )
            )
        return {
            "dialog_state": "pop",  # 更新对话状态为弹出
            "messages": messages,  # 返回消息列表
        }

    # 添加退出技能节点，并连接回主助理
    builder.add_node("leave_skill", pop_dialog_state)
    builder.add_edge("leave_skill", "primary_assistant")
    return builder


def build_car_graph(builder: StateGraph) -> StateGraph:
    # 租车助理 的子工作流
    # 添加入口节点，当需要预订租车时使用
    builder.add_node(
        "enter_car_assistant",
        create_entry_node("Car Rental Assistant", "car_assistant"),  # 创建入口节点，指定助理名称和新对话状态
    )
    builder.add_node("car_assistant", CtripAssistant(car_runnable))  # 添加处理租车预订的实际节点
    builder.add_edge("enter_car_assistant", "car_assistant")  # 连接入口节点到实际处理节点

    # 添加安全工具和敏感工具的节点
    builder.add_node(
        "car_safe_tools",
        create_tool_node_with_fallback(car_safe_tools),  # 安全工具节点，通常只读查询
    )
    builder.add_node(
        "car_sensitive_tools",
        create_tool_node_with_fallback(car_sensitive_tools),  # 敏感工具节点，包含可能修改数据的操作
    )

    def route_car_assistant(state: dict):
        """
        根据当前状态路由租车预订流程。

        :param state: 当前对话状态字典
        :return: 下一步应跳转到的节点名
        """
        route = tools_condition(state)  # 判断下一步的方向
        if route == END:
            return END  # 如果结束条件满足，则返回END
        tool_calls = state["messages"][-1].tool_calls  # 获取最后一条消息中的工具调用
        did_cancel = any(tc["name"] == CompleteOrEscalate.__name__ for tc in tool_calls)  # 检查是否调用了CompleteOrEscalate
        if did_cancel:
            return "leave_skill"  # 如果用户请求取消或退出，则跳转至leave_skill节点
        safe_toolnames = [t.name for t in car_safe_tools]  # 获取所有安全工具的名字
        if all(tc["name"] in safe_toolnames for tc in tool_calls):  # 如果所有调用的工具都是安全工具
            return "car_safe_tools"  # 跳转至安全工具处理节点
        return "car_sensitive_tools"  # 否则跳转至敏感工具处理节点

    # 添加边，连接敏感工具和安全工具节点回到租车预订处理节点
    builder.add_edge("car_sensitive_tools", "car_assistant")
    builder.add_edge("car_safe_tools", "car_assistant")

    # 根据条件路由租车预订流程
    builder.add_conditional_edges(
        "car_assistant",
        route_car_assistant,
        [
            "car_safe_tools",
            "car_sensitive_tools",
            "leave_skill",
            END
        ]
    )
    return builder


# 酒店预订助理
def build_hotel_graph(builder: StateGraph) -> StateGraph:
    # 添加入口节点，当需要预订酒店时使用
    builder.add_node(
        "enter_hotel_assistant",
        create_entry_node("酒店预订助理", "hotel_assistant"),  # 创建入口节点，指定助理名称和新对话状态
    )
    builder.add_node("hotel_assistant", CtripAssistant(hotel_runnable))  # 添加处理酒店预订的实际节点
    builder.add_edge("enter_hotel_assistant", "hotel_assistant")  # 连接入口节点到实际处理节点

    # 添加安全工具和敏感工具的节点
    builder.add_node(
        "hotel_safe_tools",
        create_tool_node_with_fallback(hotel_safe_tools),  # 安全工具节点，通常只读查询
    )
    builder.add_node(
        "hotel_sensitive_tools",
        create_tool_node_with_fallback(hotel_sensitive_tools),  # 敏感工具节点，包含可能修改数据的操作
    )

    def route_hotel_assistant(state: dict):
        """
        根据当前状态路由酒店预订流程。

        :param state: 当前对话状态字典
        :return: 下一步应跳转到的节点名
        """
        route = tools_condition(state)  # 判断下一步的方向
        if route == END:
            return END  # 如果结束条件满足，则返回END
        tool_calls = state["messages"][-1].tool_calls  # 获取最后一条消息中的工具调用
        did_cancel = any(tc["name"] == CompleteOrEscalate.__name__ for tc in tool_calls)  # 检查是否调用了CompleteOrEscalate
        if did_cancel:
            return "leave_skill"  # 如果用户请求取消或退出，则跳转至leave_skill节点
        safe_toolnames = [t.name for t in hotel_safe_tools]  # 获取所有安全工具的名字
        if all(tc["name"] in safe_toolnames for tc in tool_calls):  # 如果所有调用的工具都是安全工具
            return "hotel_safe_tools"  # 跳转至安全工具处理节点
        return "hotel_sensitive_tools"  # 否则跳转至敏感工具处理节点

    # 添加边，连接敏感工具和安全工具节点回到酒店预订处理节点
    builder.add_edge("hotel_sensitive_tools", "hotel_assistant")
    builder.add_edge("hotel_safe_tools", "hotel_assistant")

    # 根据条件路由酒店预订流程
    builder.add_conditional_edges(
        "hotel_assistant",
        route_hotel_assistant,
        ["leave_skill", "hotel_safe_tools", "hotel_sensitive_tools", END],
    )
    return builder


# 构建一个旅游产品的子图
def build_trip_graph(builder: StateGraph) -> StateGraph:
    # 添加入口节点，当需要预订游览或获取旅行推荐时使用
    builder.add_node(
        "enter_trip_assistant",
        create_entry_node("旅行推荐助理", "trip_assistant"),  # 创建入口节点，指定助理名称和新对话状态
    )
    builder.add_node("trip_assistant", CtripAssistant(trip_runnable))  # 添加处理游览预订的实际节点
    builder.add_edge("enter_trip_assistant", "trip_assistant")  # 连接入口节点到实际处理节点

    # 添加安全工具和敏感工具的节点
    builder.add_node(
        "trip_safe_tools",
        create_tool_node_with_fallback(trip_safe_tools),  # 安全工具节点，通常只读查询
    )
    builder.add_node(
        "trip_sensitive_tools",
        create_tool_node_with_fallback(trip_sensitive_tools),  # 敏感工具节点，包含可能修改数据的操作
    )

    def route_trip_assistant(state: dict):
        """
        根据当前状态路由游览预订流程。

        :param state: 当前对话状态字典
        :return: 下一步应跳转到的节点名
        """
        route = tools_condition(state)  # 判断下一步的方向
        if route == END:
            return END  # 如果结束条件满足，则返回END
        tool_calls = state["messages"][-1].tool_calls  # 获取最后一条消息中的工具调用
        did_cancel = any(tc["name"] == CompleteOrEscalate.__name__ for tc in tool_calls)  # 检查是否调用了CompleteOrEscalate
        if did_cancel:
            return "leave_skill"  # 如果用户请求取消或退出，则跳转至leave_skill节点
        safe_toolnames = [t.name for t in trip_safe_tools]  # 获取所有安全工具的名字
        if all(tc["name"] in safe_toolnames for tc in tool_calls):  # 如果所有调用的工具都是安全工具
            return "trip_safe_tools"  # 跳转至安全工具处理节点
        return "trip_sensitive_tools"  # 否则跳转至敏感工具处理节点

    # 添加边，连接敏感工具和安全工具节点回到游览预订处理节点
    builder.add_edge("trip_sensitive_tools", "trip_assistant")
    builder.add_edge("trip_safe_tools", "trip_assistant")

    # 根据条件路由游览预订流程
    builder.add_conditional_edges(
        "trip_assistant",
        route_trip_assistant,
        ["trip_safe_tools", "trip_sensitive_tools", "leave_skill", END],
    )
    return builder

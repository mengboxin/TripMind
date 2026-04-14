import os
from datetime import datetime
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import Runnable, RunnableConfig
from graph_chat.base_data_model import ToFlightAssistant, ToCarAssistant, ToHotelAssistant, ToTripAssistant
from graph_chat.llm import llm
from tools.search_tools import SearchWebTool
from graph_chat.state import State
from tools.retriever_vector import lookup_policy
from tools.travel_utils_tools import get_weather, get_exchange_rate, get_timezone_info, get_visa_info, get_emergency_contacts


class CtripAssistant:

    # 自定义一个类，表示流程图的一个节点（复杂的）

    def __init__(self, runnable: Runnable):
        """
        初始化助手的实例。
        :param runnable: 可以运行对象，通常是一个Runnable类型的
        """
        self.runnable = runnable

    def __call__(self, state: State, config: RunnableConfig):
        while True:
            # 动态获取当前时间，并与 state 合并
            runnable_input = {
                **state,
                "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }

            # 使用 runnable_input 代替 state 进行调用
            result = self.runnable.invoke(runnable_input)

            if not result.tool_calls and (
                    not result.content
                    or isinstance(result.content, list)
                    and not result.content[0].get("text")
            ):
                messages = state["messages"] + [("user", "请提供一个真实的输出作为回应。")]
                state = {**state, "messages": messages}
            else:
                break
        return {'messages': result}


primary_assistant_prompt = ChatPromptTemplate.from_messages([
    ("system",
     "您是途灵 TripMind 智能旅行助手。\n"
     "核心职责：识别用户意图，直接调用工具或分发给专门助理。\n\n"
     "直接调用工具：\n"
     "- get_weather：查询天气\n"
     "- get_exchange_rate：汇率换算\n"
     "- get_timezone_info：时区/当地时间\n"
     "- get_visa_info：签证信息\n"
     "- get_emergency_contacts：紧急联系电话\n"
     "- lookup_policy：退票改签行李政策\n"
     "- web_search：最新资讯景点介绍\n\n"
     "转交专门助理：\n"
     "- ToFlightAssistant：机票业务\n"
     "- ToHotelAssistant：酒店业务\n"
     "- ToCarAssistant：租车业务\n"
     "- ToTripAssistant：景点游览\n\n"
     "注意：不要暴露内部架构，搜索无结果时扩大关键词范围。\n"
     "\n当前时间: {time}."),
    ("placeholder", "{messages}"),
])


# 定义主助理使用的工具
primary_assistant_tools = [
    SearchWebTool,      # 全网搜索
    lookup_policy,      # 查找公司政策
    get_weather,        # 天气查询
    get_exchange_rate,  # 汇率换算
    get_timezone_info,  # 时区/当地时间
    get_visa_info,      # 签证信息
    get_emergency_contacts,  # 紧急联系电话
]

# 创建可运行对象，绑定主助理提示模板和工具集，包括委派给专门助理的工具
assistant_runnable = primary_assistant_prompt | llm.bind_tools(
    primary_assistant_tools
    + [
        ToFlightAssistant,  # 用于转交航班更新或取消的任务
        ToCarAssistant,  # 用于转交租车预订的任务
        ToHotelAssistant,  # 用于转交酒店预订的任务
        ToTripAssistant,  # 用于转交旅行推荐和其他游览预订的任务
    ]
)


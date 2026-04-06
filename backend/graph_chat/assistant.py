import os
from datetime import datetime
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import Runnable, RunnableConfig
from graph_chat.base_data_model import ToFlightAssistant, ToCarAssistant, ToHotelAssistant, ToTripAssistant
from graph_chat.llm import llm
from tools.search_tools import SearchWebTool
from graph_chat.state import State
from tools.retriever_vector import lookup_policy


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


primary_assistant_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "您是携程瑞士航空公司的智能客服总助手。\n"
            "您的核心职责是**识别用户意图**，并将具体业务请求通过调用工具分发给对应的专门助理。\n"

            "### 🛠️ 任务分发规则（必须严格遵守）：\n"
            "1. **航班业务 (ToFlightAssistant)**：\n"
            "   - 当用户涉及任何航班相关的话题时（包括但不限于：查询我的航班、航班时刻表、改签、退票、选座、值机）。\n"
            "    - 如果用户使用“我的航班”、“我的机票”、“我的订单”等表达，视为已登录用户查询个人订单。\n"
            "    - 必须立即调用 ToFlightAssistant，不得自行回答或向用户索要航班号。\n"

            "2. **酒店业务 (ToHotelAssistant)**：\n"
            "   - 当用户涉及酒店预订、查询、修改或取消时。\n"

            "3. **租车业务 (ToCarAssistant)**：\n"
            "   - 当用户涉及租车服务时。\n"

            "4. **行程/游览业务 (ToTripAssistant)**：\n"
            "   - 当用户寻求旅行建议、景点推荐或预订当地游览活动时。\n"

            "### ⛔ 限制与约束：\n"
            "1. **不要暴露架构**：用户并不知道有“专门助理”的存在，请安静地通过函数调用来完成转接，不要告诉用户“我正在为您转接”。\n"
            "2. **不要处理个人数据**：您没有权限访问用户的个人订单信息（如姓名、航班号）。如果用户问“我的航班是几点”，直接转交给 ToFlightAssistant，它有权限查看。\n"
            "3. **通用政策查询**：当涉及退票、改签、行李额度、宠物运输、赔偿标准等规则问题时，必须调用 lookup_policy 获取官方政策，不得凭记忆回答。\n"

            "### 🔎 搜索建议：\n"
            "在回答通用政策或搜索公共信息时，请坚持不懈。如果第一次搜索没有结果，请尝试扩大关键词范围。\n"

            "\n当前时间: {time}."
        ),
        ("placeholder", "{messages}"),
    ]
)

# 定义主助理使用的工具
primary_assistant_tools = [
    SearchWebTool,  # 全网搜索工具
    lookup_policy,  # 查找公司政策的工具
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


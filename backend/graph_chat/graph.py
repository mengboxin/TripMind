import uuid

from langchain_core.messages import ToolMessage
from langgraph.checkpoint.memory import MemorySaver
from graph_chat.mysql_checkpointer import MySQLCheckpointSaver
from langgraph.constants import START, END
from langgraph.graph import StateGraph
from graph_chat.build_child_graph import build_flight_graph, build_hotel_graph, build_car_graph, \
    build_trip_graph
from graph_chat.build_primary_graph import build_primary_graph, route_to_workflow
from graph_chat.draw_png import draw_graph
from graph_chat.state import State
from tools.init_db import update_dates
from tools.tools_handler import _print_event

# 定义了一个流程图的构建对象
builder = StateGraph(State)

# 添加主工作流
builder = build_primary_graph(builder)

# 添加 四个业务助理 的 子工作流
builder = build_flight_graph(builder)
builder = build_hotel_graph(builder)
builder = build_car_graph(builder)
builder = build_trip_graph(builder)

builder.add_conditional_edges(
    START,
    route_to_workflow,
    {
        "primary_assistant": "primary_assistant",
        "flight_assistant": "enter_flight_assistant",
        "car_assistant": "enter_car_assistant",
        "hotel_assistant": "enter_hotel_assistant",
        "trip_assistant": "enter_trip_assistant",
    }
)

memory = MySQLCheckpointSaver()

#配置人工检查点
graph = builder.compile(
    checkpointer=memory,
    interrupt_before=[
        "flight_sensitive_tools",
        "car_sensitive_tools",
        "hotel_sensitive_tools",
        "trip_sensitive_tools",
    ]
)

#draw_graph(graph, 'graph5.png')

if __name__ == "__main__":
    # 1. 刷新数据库时间 (确保能查到未来航班)
    from tools.init_db import update_dates

    try:
        update_dates()
        print("✅ 数据库时间已同步至当前时间。")
    except Exception as e:
        print(f"⚠️ 数据库更新失败 (可能不影响运行): {e}")

    # 2. 初始化配置
    session_id = str(uuid.uuid4())
    config = {
        "configurable": {
            "passenger_id": "3442 587242",
            "thread_id": session_id,
        }
    }

    _printed = set()

    print("\n" + "=" * 60)
    print(f"🚀 携程智能助手系统启动成功")
    print(f"🆔 会话 ID: {session_id}")
    print("💡 提示：输入 'q', 'exit' 或 'quit' 退出对话")
    print("=" * 60)


    # --- 辅助函数：美化工具参数输出 ---
    def format_tool_args(tool_name, args):
        if tool_name == "book_flight":
            return (
                f"🎫 **预订航班**\n"
                f"   - 航班 ID: {args.get('flight_id')}\n"
                f"   - 舱位等级: {args.get('fare_conditions', 'Economy')}\n"
            )
        elif tool_name == "search_flights":
            # 处理时间格式，防止太长
            start = args.get('start_time', '不限').replace('T', ' ')
            end = args.get('end_time', '不限').replace('T', ' ')
            return (
                f"🔍 **查询航班**\n"
                f"   - 出发地: {args.get('departure_airport')}\n"
                f"   - 目的地: {args.get('arrival_airport')}\n"
                f"   - 时间范围: {start} 至 {end}"
            )
        elif tool_name == "update_ticket_to_new_flight":
            return (
                f"🔄 **改签机票**\n"
                f"   - 原票号: {args.get('ticket_no')}\n"
                f"   - 新航班 ID: {args.get('new_flight_id')}"
            )
        elif tool_name == "cancel_ticket":
            return f"❌ **退票**: 票号 {args.get('ticket_no')}"
        else:
            # 默认格式
            return f"🔧 **{tool_name}**: {args}"


    # --- 主循环 ---
    while True:
        try:
            question = input('\n👤 用户: ')
        except EOFError:
            break

        if question.lower() in ['q', 'exit', 'quit']:
            print('\n👋 对话结束，感谢使用！')
            break

        print("-" * 40)  # 分割线

        # --- 正常对话流 ---
        events = graph.stream(
            {'messages': ('user', question)},
            config=config,
            stream_mode='values'
        )
        for event in events:
            _print_event(event, _printed)

        # --- 人工介入检查 (Human-in-the-loop) ---
        snapshot = graph.get_state(config)
        if snapshot.next:
            # 获取最后一条包含工具调用的消息
            last_message = snapshot.values["messages"][-1]

            print("\n" + "!" * 40)
            print("✋  **安全拦截：助手请求执行敏感操作**")

            if hasattr(last_message, 'tool_calls'):
                for tc in last_message.tool_calls:
                    # 使用美化函数打印
                    print(format_tool_args(tc['name'], tc['args']))

            print("!" * 40 + "\n")

            user_input = input(
                "👉 是否批准？(输入 'y' 批准，输入其他内容则拒绝并说明原因)："
            )

            if user_input.strip().lower() == "y":
                # 批准
                print("\n✅ 操作已批准，正在执行...")
                events = graph.stream(None, config=config, stream_mode='values')
                for event in events:
                    _print_event(event, _printed)
            else:
                # 拒绝
                print(f"\n🚫 操作已拒绝。反馈原因: {user_input}")

                tool_messages = []
                if hasattr(last_message, 'tool_calls'):
                    for tc in last_message.tool_calls:
                        tool_messages.append(
                            ToolMessage(
                                tool_call_id=tc["id"],
                                content=f"操作被用户拒绝。用户指示：'{user_input}'。",
                            )
                        )

                # 将拒绝消息推回给图
                result = graph.stream(
                    {"messages": tool_messages},
                    config=config,
                    stream_mode='values'
                )
                for event in result:
                    _print_event(event, _printed)
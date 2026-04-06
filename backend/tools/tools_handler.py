from typing import List, Dict, Set, Any
from langchain_core.messages import ToolMessage, BaseMessage
from langchain_core.runnables import RunnableLambda
from langgraph.prebuilt import ToolNode
from utils.log_utils import log


def handle_tool_error(state: Dict[str, Any]) -> Dict[str, List[ToolMessage]]:
    """
    处理工具调用时发生的错误。
    此函数充当回退机制，当 ToolNode 抛出异常时捕获并返回给 LLM 一个友好的错误提示，
    而不是让整个程序崩溃。
    """
    error = state.get("error")

    # 获取最后一条消息（通常是发起工具调用的 AIMessage）
    last_message = state["messages"][-1]
    tool_calls = getattr(last_message, "tool_calls", [])

    # 1. 记录详细错误日志
    log.error(f"工具执行发生错误: {repr(error)}")

    # 2. 构建回退消息
    # 我们需要为每一个发起的 tool_call 都返回一个 ToolMessage，
    # 否则 LLM 会感到困惑（它发起了调用却没收到结果）
    fallback_messages = []
    for tc in tool_calls:
        fallback_messages.append(
            ToolMessage(
                content=f"Error: {repr(error)}\n请根据此错误信息调整你的输入并重试。",
                tool_call_id=tc["id"],
                name=tc["name"]  # 最好带上名字
            )
        )

    return {
        "messages": fallback_messages
    }


def create_tool_node_with_fallback(tools: list) -> ToolNode:
    """
    创建一个带有回退机制的工具节点。

    如果工具执行过程中抛出异常（例如数据库连接失败、参数校验错误），
    会自动跳转到 handle_tool_error 函数处理，而不是中断程序。
    """
    return ToolNode(tools).with_fallbacks(
        [RunnableLambda(handle_tool_error)],
        exception_key="error"
    )


def _print_event(event: Dict[str, Any], _printed: Set[str], max_length=1500):
    """
    打印 LangGraph 的事件流信息。
    将原来的 print 替换为 log 系统，方便在日志文件中追踪对话状态。
    """
    # 1. 打印当前状态 (Debug 级别)
    current_state = event.get("dialog_state")
    if current_state:
        # 假设 current_state 是一个列表，取最后一个状态
        state_name = current_state[-1] if current_state else "Unknown"
        log.debug(f"当前对话状态流转至: [{state_name}]")

    # 2. 打印消息内容
    message = event.get("messages")
    if message:
        # LangGraph 有时返回列表，有时返回单个消息
        if isinstance(message, list):
            message = message[-1]

        # 避免重复打印同一个消息 ID
        if hasattr(message, "id") and message.id not in _printed:

            # 获取格式化的消息内容 (html=False 适合控制台/日志文件)
            msg_repr = message.pretty_repr(html=False)

            # 截断过长的消息
            if len(msg_repr) > max_length:
                msg_repr = msg_repr[:max_length] + " ... (已截断)"

            # 根据消息类型使用不同的日志级别
            msg_type = message.type
            log_prefix = f"[{msg_type.upper()}]"

            if msg_type == "human":
                log.info(f"{log_prefix} 用户输入: {msg_repr}")
            elif msg_type == "ai":
                log.info(f"{log_prefix} AI 回复: {msg_repr}")
            elif msg_type == "tool":
                # 工具输出通常很长，或者是 JSON，使用 debug 级别以免刷屏
                log.debug(f"{log_prefix} 工具输出: {msg_repr}")
            else:
                log.info(f"{log_prefix} {msg_repr}")

            _printed.add(message.id)
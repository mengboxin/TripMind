from typing import Callable
from langchain_core.messages import ToolMessage


def create_entry_node(assistant_name: str, new_dialog_state: str) -> Callable:
    def entry_node(state: dict) -> dict:
        """
        根据当前对话状态生成新的对话消息并更新对话状态。
        """
        last_message = state["messages"][-1]

        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            tool_call_id = last_message.tool_calls[0]["id"]

            return {
                "messages": [
                    ToolMessage(
                        content=f"现在助手是{assistant_name}。请回顾上述主助理与用户之间的对话。"
                                f"用户的意图尚未满足。使用提供的工具协助用户。记住，您是{assistant_name}，"
                                "并且预订、更新或其他操作未完成，你需要继续移交直到成功调用了适当的工具。"
                                "如果用户改变主意或需要帮助进行其他任务，请调用CompleteOrEscalate函数让主要的主助理接管。"
                                "不要提及你是谁——仅作为助理的代理。",
                        tool_call_id=tool_call_id
                    )
                ],
                "dialog_state": new_dialog_state  # 顺便更新栈状态
            }

        return {
            "dialog_state": new_dialog_state
        }

    return entry_node
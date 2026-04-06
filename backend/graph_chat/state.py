from typing import TypedDict, Annotated, List, Optional, Literal
from langchain_core.messages import AnyMessage
from langgraph.graph import add_messages

def update_dialog_stack(left: list[str], right: Optional[str]) -> list[str]:
    """
    更新对话状态栈
    :param left: 当前的状态栈
    :param right: 想要添加到栈中的新状态或动作。如果为None，则不做任何更改；如果为pop则弹出否则压栈
    :return: 更新后的状态栈
    """
    if right is None:
        return left
    elif right == "pop":
        return left[:-1]
    else:
        return left + [right]

class State(TypedDict):
    '''
    定义状态图中每个节点的输入输出数据结构。
     - messages: 包含了当前对话中的所有消息，类型为 AnyMessage 的列表。这个字段使用了 Annotated 来添加额外的元数据，指示这是一个消息列表，并且可以通过 add_messages 函数来处理这些消息。
     - user_info: 包含了用户的相关信息，类型为字符串。这个字段可以用来存储用户的基本信息、偏好等，以便在对话过程中使用。
     - dialog_state: 对话状态栈，限定只能包含特定字符串值，并使用update_dialog_stack函数控制更新逻辑
     通过定义 State 类，在状态图中清晰地描述每个节点所需的数据结构和类型，从而更好地管理和传递对话中的信息。
    '''
    messages: Annotated[List[AnyMessage], add_messages]
    #设计五个子助手的状态, Literal做限定
    dialog_state: Annotated[
        List[
            Literal[
                "primary_assistant",
                "flight_assistant",
                "car_assistant",
                "hotel_assistant",
                "trip_assistant"
            ]
        ], update_dialog_stack
    ]
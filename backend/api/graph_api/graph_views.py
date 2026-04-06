import json
import logging
from fastapi import APIRouter
from starlette.requests import Request

from api.graph_api.graph_schemas import BaseGraphSchema, GraphRspSchema, SaveChatSchema
from graph_chat.graph import graph
from utils.db_utils import get_connection

router = APIRouter()
log = logging.getLogger('graph')


@router.post('/graph/', description='调用工作流', response_model=GraphRspSchema)
def execute_graph(request: Request, obj_in: BaseGraphSchema):
    question = obj_in.user_input
    config = obj_in.config.model_dump()
    result = ''

    events = graph.stream(
        None if question.strip().lower() == 'y' else {'messages': ('user', question)},
        config, stream_mode='values'
    )
    for event in events:
        messages = event.get('messages')
        if messages:
            message = messages[-1] if isinstance(messages, list) else messages
            if message.__class__.__name__ == 'AIMessage' and message.content:
                result = message.content

    if graph.get_state(config).next:
        result = "AI助手马上根据你要求，执行相关操作。您是否批准上述操作？输入'y'继续；否则，请说明您请求的更改。\n"

    return {'assistant': result}


@router.post('/chat/save/', description='保存对话历史到数据库')
def save_chat(request: Request, obj_in: SaveChatSchema):
    username = request.state.username
    messages_json = json.dumps([m.model_dump() for m in obj_in.messages], ensure_ascii=False)
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO t_chat_history (username, thread_id, title, messages, updated_at)
                    VALUES (%s, %s, %s, %s, NOW())
                    ON DUPLICATE KEY UPDATE
                        title = VALUES(title),
                        messages = VALUES(messages),
                        updated_at = NOW()
                """, (username, obj_in.thread_id, obj_in.title, messages_json))
            conn.commit()
    except Exception as e:
        log.error(f"保存对话失败: {e}")
        return {'ok': False, 'error': str(e)}
    return {'ok': True}


@router.get('/chat/history/', description='获取对话历史列表')
def get_chat_history(request: Request):
    username = request.state.username
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT thread_id, title, updated_at
                    FROM t_chat_history
                    WHERE username = %s
                    ORDER BY updated_at DESC
                    LIMIT 30
                """, (username,))
                rows = cursor.fetchall()
        return [{'thread_id': r['thread_id'], 'title': r['title'],
                 'updated_at': r['updated_at'].isoformat() if r['updated_at'] else ''} for r in rows]
    except Exception as e:
        log.error(f"获取历史失败: {e}")
        return []


@router.get('/chat/history/{thread_id}/', description='获取某条对话的完整消息')
def get_chat_detail(thread_id: str, request: Request):
    username = request.state.username
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT thread_id, title, messages, updated_at
                    FROM t_chat_history
                    WHERE thread_id = %s AND username = %s
                """, (thread_id, username))
                row = cursor.fetchone()
        if not row:
            return {'thread_id': thread_id, 'title': '', 'messages': [], 'updated_at': ''}
        return {
            'thread_id': row['thread_id'],
            'title': row['title'],
            'messages': json.loads(row['messages']),
            'updated_at': row['updated_at'].isoformat() if row['updated_at'] else '',
        }
    except Exception as e:
        log.error(f"获取对话详情失败: {e}")
        return {'thread_id': thread_id, 'title': '', 'messages': [], 'updated_at': ''}


@router.get('/user/bookings/', description='获取用户所有订单')
def get_user_bookings(request: Request):
    passenger_id = "3442 587242"
    result = {'flights': [], 'hotels': [], 'cars': []}
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT t.ticket_no, t.book_ref,
                           f.flight_no, f.departure_airport, f.arrival_airport,
                           f.scheduled_departure, f.scheduled_arrival,
                           tf.fare_conditions
                    FROM tickets t
                    JOIN ticket_flights tf ON t.ticket_no = tf.ticket_no
                    JOIN flights f ON tf.flight_id = f.flight_id
                    WHERE t.passenger_id = %s
                    LIMIT 20
                """, (passenger_id,))
                result['flights'] = cursor.fetchall()
                cursor.execute("SELECT * FROM hotels WHERE booked = 1 LIMIT 20")
                result['hotels'] = cursor.fetchall()
                cursor.execute("SELECT * FROM car_rentals WHERE booked = 1 LIMIT 20")
                result['cars'] = cursor.fetchall()
    except Exception as e:
        log.error(f"查询订单失败: {e}")
    return result

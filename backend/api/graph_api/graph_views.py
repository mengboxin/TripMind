import json
import logging
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from starlette.requests import Request

from api.graph_api.graph_schemas import BaseGraphSchema, GraphRspSchema, SaveChatSchema
from graph_chat.graph import graph
from utils.db_utils import get_connection

router = APIRouter()
log = logging.getLogger('graph')


def _get_passenger_id(username: str) -> str:
    """从数据库取用户的 passenger_id"""
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT passenger_id FROM t_usermodel WHERE username=%s", (username,))
                row = cur.fetchone()
                if row and row.get('passenger_id'):
                    return row['passenger_id']
    except Exception:
        pass
    return "3442 587242"


@router.post('/graph/', description='调用工作流', response_model=GraphRspSchema)
def execute_graph(request: Request, obj_in: BaseGraphSchema):
    question = obj_in.user_input
    config = obj_in.config.model_dump()
    config['configurable']['passenger_id'] = _get_passenger_id(request.state.username)

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


@router.post('/graph/stream/', description='流式调用工作流（SSE）')
def execute_graph_stream(request: Request, obj_in: BaseGraphSchema):
    question = obj_in.user_input
    config = obj_in.config.model_dump()
    config['configurable']['passenger_id'] = _get_passenger_id(request.state.username)

    def generate():
        try:
            events = graph.stream(
                None if question.strip().lower() == 'y' else {'messages': ('user', question)},
                config, stream_mode='values'
            )
            result = ''
            for event in events:
                messages = event.get('messages')
                if messages:
                    message = messages[-1] if isinstance(messages, list) else messages
                    if message.__class__.__name__ == 'AIMessage' and message.content:
                        new_content = message.content
                        if new_content != result:
                            delta = new_content[len(result):]
                            result = new_content
                            if delta:
                                yield f"data: {json.dumps({'delta': delta}, ensure_ascii=False)}\n\n"

            if graph.get_state(config).next:
                if not result:
                    intro = "好的，我来为您执行这个操作。\n\n"
                    yield f"data: {json.dumps({'delta': intro}, ensure_ascii=False)}\n\n"
                msg = "**需要您的确认才能继续。** 是否批准上述操作？点击下方按钮确认或拒绝。\n"
                yield f"data: {json.dumps({'delta': msg, 'interrupt': True}, ensure_ascii=False)}\n\n"
            else:
                # 主流程结束，生成推荐追问（仅非 interrupt 情况）
                if result and len(result) > 50 and question.strip().lower() != 'y':
                    try:
                        from graph_chat.llm import llm
                        prompt = f"""用户刚问了："{question[:100]}"
我的回复摘要：{result[:300]}...

请根据上下文生成3个简短的追问建议（每个10-15字），帮助用户深入了解或继续规划。
要求：
1. 每行一个问题，不要序号
2. 问题要具体、可操作
3. 符合旅行规划场景

示例格式：
帮我细化第一天的行程
推荐附近性价比高的酒店
怎么从机场到市区最方便？"""
                        resp = llm.invoke(prompt, config={"max_tokens": 150, "temperature": 0.8})
                        suggestions = [s.strip() for s in resp.content.strip().split('\n') if s.strip() and len(s.strip()) > 5][:3]
                        if suggestions:
                            yield f"data: {json.dumps({'suggestions': suggestions}, ensure_ascii=False)}\n\n"
                    except Exception as e:
                        log.warning(f"生成追问失败: {e}")
                yield f"data: {json.dumps({'done': True}, ensure_ascii=False)}\n\n"

        except Exception as e:
            import traceback
            log.error(f"流式输出异常: {traceback.format_exc()}")
            yield f"data: {json.dumps({'error': str(e)}, ensure_ascii=False)}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


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


@router.get('/weather/', description='查询城市天气（带缓存）')
def get_weather_api(city: str, days: int = 4, request: Request = None):
    from utils.cache_utils import cache_get, cache_set
    import requests as req

    cache_key = f"weather_api:{city}:{days}"
    cached = cache_get(cache_key)
    if cached:
        return cached

    # 城市坐标
    COORDS = {
        "东京":(35.69,139.69),"北京":(39.90,116.40),"上海":(31.23,121.47),
        "巴黎":(48.85,2.35),"伦敦":(51.51,-0.12),"纽约":(40.71,-74.01),
        "巴厘岛":(-8.41,115.19),"瑞士":(46.82,8.23),"悉尼":(-33.87,151.21),
        "迪拜":(25.20,55.27),"曼谷":(13.75,100.52),"新加坡":(1.35,103.82),
        "首尔":(37.57,126.98),"罗马":(41.90,12.50),"巴塞罗那":(41.39,2.17),
    }
    coords = COORDS.get(city)
    if not coords:
        # 用 geocoding 查
        try:
            r = req.get(f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=zh&format=json", timeout=5)
            results = r.json().get("results", [])
            if results:
                coords = (results[0]["latitude"], results[0]["longitude"])
        except Exception:
            pass
    if not coords:
        return {"error": f"未找到城市 {city}"}

    try:
        lat, lon = coords
        r = req.get(
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}"
            f"&current=temperature_2m,weathercode,windspeed_10m,relative_humidity_2m,apparent_temperature"
            f"&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum"
            f"&timezone=auto&forecast_days={days}",
            timeout=20
        )
        data = r.json()
        cache_set(cache_key, data, ttl=1800)  # 缓存30分钟
        return data
    except Exception as e:
        return {"error": str(e)}


@router.get('/user/bookings/', description='获取用户所有订单')
def get_user_bookings(request: Request):
    from utils.cache_utils import cache_get, cache_set
    username = request.state.username
    cache_key = f"bookings:{username}"

    # 先查缓存
    cached = cache_get(cache_key)
    if cached:
        return cached

    passenger_id = _get_passenger_id(username)
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
    # 写入缓存 5 分钟
    from utils.cache_utils import cache_set
    cache_set(cache_key, result, ttl=300)
    return result


@router.delete('/chat/history/clear/', description='清除当前用户所有对话历史')
def clear_chat_history(request: Request):
    username = request.state.username
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM t_chat_history WHERE username = %s", (username,))
            conn.commit()
    except Exception as e:
        log.error(f"清除历史失败: {e}")
        return {'ok': False, 'error': str(e)}
    return {'ok': True}

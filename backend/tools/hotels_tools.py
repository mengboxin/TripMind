from datetime import date, datetime
from typing import Optional, Union
from langchain_core.tools import tool
from tools.location_trans import transform_location
from utils.db_utils import get_connection
from utils.log_utils import log

from langchain_core.runnables import RunnableConfig  # 记得导入


@tool
def fetch_user_hotel_bookings(config: RunnableConfig) -> list[dict]:
    """
    【查询我的酒店订单】
    查询当前用户所有已预订的酒店。

    返回：
    - 已预订酒店的详细信息列表。
    """

    log.info("查询用户酒店订单...")

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM hotels WHERE booked = 1")
                results = cursor.fetchall()

        log.info(f"查询到 {len(results)} 条酒店订单。")
        return results

    except Exception as e:
        log.exception("查询酒店订单失败")
        return []

@tool
def search_hotels(
        location: Optional[str] = None,
        name: Optional[str] = None
) -> list[dict]:
    """
    【搜索酒店】
    根据地点或名称查找符合条件的酒店信息。

    参数：
    - location (可选): 城市名称（支持中英文，如 "上海" 或 "Shanghai"），支持模糊匹配。
    - name (可选): 酒店名称关键字（模糊匹配）。

    返回：
    包含 `hotel_id`, `name`, `location`, `price`, `booked` 等字段的字典列表。
    若无结果，则返回空列表。

    注意事项：
    - 必须先调用此工具获取 `hotel_id` 才能进行后续预订操作。
    - 地点和名称参数可单独使用，也可组合使用以缩小搜索范围。
    """

    # 1. 记录搜索意图
    log.info(f"搜索酒店 - Location: {location}, Name: {name}")

    location = transform_location(location)

    # 构建 SQL (MySQL语法)
    query = "SELECT * FROM hotels WHERE 1=1"
    params = []

    if location:
        query += " AND location LIKE %s"
        params.append(f"%{location}%")
    if name:
        query += " AND name LIKE %s"
        params.append(f"%{name}%")

    # 调试日志：打印SQL和参数 (Debug级别)
    log.debug(f"SQL: {query} | Params: {params}")

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                results = cursor.fetchall()  # DictCursor 直接返回字典列表

        log.info(f"搜索完成，找到 {len(results)} 家酒店")
        return results

    except Exception as e:
        log.exception("搜索酒店时发生数据库错误")
        return []


@tool
def book_hotel(hotel_id: int) -> str:
    """
    【预订酒店】
    根据酒店 ID 预订指定酒店。

    参数：
    - hotel_id: 酒店的唯一标识符（需通过 [search_hotels]获取）。

    返回：
    - 成功时返回确认信息："Hotel {hotel_id} 成功预定。"
    - 失败时返回错误原因，如酒店不存在或已被预订。

    注意事项：
    - 酒店 ID 必须有效且未被预订。
    - 不要猜测或编造 ID，必须从搜索结果中获取。
    """

    log.info(f"尝试预订酒店 ID: {hotel_id}")

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                # 检查是否存在
                cursor.execute("SELECT id FROM hotels WHERE id = %s", (hotel_id,))
                if not cursor.fetchone():
                    msg = f"未找到ID为 {hotel_id} 的酒店。"
                    log.warning(msg)
                    return msg

                # 执行更新
                cursor.execute("UPDATE hotels SET booked = 1 WHERE id = %s", (hotel_id,))

            conn.commit()

            if cursor.rowcount > 0:
                msg = f"Hotel {hotel_id} 成功预定。"
                log.success(msg)
                return msg
            else:
                # 理论上前面检查过存在性，这里通常不会进，除非状态没变且MySQL配置不返回受影响行数
                msg = f"Hotel {hotel_id} 预订状态未改变（可能已被预订）。"
                log.warning(msg)
                return msg

    except Exception as e:
        log.exception(f"预订酒店 {hotel_id} 失败")
        return f"预订失败，系统错误: {str(e)}"


@tool
def update_hotel(
        hotel_id: int,
        checkin_date: Optional[Union[datetime, date]] = None,
        checkout_date: Optional[Union[datetime, date]] = None,
) -> str:
    """
    【更新酒店订单日期】
    修改已有酒店订单的入住或离店日期。

    参数：
    - hotel_id: 酒店订单的唯一标识符。
    - checkin_date (可选): 新的入住日期（格式：YYYY-MM-DD）。
    - checkout_date (可选): 新的离店日期（格式：YYYY-MM-DD）。

    返回：
    - 成功时返回确认信息："Hotel {hotel_id} 成功更新。"
    - 失败时返回错误原因，如订单不存在或日期未变化。

    注意事项：
    - 至少提供一个日期参数。
    - 若两个日期均未更改，操作将被视为无效。
    """

    log.info(f"更新酒店订单 ID: {hotel_id}, In: {checkin_date}, Out: {checkout_date}")

    if not checkin_date and not checkout_date:
        msg = "未提供需要更新的日期。"
        log.warning(msg)
        return msg

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                # 动态构建 SQL，合并为一次更新
                updates = []
                params = []

                if checkin_date:
                    updates.append("checkin_date = %s")
                    params.append(checkin_date)
                if checkout_date:
                    updates.append("checkout_date = %s")
                    params.append(checkout_date)

                params.append(hotel_id)

                sql = f"UPDATE hotels SET {', '.join(updates)} WHERE id = %s"

                cursor.execute(sql, params)

            conn.commit()

            if cursor.rowcount > 0:
                msg = f"Hotel {hotel_id} 成功更新。"
                log.success(msg)
                return msg
            else:
                msg = f"未找到ID为 {hotel_id} 的酒店，或日期未发生变化。"
                log.warning(msg)
                return msg

    except Exception as e:
        log.exception(f"更新酒店 {hotel_id} 失败")
        return f"更新失败，系统错误: {str(e)}"


@tool
def cancel_hotel(hotel_id: int) -> str:
    """
    【取消酒店预订】
    根据酒店 ID 取消已预订的酒店订单。

    参数：
    - hotel_id: 酒店订单的唯一标识符。

    返回：
    - 成功时返回确认信息："Hotel {hotel_id} 成功取消。"
    - 失败时返回错误原因，如订单未被预订或系统异常。

    注意事项：
    - 仅对已预订的订单生效。
    - 若订单已取消，再次调用将无效。
    """

    log.info(f"尝试取消酒店订单 ID: {hotel_id}")

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("UPDATE hotels SET booked = 0 WHERE id = %s", (hotel_id,))

            conn.commit()

            if cursor.rowcount > 0:
                msg = f"Hotel {hotel_id} 成功取消。"
                log.success(msg)
                return msg
            else:
                msg = f"未找到ID为 {hotel_id} 的酒店，或该订单已取消。"
                log.warning(msg)
                return msg

    except Exception as e:
        log.exception(f"取消酒店 {hotel_id} 失败")
        return f"取消失败，系统错误: {str(e)}"
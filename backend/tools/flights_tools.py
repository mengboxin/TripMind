import pytz
from datetime import date, datetime, timedelta
from typing import Optional, List, Dict
from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool
from utils.db_utils import get_connection

import random
import string
import json
from datetime import datetime
from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig
from utils.log_utils import log


# 辅助函数：生成随机的预订号 (6位)
def _generate_book_ref():
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))


# 辅助函数：生成随机的票号 (13位数字)
def _generate_ticket_no():
    return "".join(random.choices(string.digits, k=13))


@tool
def book_flight(
    flight_id: int,
    fare_conditions: str = "Economy",
    config: RunnableConfig = None
) -> str:
    """
    【预订新航班】
    直接为当前用户预订指定航班。
    无需提供姓名或联系方式，系统会自动使用当前用户ID。

    参数:
    - flight_id: 航班的唯一ID (例如 1234)。
    - fare_conditions: 舱位等级，默认为 Economy。
    """
    configuration = config.get("configurable", {})
    passenger_id = configuration.get("passenger_id", None)

    if not passenger_id:
        return "错误：未找到乘客ID，无法进行预订。"

    log.info(f"开始为乘客 {passenger_id} 预订航班 ID: {flight_id}")

    # 生成 ID
    book_ref = _generate_book_ref()
    ticket_no = _generate_ticket_no()
    book_date = datetime.now()
    amount = 1500.00 if fare_conditions == 'Economy' else 3500.00

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                # 1. 插入 bookings 表 (假设 bookings 表没变)
                insert_booking_sql = """
                INSERT INTO bookings (book_ref, book_date, total_amount)
                VALUES (%s, %s, %s)
                """
                cursor.execute(insert_booking_sql, (book_ref, book_date, amount))

                # 2. 插入 tickets 表 (✅ 只插入存在的 3 列)
                insert_ticket_sql = """
                INSERT INTO tickets (ticket_no, book_ref, passenger_id)
                VALUES (%s, %s, %s)
                """
                cursor.execute(insert_ticket_sql, (ticket_no, book_ref, passenger_id))

                # 3. 插入 ticket_flights 表 (假设没变)
                insert_tf_sql = """
                INSERT INTO ticket_flights (ticket_no, flight_id, fare_conditions, amount)
                VALUES (%s, %s, %s, %s)
                """
                cursor.execute(insert_tf_sql, (ticket_no, flight_id, fare_conditions, amount))

            conn.commit()

        success_msg = (
            f"✅ 预订成功！\n"
            f"预订号: {book_ref}\n"
            f"票号: {ticket_no}\n"
            f"航班ID: {flight_id}\n"
            f"已关联至您的账户 ID: {passenger_id}。"
        )
        log.info(success_msg)
        return success_msg

    except Exception as e:
        log.error(f"预订失败: {e}")
        return f"系统错误，预订未能完成: {str(e)}"

@tool
def fetch_user_flight_information(config: RunnableConfig) -> List[Dict]:
    """
    【获取用户当前订单】
    根据当前用户的 ID，检索其所有**已预订**的机票详情。

    参数：
    - config (RunnableConfig): 包含用户配置信息，必须包含 `passenger_id`。

    返回：
    - List[Dict]: 包含机票号 (`ticket_no`)、航班号 (`flight_no`)、出发/到达机场、起降时间、舱位等级等信息的字典列表。
    - 若无数据则返回空列表。

    使用场景：
    - 用户询问“我的航班是什么时候？”或“我有预订吗？”时。
    - 需要获取 `ticket_no` 进行改签或退票操作前。

    注意事项：
    - 必须确保 `passenger_id` 已正确配置，否则会抛出异常。
    """

    configuration = config.get("configurable", {})
    passenger_id = configuration.get("passenger_id", None)

    if not passenger_id:
        log.error("fetch_user_flight_information: 未配置乘客 ID")
        raise ValueError("未配置乘客 ID。")

    log.info(f"开始获取乘客 {passenger_id} 的航班信息")

    # SQL查询语句 (MySQL 语法)
    # 注意：JOIN 逻辑保持不变
    query = """
            SELECT t.ticket_no, \
                   t.book_ref, \
                   f.flight_id, \
                   f.flight_no, \
                   f.departure_airport, \
                   f.arrival_airport, \
                   f.scheduled_departure, \
                   f.scheduled_arrival, \
                   bp.seat_no, \
                   tf.fare_conditions
            FROM tickets t \
                     JOIN ticket_flights tf ON t.ticket_no = tf.ticket_no \
                     JOIN flights f ON tf.flight_id = f.flight_id \
                     LEFT JOIN boarding_passes bp ON bp.ticket_no = t.ticket_no AND bp.flight_id = f.flight_id
            WHERE t.passenger_id = %s \
            """
    # 注意：这里加了一个 LEFT JOIN boarding_passes，防止没换登机牌时查不到机票信息，
    # 原代码是 JOIN (INNER JOIN)，如果业务逻辑必须已值机才能查到，请改回 JOIN

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, (passenger_id,))
                results = cursor.fetchall()  # DictCursor 直接返回字典列表

        log.info(f"成功获取乘客 {passenger_id} 的 {len(results)} 条航班记录")
        return results

    except Exception as e:
        log.exception(f"获取乘客 {passenger_id} 航班信息时发生错误")
        return []


@tool
def search_flights(
        departure_airport: Optional[str] = None,
        arrival_airport: Optional[str] = None,
        start_time: Optional[date | datetime] = None,
        end_time: Optional[date | datetime] = None,
        limit: int = 20,
) -> List[Dict]:
    """
    【搜索新航班】
    查询数据库中的可用航班列表，支持多条件筛选。

    参数：
    - departure_airport (str, 可选): 出发机场代码（如 PEK、SHA）或城市名称。
    - arrival_airport (str, 可选): 到达机场代码或城市名称。
    - start_time (date/datetime, 可选): 期望出发时间范围的开始（格式：YYYY-MM-DD）。
    - end_time (date/datetime, 可选): 期望出发时间范围的结束（格式：YYYY-MM-DD）。
    - limit (int, 默认 20): 返回结果的最大数量。

    返回：
    - List[Dict]: 符合条件的航班信息列表，包含航班 ID、出发/到达机场、计划起降时间等字段。
    - 若无数据则返回空列表。

    注意事项：
    - 此工具仅用于查找航班，不执行预订操作。
    - 时间参数需为合法的日期或时间对象。
    """

    log.info(f"搜索航班 - Dep: {departure_airport}, Arr: {arrival_airport}, Start: {start_time}, End: {end_time}")

    query = "SELECT * FROM flights WHERE 1 = 1"
    params = []

    if departure_airport:
        query += " AND departure_airport = %s"
        params.append(departure_airport)

    if arrival_airport:
        query += " AND arrival_airport = %s"
        params.append(arrival_airport)

    if start_time:
        query += " AND scheduled_departure >= %s"
        params.append(start_time)

    if end_time:
        query += " AND scheduled_departure <= %s"
        params.append(end_time)

    query += " LIMIT %s"
    params.append(limit)

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                results = cursor.fetchall()

        log.info(f"航班搜索完成，找到 {len(results)} 条结果")
        return results

    except Exception as e:
        log.exception("搜索航班时发生数据库错误")
        return []


@tool
def update_ticket_to_new_flight(
        ticket_no: str, new_flight_id: int, *, config: RunnableConfig
) -> str:
    """
    【航班改签】
    将用户的现有机票更改为新的航班。

    前置条件：
    1. 必须通过 [fetch_user_flight_information]获取用户的 `ticket_no`。
    2. 必须通过 [search_flights]获取目标航班的 `new_flight_id`。
    3. 新航班的起飞时间必须在当前时间 3 小时之后，否则无法改签。

    参数：
    - ticket_no (str): 待改签的机票编号。
    - new_flight_id (int): 目标航班的唯一标识符。
    - config (RunnableConfig): 包含用户配置信息，必须包含 `passenger_id`。

    返回：
    - str: 改签成功或失败的详细提示信息。

    注意事项：
    - 若新航班起飞时间不足 3 小时，改签会被拒绝。
    - 仅允许机票持有者本人操作。
    """

    configuration = config.get("configurable", {})
    passenger_id = configuration.get("passenger_id", None)

    if not passenger_id:
        log.error("update_ticket: 未配置乘客 ID")
        raise ValueError("未配置乘客 ID。")

    log.info(f"请求改签: 乘客 {passenger_id}, 机票 {ticket_no} -> 新航班 {new_flight_id}")

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                # 1. 查询新航班信息
                cursor.execute(
                    "SELECT departure_airport, arrival_airport, scheduled_departure FROM flights WHERE flight_id = %s",
                    (new_flight_id,),
                )
                new_flight = cursor.fetchone()  # 返回字典

                if not new_flight:
                    msg = "提供的新的航班 ID 无效。"
                    log.warning(f"改签失败: {msg}")
                    return msg

                # 2. 时间验证逻辑
                # PyMySQL 通常返回 datetime 对象，但也可能是字符串，做个兼容处理
                dep_time_raw = new_flight["scheduled_departure"]
                timezone = pytz.timezone("Etc/GMT-3")

                if isinstance(dep_time_raw, str):
                    # 如果是字符串，尝试解析
                    try:
                        departure_time = datetime.strptime(dep_time_raw, "%Y-%m-%d %H:%M:%S.%f%z")
                    except ValueError:
                        # 尝试不带时区的解析，然后加上时区
                        departure_time = datetime.strptime(dep_time_raw, "%Y-%m-%d %H:%M:%S")
                        departure_time = timezone.localize(departure_time)
                elif isinstance(dep_time_raw, datetime):
                    # 如果已经是 datetime 对象
                    departure_time = dep_time_raw
                    if departure_time.tzinfo is None:
                        # 如果是 naive datetime (MySQL 默认)，加上时区
                        departure_time = timezone.localize(departure_time)
                else:
                    log.error(f"未知的日期格式: {type(dep_time_raw)}")
                    return "系统内部日期格式错误。"

                current_time = datetime.now(tz=timezone)
                time_until = (departure_time - current_time).total_seconds()

                if time_until < (3 * 3600):
                    msg = f"不允许重新安排到距离当前时间少于 3 小时的航班。所选航班时间为 {departure_time}。"
                    log.warning(f"改签被拒绝: 时间不足 3 小时 ({time_until / 3600:.2f}h)")
                    return msg

                # 3. 确认原机票存在性
                cursor.execute(
                    "SELECT flight_id FROM ticket_flights WHERE ticket_no = %s", (ticket_no,)
                )
                if not cursor.fetchone():
                    msg = "未找到给定机票号码的现有机票。"
                    log.warning(msg)
                    return msg

                # 4. 验证乘客身份
                cursor.execute(
                    "SELECT * FROM tickets WHERE ticket_no = %s AND passenger_id = %s",
                    (ticket_no, passenger_id),
                )
                if not cursor.fetchone():
                    msg = f"当前登录的乘客 ID 为 {passenger_id}，不是机票 {ticket_no} 的拥有者。"
                    log.warning(f"改签拒绝: 权属验证失败 ({msg})")
                    return msg

                # 5. 更新机票信息
                cursor.execute(
                    "UPDATE ticket_flights SET flight_id = %s WHERE ticket_no = %s",
                    (new_flight_id, ticket_no),
                )

            # 提交事务
            conn.commit()

            log.success(f"机票 {ticket_no} 成功改签至航班 {new_flight_id}")
            return "机票已成功更新为新的航班。"

    except Exception as e:
        log.exception(f"改签机票 {ticket_no} 时发生异常")
        return "处理改签请求时发生系统错误。"


@tool
def cancel_ticket(ticket_no: str, *, config: RunnableConfig) -> str:
    """
    【取消机票/退票】
    取消用户的机票并从数据库中移除相关记录。
    """
    configuration = config.get("configurable", {})
    passenger_id = configuration.get("passenger_id", None)

    if not passenger_id:
        return "错误：未配置乘客ID。"

    log.info(f"请求退票: 乘客 {passenger_id}, 机票 {ticket_no}")

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                # 1. 验证机票是否属于当前用户
                # 【修改点】：SELECT ticket_no，不要查 flight_id
                check_sql = "SELECT ticket_no FROM tickets WHERE ticket_no = %s AND passenger_id = %s"
                cursor.execute(check_sql, (ticket_no, passenger_id))

                if not cursor.fetchone():
                    msg = f"退票失败：未找到属于乘客 {passenger_id} 的机票 {ticket_no}。"
                    log.warning(msg)
                    return msg

                # 2. 删除 ticket_flights 表中的关联 (必须先删子表)
                # 这一步删除航班关联
                del_tf_sql = "DELETE FROM ticket_flights WHERE ticket_no = %s"
                cursor.execute(del_tf_sql, (ticket_no,))

                # 3. 删除 tickets 表中的记录 (再删主表)
                # 这一步删除票据本身
                del_t_sql = "DELETE FROM tickets WHERE ticket_no = %s"
                cursor.execute(del_t_sql, (ticket_no,))

            conn.commit()

            msg = f"机票 {ticket_no} 已成功取消。"
            log.info(msg)
            return msg

    except Exception as e:
        log.error(f"取消机票失败: {e}")
        return f"系统错误: {str(e)}"
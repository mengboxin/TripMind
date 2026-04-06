import pymysql
from datetime import date, datetime
from typing import Optional, Union
from langchain_core.tools import tool
from tools.location_trans import transform_location
from utils.db_utils import get_connection
from utils.log_utils import log

from langchain_core.runnables import RunnableConfig


@tool
def fetch_user_car_bookings(config: RunnableConfig) -> list[dict]:
    """
    【查询我的租车订单】
    查询当前用户所有已预订的租车服务。

    返回：
    - 已预订租车的详细信息列表。
    """
    log("查询用户租车订单...", "INFO")

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                # 同样的逻辑：只查 booked=1
                cursor.execute("SELECT * FROM car_rentals WHERE booked = 1")
                results = cursor.fetchall()

        log(f"查询到 {len(results)} 条租车订单。", "INFO")
        return results

    except Exception as e:
        log(f"查询租车订单失败: {str(e)}", "ERROR")
        return []

@tool
def search_car_rentals(
        location: Optional[str] = None,
        name: Optional[str] = None
) -> list[dict]:
    """
    【搜索租车服务】
    查找指定地点的可用租车服务。

    参数：
    - location (可选): 取车地点/城市（支持中英文）。
    - name (可选): 租车公司名称或车型关键字（模糊匹配）。

    返回：
    包含 `rental_id`, `company`, `car_type`, `price`, `booked` 等字段的字典列表。
    若无结果，则返回空列表。

    注意事项：
    - 支持地点和名称的联合筛选。
    - 结果按匹配度排序。
    """

    # 1. 记录搜索请求
    log(f"开始搜索租车信息 - Location: {location}, Name: {name}", "INFO")

    location = transform_location(location)

    query = "SELECT * FROM car_rentals WHERE 1=1"
    params = []

    if location:
        query += " AND location LIKE %s"
        params.append(f"%{location}%")
    if name:
        query += " AND name LIKE %s"
        params.append(f"%{name}%")

    results = []

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                results = cursor.fetchall()

        # 2. 记录搜索结果数量
        log(f"搜索完成，找到 {len(results)} 条结果", "INFO")

    except Exception as e:
        # 3. 记录异常
        log(f"搜索租车信息时发生错误: {str(e)}", "ERROR")
        return []

    return results


@tool
def book_car_rental(rental_id: int) -> str:
    """
    【预订租车服务】
    根据租车服务 ID 预订指定的租车服务。

    参数：
    - rental_id: 租车服务的唯一标识符（需通过 [search_car_rentals]获取）。

    返回：
    - 成功时返回确认信息："汽车租赁 {rental_id} 成功预订。"
    - 失败时返回错误原因，如服务不存在或已被预订。

    注意事项：
    - 租车服务 ID 必须有效。
    - 不要猜测或编造 ID，必须从搜索结果中获取。
    """

    # 记录操作意图
    log(f"尝试预订租车服务 ID: {rental_id}", "INFO")

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                sql = "UPDATE car_rentals SET booked = 1 WHERE id = %s"
                cursor.execute(sql, (rental_id,))

            conn.commit()

            if cursor.rowcount > 0:
                msg = f"汽车租赁 {rental_id} 成功预订。"
                log(msg, "INFO")  # 记录成功
                return msg
            else:
                msg = f"未找到ID为 {rental_id} 的汽车租赁服务，或该服务状态未改变。"
                log(msg, "WARNING")  # 记录业务警告
                return msg

    except Exception as e:
        err_msg = f"预订失败，发生数据库错误: {str(e)}"
        log(err_msg, "ERROR")  # 记录系统错误
        return err_msg


@tool
def update_car_rental(
        rental_id: int,
        start_date: Optional[Union[datetime, date]] = None,
        end_date: Optional[Union[datetime, date]] = None,
) -> str:
    """
    【更新租车订单日期】
    修改已有租车订单的开始或结束日期。

    参数：
    - rental_id: 租车订单的唯一标识符。
    - start_date (可选): 新的开始日期（格式：YYYY-MM-DD）。
    - end_date (可选): 新的结束日期（格式：YYYY-MM-DD）。

    返回：
    - 成功时返回确认信息："汽车租赁 {rental_id} 成功更新。"
    - 失败时返回错误原因，如订单不存在或日期未变化。

    注意事项：
    - 至少提供一个日期参数。
    - 若两个日期均未更改，操作将被视为无效。
    """

    # 记录更新请求
    log(f"尝试更新租车 ID: {rental_id}, Start: {start_date}, End: {end_date}", "INFO")

    if not start_date and not end_date:
        msg = "未提供需要更新的日期。"
        log(f"更新失败: {msg}", "WARNING")
        return msg

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                updates = []
                params = []

                if start_date:
                    updates.append("start_date = %s")
                    params.append(start_date)
                if end_date:
                    updates.append("end_date = %s")
                    params.append(end_date)

                params.append(rental_id)

                sql = f"UPDATE car_rentals SET {', '.join(updates)} WHERE id = %s"

                cursor.execute(sql, params)

            conn.commit()

            if cursor.rowcount > 0:
                msg = f"汽车租赁 {rental_id} 成功更新。"
                log(msg, "INFO")
                return msg
            else:
                msg = f"未找到ID为 {rental_id} 的汽车租赁服务。"
                log(msg, "WARNING")
                return msg

    except Exception as e:
        err_msg = f"更新失败，发生数据库错误: {str(e)}"
        log(err_msg, "ERROR")
        return err_msg


@tool
def cancel_car_rental(rental_id: int) -> str:
    """
    【取消租车服务】
    根据租车服务 ID 取消已预订的租车服务。

    参数：
    - rental_id: 租车服务的唯一标识符。

    返回：
    - 成功时返回确认信息："汽车租赁 {rental_id} 成功取消。"
    - 失败时返回错误原因，如服务未被预订或系统异常。

    注意事项：
    - 仅对已预订的服务生效。
    - 若服务已取消，再次调用将无效。
    """

    log(f"尝试取消租车服务 ID: {rental_id}", "INFO")

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                sql = "UPDATE car_rentals SET booked = 0 WHERE id = %s"
                cursor.execute(sql, (rental_id,))

            conn.commit()

            if cursor.rowcount > 0:
                msg = f"汽车租赁 {rental_id} 成功取消。"
                log(msg, "INFO")
                return msg
            else:
                msg = f"未找到ID为 {rental_id} 的汽车租赁服务。"
                log(msg, "WARNING")
                return msg

    except Exception as e:
        err_msg = f"取消失败，发生数据库错误: {str(e)}"
        log(err_msg, "ERROR")
        return err_msg
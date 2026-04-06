from typing import Optional, List

from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool
from utils.db_utils import get_connection
from tools.location_trans import transform_location
from utils.log_utils import log


@tool
def fetch_user_trip_bookings(config: RunnableConfig) -> list[dict]:
    """
    【查询我的旅行订单】
    查询当前用户所有已预订的旅行/游览活动。
    """
    log("查询用户旅行订单...", "INFO")

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM trip_recommendations WHERE booked = 1")
                results = cursor.fetchall()

        log(f"查询到 {len(results)} 条旅行订单。", "INFO")
        return results

    except Exception as e:
        log(f"查询旅行订单失败: {str(e)}", "ERROR")
        return []

@tool
def search_trip_recommendations(
        location: Optional[str] = None,
        name: Optional[str] = None,
        keywords: Optional[str] = None,
) -> List[dict]:
    """
    【搜索旅行建议/景点】
    根据指定条件查找符合条件的旅游景点、活动或推荐行程。

    参数：
    - location (可选): 城市或地区名称（支持中英文，如 "北京" 或 "Beijing"）。
    - name (可选): 景点名称关键字（模糊匹配）。
    - keywords (可选): 描述性关键词（如 "博物馆, 户外, 美食"），多个关键词请用逗号分隔。

    返回：
    包含 `recommendation_id`, `name`, `details`, `location`, `keywords` 等字段的字典列表。
    若无结果，则返回空列表。

    注意事项：
    - 若同时提供多个参数，系统将进行联合筛选。
    - 关键词匹配为模糊搜索，支持部分匹配。
    """

    log.info(f"搜索旅行建议 - Loc: {location}, Name: {name}, Keywords: {keywords}")

    location = transform_location(location)

    # 构建 SQL (MySQL 语法)
    query = "SELECT * FROM trip_recommendations WHERE 1=1"
    params = []

    if location:
        query += " AND location LIKE %s"
        params.append(f"%{location}%")

    if name:
        query += " AND name LIKE %s"
        params.append(f"%{name}%")

    if keywords:
        # 处理关键词列表 logic
        keyword_list = [k.strip() for k in keywords.split(",") if k.strip()]
        if keyword_list:
            # 动态构建 OR 子句: (keywords LIKE %s OR keywords LIKE %s ...)
            keyword_conditions = " OR ".join(["keywords LIKE %s" for _ in keyword_list])
            query += f" AND ({keyword_conditions})"
            # 将每个关键词包装成 %keyword% 形式加入参数列表
            params.extend([f"%{k}%" for k in keyword_list])

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                results = cursor.fetchall()  # DictCursor 返回字典列表

        log.info(f"搜索完成，找到 {len(results)} 个旅行建议")
        return results

    except Exception as e:
        log.exception("搜索旅行建议时发生数据库错误")
        return []


@tool
def book_excursion(recommendation_id: int) -> str:
    """
    【预订旅行项目】
    通过唯一的推荐 ID 预订指定的旅行项目。

    参数：
    - recommendation_id: 旅行项目的唯一标识符（需通过 [search_trip_recommendations]获取）。

    返回：
    - 成功时返回确认信息："旅行推荐 {recommendation_id} 成功预定。"
    - 失败时返回错误原因，如项目不存在或系统异常。

    注意事项：
    - 推荐 ID 必须有效，否则预订失败。
    - 已被预订的项目不可重复预订。
    """

    log.info(f"尝试预订旅行建议 ID: {recommendation_id}")

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                # 检查是否存在
                cursor.execute("SELECT id FROM trip_recommendations WHERE id = %s", (recommendation_id,))
                if not cursor.fetchone():
                    msg = f"未找到ID为 {recommendation_id} 的旅行推荐。"
                    log.warning(msg)
                    return msg

                # 执行更新
                cursor.execute(
                    "UPDATE trip_recommendations SET booked = 1 WHERE id = %s", (recommendation_id,)
                )

            conn.commit()

            if cursor.rowcount > 0:
                msg = f"旅行推荐 {recommendation_id} 成功预定。"
                log.success(msg)
                return msg
            else:
                msg = f"旅行推荐 {recommendation_id} 状态未改变。"
                log.warning(msg)
                return msg

    except Exception as e:
        log.exception(f"预订旅行建议 {recommendation_id} 失败")
        return f"预订失败，系统错误: {str(e)}"


@tool
def update_excursion(recommendation_id: int, details: str) -> str:
    """
    【更新旅行推荐信息】
    根据推荐 ID 更新旅行项目的详细信息。

    参数：
    - recommendation_id: 旅行项目的唯一标识符。
    - details: 新的详细描述内容（字符串形式）。

    返回：
    - 成功时返回确认信息："旅行推荐 {recommendation_id} 成功更新。"
    - 失败时返回错误原因，如项目不存在或系统异常。

    注意事项：
    - 仅支持更新 `details` 字段。
    - 若项目不存在，操作将失败。
    """

    log.info(f"更新旅行建议 ID: {recommendation_id}, Details: {details[:20]}...")

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "UPDATE trip_recommendations SET details = %s WHERE id = %s",
                    (details, recommendation_id),
                )

            conn.commit()

            if cursor.rowcount > 0:
                msg = f"旅行推荐 {recommendation_id} 成功更新。"
                log.success(msg)
                return msg
            else:
                msg = f"未找到ID为 {recommendation_id} 的旅行推荐。"
                log.warning(msg)
                return msg

    except Exception as e:
        log.exception(f"更新旅行建议 {recommendation_id} 失败")
        return f"更新失败，系统错误: {str(e)}"


@tool
def cancel_excursion(recommendation_id: int) -> str:
    """
    【取消旅行预订】
    根据推荐 ID 取消已预订的旅行项目。

    参数：
    - recommendation_id: 旅行项目的唯一标识符。

    返回：
    - 成功时返回确认信息："旅行推荐 {recommendation_id} 成功取消。"
    - 失败时返回错误原因，如项目未被预订或系统异常。

    注意事项：
    - 仅对已预订的项目生效。
    - 若项目未被预订，操作将被视为无效。
    """

    log.info(f"取消旅行建议预订 ID: {recommendation_id}")

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "UPDATE trip_recommendations SET booked = 0 WHERE id = %s", (recommendation_id,)
                )

            conn.commit()

            if cursor.rowcount > 0:
                msg = f"旅行推荐 {recommendation_id} 成功取消。"
                log.success(msg)
                return msg
            else:
                msg = f"未找到ID为 {recommendation_id} 的旅行推荐，或未被预订。"
                log.warning(msg)
                return msg

    except Exception as e:
        log.exception(f"取消旅行建议 {recommendation_id} 失败")
        return f"取消失败，系统错误: {str(e)}"
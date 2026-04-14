"""
数据库时间更新工具
只更新 flights 和 bookings 表的时间字段，使用 UPDATE 语句，不会删除任何表。
"""
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from utils.log_utils import log

load_dotenv()


def update_dates():
    """
    将 flights 表的时间整体偏移到当前时间附近。
    使用纯 SQL UPDATE，不读取全表，不删除任何表。
    """
    log("开始执行数据库日期更新任务...", "INFO")

    try:
        import pymysql
        conn = pymysql.connect(
            host=os.getenv("DB_HOST", "127.0.0.1"),
            port=int(os.getenv("DB_PORT", 3306)),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_DATABASE", "ctrip_assistant"),
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor,
        )

        with conn:
            with conn.cursor() as cur:
                # 1. 查询 flights 表中最大的 scheduled_departure
                cur.execute("SELECT MAX(scheduled_departure) as max_dep FROM flights")
                row = cur.fetchone()
                if not row or not row.get("max_dep"):
                    log("flights 表为空或无有效时间数据，跳过更新。", "ERROR")
                    return

                max_dep = row["max_dep"]
                if isinstance(max_dep, str):
                    max_dep = datetime.fromisoformat(max_dep)

                now = datetime.now()
                # 计算偏移天数（整数天，避免小数精度问题）
                diff_days = (now - max_dep).days
                if abs(diff_days) < 1:
                    log("时间偏移不足1天，无需更新。", "INFO")
                    return

                log(f"时间偏移量: {diff_days} 天（基准时间: {max_dep}）", "INFO")

                # 2. 只更新 flights 表的时间字段（用 DATE_ADD，不删表）
                time_cols = ["scheduled_departure", "scheduled_arrival", "actual_departure", "actual_arrival"]
                for col in time_cols:
                    cur.execute(f"""
                        UPDATE flights
                        SET {col} = DATE_ADD({col}, INTERVAL %s DAY)
                        WHERE {col} IS NOT NULL
                    """, (diff_days,))
                    log(f"flights.{col} 更新完成，影响 {cur.rowcount} 行", "INFO")

                # 3. 更新 bookings 表的 book_date
                cur.execute("""
                    UPDATE bookings
                    SET book_date = DATE_ADD(book_date, INTERVAL %s DAY)
                    WHERE book_date IS NOT NULL
                """, (diff_days,))
                log(f"bookings.book_date 更新完成，影响 {cur.rowcount} 行", "INFO")

            conn.commit()
            log("SUCCESS: 数据库日期已成功更新。", "INFO")

    except Exception as e:
        import traceback
        traceback.print_exc()
        log(f"数据库更新任务发生错误: {e}", "ERROR")


if __name__ == '__main__':
    update_dates()

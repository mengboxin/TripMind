import os
import pandas as pd
from sqlalchemy import text
from dotenv import load_dotenv
from utils.db_utils import get_sqlalchemy_engine
from utils.log_utils import log

load_dotenv()


def update_dates():
    """
    连接 MySQL，读取数据，将时间更新为当前时间，然后覆盖回数据库。
    """
    log("开始执行数据库日期重置任务...", "INFO")

    engine = get_sqlalchemy_engine()
    db_name = os.getenv("DB_DATABASE", "ctrip_assistant")

    try:
        with engine.connect() as conn:
            log(f"已连接到数据库: {db_name}", "INFO")

            # 1. 获取所有表名
            query = text(f"SELECT table_name FROM information_schema.tables WHERE table_schema = '{db_name}'")
            df_tables = pd.read_sql(query, conn)

            if df_tables.empty:
                log("错误: 数据库中未找到任何表，任务终止。", "ERROR")
                return

            tables = df_tables.iloc[:, 0].tolist()
            log(f"检测到数据表: {tables}", "INFO")

            # 2. 读取数据
            tdf = {}
            for t in tables:
                tdf[t] = pd.read_sql(text(f"SELECT * FROM {t}"), conn)
            log("所有表数据读取完成。", "INFO")

        # 3. 计算时间偏移量
        if "flights" not in tdf or tdf["flights"].empty:
            log("flights 表缺失或为空，无法计算时间偏移。", "ERROR")
            return

        actual_dep = tdf["flights"]["actual_departure"].astype(str).replace(r"\\N", pd.NaT, regex=True)
        example_time = pd.to_datetime(actual_dep).max()

        if pd.isna(example_time):
            log("flights 表中无有效时间数据。", "ERROR")
            return

        if example_time.tz is not None:
            current_time = pd.to_datetime("now", utc=True).tz_convert(example_time.tz)
        else:
            current_time = pd.to_datetime("now")

        time_diff = current_time - example_time
        log(f"计算出的时间偏移量: {time_diff} (基准时间: {example_time})", "INFO")

        # 4. 更新内存中的日期数据
        if "bookings" in tdf:
            tdf["bookings"]["book_date"] = (
                    pd.to_datetime(tdf["bookings"]["book_date"].astype(str).replace(r"\\N", pd.NaT, regex=True),
                                   utc=True) + time_diff
            )

        datetime_cols = ["scheduled_departure", "scheduled_arrival", "actual_departure", "actual_arrival"]
        for col in datetime_cols:
            if col in tdf["flights"].columns:
                tdf["flights"][col] = (
                        pd.to_datetime(tdf["flights"][col].astype(str).replace(r"\\N", pd.NaT, regex=True)) + time_diff
                )

        # 5. 回写数据
        log("开始回写数据到数据库...", "INFO")
        for table_name, df in tdf.items():
            df.to_sql(
                name=table_name,
                con=engine,
                if_exists="replace",
                index=False,
                chunksize=500
            )
            log(f"表 {table_name} 更新完毕 (Rows: {len(df)})", "INFO")
            del df

        log("SUCCESS: 数据库日期已成功更新至最新时间。", "INFO")

    except Exception as e:
        import traceback
        traceback.print_exc()
        log(f"数据库更新任务发生严重错误: {e}", "ERROR")
    finally:
        engine.dispose()


if __name__ == '__main__':
    update_dates()
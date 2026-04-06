import os
import pymysql
from dotenv import load_dotenv

# 加载一次环境变量
load_dotenv()


def get_connection():
    """
    获取一个纯净的 pymysql 连接对象 (用于业务工具)
    使用 DictCursor，这样查询结果直接就是字典 {'id': 1, 'name': 'xxx'}
    """
    return pymysql.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        port=int(os.getenv("DB_PORT", 3306)),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_DATABASE", "ctrip_assistant"),
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor,  # 重点：自动返回字典
        autocommit=False  # 建议手动 commit，更安全
    )


def get_sqlalchemy_engine():
    """
    获取 SQLAlchemy 引擎 (用于 init_db.py 这种需要配合 pandas 的场景)
    """
    from sqlalchemy import create_engine
    from urllib.parse import quote_plus

    password = quote_plus(os.getenv("DB_PASSWORD", ""))
    host = os.getenv("DB_HOST", "127.0.0.1")
    port = os.getenv("DB_PORT", "3306")
    user = os.getenv("DB_USER", "root")
    db_name = os.getenv("DB_DATABASE", "ctrip_assistant")

    db_url = f"mysql+pymysql://{user}:{password}@{host}:{port}/{db_name}?charset=utf8mb4"
    return create_engine(db_url, echo=False, pool_recycle=3600)
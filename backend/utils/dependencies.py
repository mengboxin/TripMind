from fastapi import Request
from sqlalchemy.orm import Session

from db import sm


def get_db(request: Request) -> Session:
    """
    session 依赖注入，每个请求独立 session，异常时自动回滚
    """
    session = sm()
    try:
        yield session
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

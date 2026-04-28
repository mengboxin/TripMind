import logging
import traceback

from fastapi import FastAPI
from fastapi.requests import Request
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException
from starlette.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

log = logging.getLogger('emp')


async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={'detail': exc.detail})


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Pydantic 参数校验失败"""
    errors = exc.errors()
    msg = errors[0].get('msg', '参数错误') if errors else '参数错误'
    return JSONResponse(status_code=422, content={'detail': msg})


async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    """数据库异常，不向客户端暴露细节"""
    log.error(f"数据库异常: {exc}\n" + traceback.format_exc())
    return JSONResponse(status_code=500, content={'detail': '数据库操作失败，请稍后重试'})


async def global_exception_handler(request: Request, exc: Exception):
    """兜底异常处理"""
    log.error(f"未捕获异常: {exc}\n" + traceback.format_exc())
    return JSONResponse(status_code=500, content={'detail': '服务器内部错误'})


def init_handler_errors(app: FastAPI):
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
    app.add_exception_handler(Exception, global_exception_handler)

import logging
import re
import traceback
from datetime import datetime
from typing import Callable

from fastapi import FastAPI
from fastapi.requests import Request
from fastapi.responses import Response
from fastapi.responses import JSONResponse
from jose import jwt, ExpiredSignatureError
from starlette import status

from config import settings

log = logging.getLogger('emp')


async def verify_token(request: Request, call_next: Callable) -> Response:
    auth_error = JSONResponse(
        {'detail': '非法的指令牌Token，请重新登录！'},
        status_code=status.HTTP_401_UNAUTHORIZED,
        headers={"WWW-Authenticate": "Bearer"}
    )

    # 使用 request.url.path 获取路径（原来的 request.get('path') 是错误用法）
    path: str = request.url.path

    # OPTIONS 预检请求直接放行
    if request.method == "OPTIONS":
        return await call_next(request)

    # 白名单匹配：使用 ^ 锚点防止路径前缀绕过
    for white_path in settings.WHITE_LIST:
        if re.match(r'^' + re.escape(white_path), path):
            return await call_next(request)

    # 从请求头读取 token
    authorization: str = request.headers.get('Authorization')
    if not authorization or ' ' not in authorization:
        return auth_error

    token: str = authorization.split(' ')[1]
    try:
        res_dict = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.ALGORITHM])
        sub = res_dict.get('sub', '')
        parts = sub.split(':')
        if len(parts) < 2 or not parts[1]:
            return auth_error

        username = parts[1]

        # token 过期检查（jose 的 decode 已经会抛 ExpiredSignatureError，这里是双重保险）
        if datetime.utcfromtimestamp(res_dict.get('exp', 0)) < datetime.utcnow():
            return auth_error

        request.state.username = username
        return await call_next(request)

    except ExpiredSignatureError:
        log.warning(f"Token 已过期: path={path}")
        return auth_error
    except Exception as e:
        log.error(f"Token 校验异常: {e}\n" + traceback.format_exc())
        return JSONResponse(
            {'detail': '服务器接口异常，请检查接口'},
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def init_middleware(app: FastAPI) -> None:
    app.middleware('http')(verify_token)

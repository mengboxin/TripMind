import uvicorn
from pathlib import Path
from fastapi import FastAPI, Depends
from starlette.staticfiles import StaticFiles
from config import settings
from utils import handler_error, cors, middlewares

from config.log_config import init_log
from api import routers
from utils.docs_oauth2 import MyOAuth2PasswordBearer

# static 目录在项目根目录（backend 的上一级）
STATIC_DIR = Path(__file__).parent.parent / "static"


def create_app() -> FastAPI:
    init_log()
    my_oauth2 = MyOAuth2PasswordBearer(tokenUrl="/api/auth/", schema="JWT")
    _app = FastAPI(dependencies=[Depends(my_oauth2)])
    if STATIC_DIR.exists():
        _app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="my_static")
    handler_error.init_handler_errors(_app)
    middlewares.init_middleware(_app)
    cors.init_cors(_app)
    routers.init_routers(_app)
    return _app


# 模块级 app，供 uvicorn main:app 使用
app = create_app()

if __name__ == "__main__":
    uvicorn.run(
        app="main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
    )

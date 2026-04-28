import uvicorn
from pathlib import Path
from fastapi import FastAPI, Depends
from fastapi.responses import FileResponse
from starlette.staticfiles import StaticFiles
from config import settings
from utils import handler_error, cors, middlewares

from config.log_config import init_log
from api import routers
from utils.docs_oauth2 import MyOAuth2PasswordBearer

# static 目录在项目根目录（backend 的上一级）
STATIC_DIR = Path(__file__).parent.parent / "static"

# 记录上次更新时间的文件
_LAST_UPDATE_FILE = Path(__file__).parent / ".last_db_update"


def _should_update_db() -> bool:
    """判断是否需要更新数据库时间（超过7天则更新）"""
    import time
    if not _LAST_UPDATE_FILE.exists():
        return True
    last = float(_LAST_UPDATE_FILE.read_text().strip())
    return (time.time() - last) > 7 * 24 * 3600


def _mark_updated():
    import time
    _LAST_UPDATE_FILE.write_text(str(time.time()))


def create_app() -> FastAPI:
    init_log()
    import os
    is_prod = os.getenv("EMP_ENV", "").lower() == "production"

    my_oauth2 = MyOAuth2PasswordBearer(tokenUrl="/api/auth/", schema="JWT")
    _app = FastAPI(
        dependencies=[Depends(my_oauth2)],
        # 生产环境关闭 Swagger UI 和 ReDoc，防止接口信息泄露
        docs_url=None if is_prod else "/docs",
        redoc_url=None if is_prod else "/redoc",
        openapi_url=None if is_prod else "/openapi.json",
    )
    if STATIC_DIR.exists():
        _app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="my_static")

    # 手机端两个效果页面路由
    @_app.get("/mobile/v1", include_in_schema=False)
    async def mobile_v1():
        return FileResponse(str(STATIC_DIR / "mobile_v1.html"))

    @_app.get("/mobile/v2", include_in_schema=False)
    async def mobile_v2():
        return FileResponse(str(STATIC_DIR / "mobile_v2.html"))

    handler_error.init_handler_errors(_app)
    middlewares.init_middleware(_app)
    cors.init_cors(_app)
    routers.init_routers(_app)

    # 启动时检查是否需要更新数据库时间
    @_app.on_event("startup")
    async def on_startup():
        if _should_update_db():
            import threading
            def run_update():
                try:
                    from tools.init_db import update_dates
                    update_dates()
                    _mark_updated()  # 只有成功才记录时间
                except Exception as e:
                    import logging
                    logging.getLogger("main").error(f"数据库时间更新失败: {e}")
            # 在后台线程执行，不阻塞启动
            threading.Thread(target=run_update, daemon=True).start()

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

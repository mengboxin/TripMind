from fastapi import APIRouter, FastAPI
from api.system_mgt import user_views
from api.graph_api import graph_views
from api.budget_api import budget_views


def router_v1():
    root_router = APIRouter()
    root_router.include_router(user_views.router, tags=['用户管理'])
    root_router.include_router(graph_views.router, tags=['工作流调用'])
    root_router.include_router(budget_views.router, tags=['预算管理'])
    return root_router


#主路由的初始化函数
def init_routers(app: FastAPI):
    app.include_router(router_v1(), prefix='/api')

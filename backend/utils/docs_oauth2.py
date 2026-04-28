import re
from typing import Optional

from fastapi.security import OAuth2PasswordBearer
from starlette.requests import Request

from config import settings


class MyOAuth2PasswordBearer(OAuth2PasswordBearer):
    '''
    docs文档的接口，如果需要登录后才能访问，需要添加OAuth2PasswordBearer的依赖才会展示登录入口，并且依赖了OAuth2PasswordBearer的接口
    才会带有登录信息
    全局添加OAuth2PasswordBearer依赖，则登录接口会陷入死循环，因为登录接口没有OAuth2PasswordBearer的信息
    重写OAuth2PasswordBearer，对于登录接口，或者指定的接口不读取OAuth2PasswordBearer，直接返回空字符串
    '''

    def __init__(self, tokenUrl: str, schema: str):
        """
        初始化函数
        :param tokenUrl:  接口文档中，表单提交请求的路由
        :param schema:  Token的实现技术，我们项目中采用JWT
        """
        super().__init__(
            tokenUrl=tokenUrl,
            scheme_name=schema,
            scopes=None,
            description=None,
            auto_error=True
        )

    async def __call__(self, request: Request) -> Optional[str]:
        """
        解析请求头中的token。 在接口文档中传递token的格式是固定的： Authorization： JWT token值
        :param request:
        :return:
        """
        path: str = request.url.path
        for request_path in settings.WHITE_LIST:
            if re.match(r'^' + re.escape(request_path), path):
                return ''
        return await super().__call__(request)

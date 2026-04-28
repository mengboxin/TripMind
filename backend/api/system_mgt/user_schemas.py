import re
from datetime import datetime
from typing import Union, List

from pydantic import BaseModel, Field, field_validator

from api.schemas import InDBMixin


class BaseUserSchema(BaseModel):
    username: str = Field(description='用户名', default=None, min_length=2, max_length=20)
    phone: Union[str, None] = Field(description='手机号', default=None)
    email: Union[str, None] = Field(description='邮箱', default=None)
    real_name: Union[str, None] = Field(description='真实姓名', default=None)
    icon: Union[str, None] = Field(description='头像', default=None)
    dept_id: Union[int, None] = Field(description='所属部门ID', default=None)

    @field_validator('phone', mode='before')
    @classmethod
    def validate_phone(cls, v):
        if v and not re.fullmatch(r'1[3-9]\d{9}', v):
            raise ValueError('手机号格式不正确')
        return v

    @field_validator('email', mode='before')
    @classmethod
    def validate_email(cls, v):
        if v and not re.fullmatch(r'[^@\s]+@[^@\s]+\.[^@\s]+', v):
            raise ValueError('邮箱格式不正确')
        return v


class GetUserList(BaseModel):
    username: str = Field(description='用户名', default=None)
    id: int = Field(description='用户ID', default=None)


class CreateOrUpdateUserSchema(BaseUserSchema):
    password: Union[str, None] = Field(description='密码', default=None)
    roles: Union[List[int], None] = Field(description='角色ID列表', default=None)
    passenger_id: Union[str, None] = Field(description='旅客ID', default=None)


class UserSchema(BaseUserSchema, InDBMixin):
    create_time: Union[datetime, None] = Field(description='创建时间', default=None)
    id: int = Field(description='用户ID', default=None)


class UserLoginSchema(BaseModel):
    username: str = Field(description='用户名')
    password: str = Field(description='密码')


class UserLoginRspSchema(UserSchema):
    token: str
    create_time: Union[datetime, None] = Field(description='注册时间', default=None)

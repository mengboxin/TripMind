import logging
import random
from typing import List, Union

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session
from starlette import status
from starlette.requests import Request

from api.system_mgt.user_schemas import (
    CreateOrUpdateUserSchema, UserSchema, UserLoginRspSchema,
    UserLoginSchema, GetUserList
)
from config import settings
from db.system_mgt.user_dao import UserDao
from utils.dependencies import get_db
from utils.email_utils import generate_otp, save_otp, verify_otp, send_otp_email
from utils.jwt_utils import create_token
from utils.password_hash import get_hashed_password, verify_password

router = APIRouter()
_dao = UserDao()
log = logging.getLogger('emp')

_AUTH_FAIL_MSG = '用户名或密码错误'


def _gen_unique_passenger_id(session) -> str:
    """生成不重复的 passenger_id"""
    from sqlalchemy import select
    from db.system_mgt.models import UserModel
    for _ in range(10):
        pid = f"{random.randint(1000, 9999)} {random.randint(100000, 999999)}"
        exists = session.execute(
            select(UserModel).where(UserModel.passenger_id == pid)
        ).scalars().first()
        if not exists:
            return pid
    raise HTTPException(status_code=500, detail="生成旅客ID失败，请重试")


# ── 用户 CRUD ─────────────────────────────────────────────

@router.get('/users/getUsers/', description='得到所有的用户信息', response_model=List[GetUserList])
def get_users(session: Session = Depends(get_db)):
    return _dao.get(session)


@router.get('/users/{pk}/', description='根据主键查询用户信息', response_model=UserSchema)
def get_by_id(pk: int, session: Session = Depends(get_db)):
    return _dao.get_by_id(session, pk)


class RegisterSchema(BaseModel):
    """注册专用 Schema：邮箱必填，用户名可选（默认取邮箱前缀）"""
    email: str
    otp: str
    password: str
    username: Union[str, None] = None   # 不填则自动用邮箱前缀
    phone: Union[str, None] = None
    real_name: Union[str, None] = None


@router.post('/register/', description='用户注册（邮箱验证码）', response_model=UserSchema)
def create(obj_in: RegisterSchema, session: Session = Depends(get_db)):
    # 校验邮箱验证码
    if not verify_otp('register', obj_in.email, obj_in.otp):
        raise HTTPException(status_code=400, detail='验证码错误或已过期')
    # 密码长度
    if len(obj_in.password) < 6:
        raise HTTPException(status_code=400, detail='密码至少6位')
    # 自动生成用户名
    username = (obj_in.username or obj_in.email.split('@')[0]).strip()
    # 用户名/邮箱唯一性检查
    if _dao.get_user_by_username(session, username):
        raise HTTPException(status_code=400, detail='用户名已存在，请换一个')
    from sqlalchemy import select
    from db.system_mgt.models import UserModel
    email_exists = session.execute(
        select(UserModel).where(UserModel.email == obj_in.email)
    ).scalars().first()
    if email_exists:
        raise HTTPException(status_code=400, detail='该邮箱已注册')
    user_data = CreateOrUpdateUserSchema(
        username=username,
        password=get_hashed_password(obj_in.password),
        email=obj_in.email,
        phone=obj_in.phone,
        real_name=obj_in.real_name,
    )
    user_data.passenger_id = _gen_unique_passenger_id(session)
    return _dao.create(session, user_data)
@router.post('/login/', description='用户登录（用户名或邮箱均可）', response_model=UserLoginRspSchema)
def login(obj_in: UserLoginSchema, session: Session = Depends(get_db)):
    # 先按用户名查，再按邮箱查
    user = _dao.get_user_by_username(session, obj_in.username)
    if not user:
        from sqlalchemy import select
        from db.system_mgt.models import UserModel
        user = session.execute(
            select(UserModel).where(UserModel.email == obj_in.username)
        ).scalars().first()
    if not user or not verify_password(obj_in.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=_AUTH_FAIL_MSG)
    return {
        'id': user.id,
        'username': user.username,
        'phone': user.phone,
        'real_name': user.real_name,
        'token': create_token(str(user.id) + ':' + user.username),
        'create_time': user.create_time.isoformat() if user.create_time else None,
        'passenger_id': user.passenger_id or '',
    }


@router.post('/auth/', description='接口文档认证表单')
def auth(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_db)):
    user = _dao.get_user_by_username(session, form_data.username)
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=_AUTH_FAIL_MSG)
    return {
        'access_token': create_token(str(user.id) + ':' + user.username),
        'token_type': 'bearer'
    }


@router.patch('/users/{pk}/', response_model=UserSchema, description='修改用户信息')
def patch(pk: int, obj_in: CreateOrUpdateUserSchema, session: Session = Depends(get_db)):
    return _dao.update(session, pk, obj_in)


@router.post('/users/delete/', description='批量删除用户')
def delete(ids: List[int], session: Session = Depends(get_db)):
    return _dao.deletes(session, ids)


# ── 发送验证码（公开接口，白名单放行）────────────────────────

class SendOtpSchema(BaseModel):
    email: str
    scene: str  # change_pwd | reset_pwd

    @field_validator('scene')
    @classmethod
    def validate_scene(cls, v):
        if v not in ('register', 'change_pwd', 'reset_pwd'):
            raise ValueError('scene 只能是 register、change_pwd 或 reset_pwd')
        return v


@router.post('/send_otp/', description='发送邮箱验证码')
def send_otp(obj_in: SendOtpSchema):
    code = generate_otp()
    try:
        save_otp(obj_in.scene, obj_in.email, code)
        send_otp_email(obj_in.email, code, obj_in.scene)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {'ok': True, 'msg': f'验证码已发送至 {obj_in.email}'}


# ── 修改密码（需登录）────────────────────────────────────────

class ChangePwdSchema(BaseModel):
    email: str       # 用于接收验证码的邮箱（需与账号绑定一致）
    otp: str         # 邮箱验证码
    new_password: str


@router.post('/user/change_password/', description='修改密码（需登录 + 邮箱验证码）')
def change_password(obj_in: ChangePwdSchema, request: Request, session: Session = Depends(get_db)):
    username = request.state.username
    user = _dao.get_user_by_username(session, username)
    if not user:
        raise HTTPException(status_code=404, detail='用户不存在')
    # 校验邮箱与账号绑定一致
    if not user.email or user.email.strip().lower() != obj_in.email.strip().lower():
        raise HTTPException(status_code=400, detail='邮箱与账号不匹配')
    # 校验 OTP
    if not verify_otp('change_pwd', obj_in.email, obj_in.otp):
        raise HTTPException(status_code=400, detail='验证码错误或已过期')
    if len(obj_in.new_password) < 6:
        raise HTTPException(status_code=400, detail='新密码至少6位')
    _dao.update(session, user.id, CreateOrUpdateUserSchema(
        username=user.username,
        password=get_hashed_password(obj_in.new_password)
    ))
    return {'ok': True}


# ── 重置密码（无需登录）──────────────────────────────────────

class ResetPwdSchema(BaseModel):
    email: str
    otp: str
    new_password: str


@router.post('/reset_password/', description='忘记密码（邮箱验证码，无需登录）')
def reset_password(obj_in: ResetPwdSchema, session: Session = Depends(get_db)):
    from sqlalchemy import select
    from db.system_mgt.models import UserModel
    user = session.execute(
        select(UserModel).where(UserModel.email == obj_in.email)
    ).scalars().first()
    if not user:
        # 统一提示，不暴露邮箱是否存在
        raise HTTPException(status_code=400, detail='验证码错误或已过期')
    if not verify_otp('reset_pwd', obj_in.email, obj_in.otp):
        raise HTTPException(status_code=400, detail='验证码错误或已过期')
    if len(obj_in.new_password) < 6:
        raise HTTPException(status_code=400, detail='新密码至少6位')
    _dao.update(session, user.id, CreateOrUpdateUserSchema(
        username=user.username,
        password=get_hashed_password(obj_in.new_password)
    ))
    return {'ok': True}


# ── 注销账号 ─────────────────────────────────────────────────

@router.delete('/user/delete_account/', description='注销账号')
def delete_account(request: Request, session: Session = Depends(get_db)):
    username = request.state.username
    user = _dao.get_user_by_username(session, username)
    if not user:
        raise HTTPException(status_code=404, detail='用户不存在')
    _dao.deletes(session, [user.id])
    return {'ok': True}

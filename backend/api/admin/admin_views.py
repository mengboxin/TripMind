"""
管理后台 API
所有接口需要管理员权限（username 在 ADMIN_USERS 列表中）
"""
import json
import os
import logging
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from db.system_mgt.models import UserModel
from utils.dependencies import get_db
from utils.password_hash import get_hashed_password

router = APIRouter()
log = logging.getLogger("admin")

ADMIN_USERS = set(os.getenv("ADMIN_USERS", "admin").split(","))


def require_admin(request: Request):
    username = getattr(request.state, "username", None)
    if not username or username not in ADMIN_USERS:
        raise HTTPException(status_code=403, detail="需要管理员权限")
    return username


# ── 仪表盘 ────────────────────────────────────────────────

@router.get("/admin/dashboard/")
def dashboard(admin=Depends(require_admin), session: Session = Depends(get_db)):
    from utils.db_utils import get_connection
    stats = {}
    total_users = session.execute(select(func.count()).select_from(UserModel)).scalar()
    today = datetime.now().date()
    new_today = session.execute(
        select(func.count()).select_from(UserModel)
        .where(func.date(UserModel.create_time) == today)
    ).scalar()
    stats["total_users"] = total_users
    stats["new_users_today"] = new_today
    reg_trend = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        cnt = session.execute(
            select(func.count()).select_from(UserModel)
            .where(func.date(UserModel.create_time) == d)
        ).scalar()
        reg_trend.append({"date": d.strftime("%m-%d"), "count": cnt})
    stats["reg_trend"] = reg_trend
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT COUNT(*) as cnt FROM t_chat_history")
                stats["total_chats"] = cur.fetchone()["cnt"]
                cur.execute("SELECT COUNT(*) as cnt FROM t_chat_history WHERE DATE(updated_at)=%s", (today,))
                stats["chats_today"] = cur.fetchone()["cnt"]
                chat_trend = []
                for i in range(6, -1, -1):
                    d = today - timedelta(days=i)
                    cur.execute("SELECT COUNT(*) as cnt FROM t_chat_history WHERE DATE(updated_at)=%s", (d,))
                    chat_trend.append({"date": d.strftime("%m-%d"), "count": cur.fetchone()["cnt"]})
                stats["chat_trend"] = chat_trend
                cur.execute("SELECT COUNT(*) as cnt FROM t_travel_budget")
                stats["total_budgets"] = cur.fetchone()["cnt"]
                cur.execute("SELECT COUNT(*) as cnt FROM t_destinations WHERE is_active=1")
                stats["total_destinations"] = cur.fetchone()["cnt"]
    except Exception as e:
        log.warning(f"统计查询失败: {e}")
        stats.setdefault("total_chats", 0); stats.setdefault("chats_today", 0)
        stats.setdefault("chat_trend", []); stats.setdefault("total_budgets", 0)
        stats.setdefault("total_destinations", 0)
    return stats


# ── 用户管理 ──────────────────────────────────────────────

@router.get("/admin/users/")
def list_users(page: int = 1, page_size: int = 20, keyword: Optional[str] = None,
               admin=Depends(require_admin), session: Session = Depends(get_db)):
    q = select(UserModel)
    if keyword:
        q = q.where((UserModel.username.like(f"%{keyword}%")) | (UserModel.email.like(f"%{keyword}%")))
    total = session.execute(select(func.count()).select_from(q.subquery())).scalar()
    users = session.execute(q.offset((page - 1) * page_size).limit(page_size)).scalars().all()
    return {"total": total, "page": page, "page_size": page_size, "items": [
        {"id": u.id, "username": u.username, "email": u.email, "phone": u.phone,
         "real_name": u.real_name, "passenger_id": u.passenger_id,
         "create_time": u.create_time.isoformat() if u.create_time else None}
        for u in users
    ]}


class AdminUpdateUser(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    real_name: Optional[str] = None
    password: Optional[str] = None


@router.patch("/admin/users/{uid}/")
def update_user(uid: int, body: AdminUpdateUser, admin=Depends(require_admin), session: Session = Depends(get_db)):
    user = session.get(UserModel, uid)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    if body.email is not None: user.email = body.email
    if body.phone is not None: user.phone = body.phone
    if body.real_name is not None: user.real_name = body.real_name
    if body.password: user.password = get_hashed_password(body.password)
    session.commit()
    return {"ok": True}


@router.delete("/admin/users/{uid}/")
def delete_user(uid: int, admin=Depends(require_admin), session: Session = Depends(get_db)):
    user = session.get(UserModel, uid)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    session.delete(user); session.commit()
    return {"ok": True}


# ── 对话日志 ──────────────────────────────────────────────

@router.get("/admin/chats/")
def list_chats(page: int = 1, page_size: int = 20, username: Optional[str] = None,
               admin=Depends(require_admin)):
    from utils.db_utils import get_connection
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                where = "WHERE username=%s" if username else ""
                params = (username,) if username else ()
                cur.execute(f"SELECT COUNT(*) as cnt FROM t_chat_history {where}", params)
                total = cur.fetchone()["cnt"]
                cur.execute(
                    f"SELECT id,username,thread_id,title,updated_at,"
                    f"JSON_LENGTH(messages) as message_count "
                    f"FROM t_chat_history {where} "
                    f"ORDER BY updated_at DESC LIMIT %s OFFSET %s",
                    (*params, page_size, (page - 1) * page_size))
                rows = cur.fetchall()
                for r in rows:
                    if r.get("updated_at"): r["updated_at"] = r["updated_at"].isoformat()
        return {"total": total, "page": page, "page_size": page_size, "items": rows}
    except Exception as e:
        return {"total": 0, "page": page, "page_size": page_size, "items": []}


@router.delete("/admin/chats/{chat_id}/")
def delete_chat(chat_id: int, admin=Depends(require_admin)):
    from utils.db_utils import get_connection
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM t_chat_history WHERE id=%s", (chat_id,))
            conn.commit()
        return {"ok": True}
    except Exception as e:
        return {"ok": False, "error": str(e)}


@router.get("/admin/chats/{chat_id}/")
def get_chat_detail(chat_id: int, admin=Depends(require_admin)):
    """获取单条对话的完整消息列表"""
    from utils.db_utils import get_connection
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, username, thread_id, title, messages, updated_at "
                    "FROM t_chat_history WHERE id=%s",
                    (chat_id,)
                )
                row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="对话不存在")
        if row.get("updated_at"):
            row["updated_at"] = row["updated_at"].isoformat()
        # messages 是 JSON 字符串，解析后返回
        import json as _json
        try:
            row["messages"] = _json.loads(row["messages"]) if row["messages"] else []
        except Exception:
            row["messages"] = []
        return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── AI 模型配置（env key/url）────────────────────────────

ENV_FILE = os.path.join(os.path.dirname(__file__), "../../.env")
_EDITABLE_KEYS = {
    "DASHSCOPE_API_KEY", "DASHSCOPE_BASE_URL",
    "OPENAI_API_KEY", "OPENAI_BASE_URL",
    "ZAI_API_KEY", "ZAI_BASE_URL",
    "TAVILY_API_KEY",
    "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM",
}


def _read_env():
    result = {}
    try:
        with open(ENV_FILE, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line: continue
                k, _, v = line.partition("=")
                result[k.strip()] = v.strip().strip('"').strip("'")
    except Exception:
        pass
    return result


def _write_env(updates: dict):
    try:
        with open(ENV_FILE, "r", encoding="utf-8") as f:
            lines = f.readlines()
        new_lines = []; updated = set()
        for line in lines:
            stripped = line.strip()
            if stripped and not stripped.startswith("#") and "=" in stripped:
                k = stripped.split("=", 1)[0].strip()
                if k in updates and k in _EDITABLE_KEYS:
                    new_lines.append(f'{k}="{updates[k]}"\n'); updated.add(k); continue
            new_lines.append(line)
        for k, v in updates.items():
            if k in _EDITABLE_KEYS and k not in updated:
                new_lines.append(f'{k}="{v}"\n')
        with open(ENV_FILE, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
    except Exception as e:
        raise RuntimeError(f"写入 .env 失败: {e}")


@router.get("/admin/config/env/")
def get_env_config(admin=Depends(require_admin)):
    env = _read_env()
    result = {}
    for k in _EDITABLE_KEYS:
        v = env.get(k, "")
        result[k] = v[:8] + "****" if ("KEY" in k or "PASSWORD" in k) and len(v) > 8 else ("****" if ("KEY" in k or "PASSWORD" in k) and v else v)
    return result


class EnvConfigUpdate(BaseModel):
    updates: dict


@router.post("/admin/config/env/")
def update_env_config(body: EnvConfigUpdate, admin=Depends(require_admin)):
    safe = {k: v for k, v in body.updates.items() if k in _EDITABLE_KEYS}
    if not safe:
        raise HTTPException(status_code=400, detail="没有可更新的配置项")
    try:
        _write_env(safe)
        for k, v in safe.items():
            os.environ[k] = v
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"ok": True, "updated": list(safe.keys())}


# ── 模型预设管理（数据库）────────────────────────────────

def _db():
    from utils.db_utils import get_connection
    return get_connection()


@router.get("/admin/models/")
def list_models(admin=Depends(require_admin)):
    try:
        with _db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM t_model_config ORDER BY id")
                rows = cur.fetchall()
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class ModelConfigBody(BaseModel):
    name: str
    provider: str
    model_name: str
    api_key: Optional[str] = ""   # 编辑时可为空，表示不修改
    base_url: str = ""
    temperature: float = 0.7


@router.post("/admin/models/")
def create_model_config(body: ModelConfigBody, admin=Depends(require_admin)):
    try:
        with _db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO t_model_config (name,provider,model_name,api_key,base_url,temperature) "
                    "VALUES (%s,%s,%s,%s,%s,%s)",
                    (body.name, body.provider, body.model_name, body.api_key, body.base_url, body.temperature)
                )
            conn.commit()
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/admin/models/{mid}/")
def update_model_config(mid: int, body: ModelConfigBody, admin=Depends(require_admin)):
    try:
        with _db() as conn:
            with conn.cursor() as cur:
                if body.api_key:
                    cur.execute(
                        "UPDATE t_model_config SET name=%s,provider=%s,model_name=%s,"
                        "api_key=%s,base_url=%s,temperature=%s WHERE id=%s",
                        (body.name, body.provider, body.model_name, body.api_key, body.base_url, body.temperature, mid)
                    )
                else:
                    # api_key 为空时不覆盖原值
                    cur.execute(
                        "UPDATE t_model_config SET name=%s,provider=%s,model_name=%s,"
                        "base_url=%s,temperature=%s WHERE id=%s",
                        (body.name, body.provider, body.model_name, body.base_url, body.temperature, mid)
                    )
            conn.commit()
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/admin/models/{mid}/")
def delete_model_config(mid: int, admin=Depends(require_admin)):
    try:
        with _db() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM t_model_config WHERE id=%s", (mid,))
            conn.commit()
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/admin/models/{mid}/activate/")
def activate_model(mid: int, admin=Depends(require_admin)):
    """切换当前激活模型，并热重载 llm.py 中的全局 llm 实例"""
    try:
        with _db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM t_model_config WHERE id=%s", (mid,))
                row = cur.fetchone()
                if not row:
                    raise HTTPException(status_code=404, detail="模型配置不存在")
                cur.execute("UPDATE t_model_config SET is_active=0")
                cur.execute("UPDATE t_model_config SET is_active=1 WHERE id=%s", (mid,))
            conn.commit()

        # 热重载全局 llm 实例
        from graph_chat import llm as llm_module
        new_config = {
            "provider":    row["provider"],
            "model_name":  row["model_name"],
            "api_key":     row["api_key"],
            "base_url":    row["base_url"],
            "temperature": float(row["temperature"]),
        }
        llm_module.llm = llm_module.create_model(new_config)
        log.info(f"已切换激活模型: {row['name']} ({row['model_name']})")
        return {"ok": True, "active": row["name"]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── 目的地管理 ────────────────────────────────────────────

@router.get("/admin/destinations/")
def list_destinations(page: int = 1, page_size: int = 20, keyword: Optional[str] = None,
                      admin=Depends(require_admin)):
    try:
        with _db() as conn:
            with conn.cursor() as cur:
                where = "WHERE (name LIKE %s OR country LIKE %s OR tag LIKE %s)" if keyword else ""
                params = (f"%{keyword}%", f"%{keyword}%", f"%{keyword}%") if keyword else ()
                cur.execute(f"SELECT COUNT(*) as cnt FROM t_destinations {where}", params)
                total = cur.fetchone()["cnt"]
                cur.execute(
                    f"SELECT id,dest_id,name,country,region,tag,img,best_time,flights,is_active,sort_order "
                    f"FROM t_destinations {where} ORDER BY sort_order,id LIMIT %s OFFSET %s",
                    (*params, page_size, (page - 1) * page_size)
                )
                rows = cur.fetchall()
        return {"total": total, "page": page, "page_size": page_size, "items": rows}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class DestinationBody(BaseModel):
    dest_id: str
    name: str
    country: str
    region: str
    tag: str
    lat: float
    lon: float
    img: str
    description: str
    highlights: List[str]
    food: List[str]
    best_time: str
    flights: str
    is_active: int = 1
    sort_order: int = 0


@router.post("/admin/destinations/")
def create_destination(body: DestinationBody, admin=Depends(require_admin)):
    try:
        with _db() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO t_destinations
                      (dest_id,name,country,region,tag,lat,lon,img,description,highlights,food,best_time,flights,is_active,sort_order)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """, (body.dest_id, body.name, body.country, body.region, body.tag,
                      body.lat, body.lon, body.img, body.description,
                      json.dumps(body.highlights, ensure_ascii=False),
                      json.dumps(body.food, ensure_ascii=False),
                      body.best_time, body.flights, body.is_active, body.sort_order))
            conn.commit()
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/admin/destinations/{did}/")
def update_destination(did: int, body: DestinationBody, admin=Depends(require_admin)):
    try:
        with _db() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE t_destinations SET
                      dest_id=%s,name=%s,country=%s,region=%s,tag=%s,lat=%s,lon=%s,
                      img=%s,description=%s,highlights=%s,food=%s,
                      best_time=%s,flights=%s,is_active=%s,sort_order=%s
                    WHERE id=%s
                """, (body.dest_id, body.name, body.country, body.region, body.tag,
                      body.lat, body.lon, body.img, body.description,
                      json.dumps(body.highlights, ensure_ascii=False),
                      json.dumps(body.food, ensure_ascii=False),
                      body.best_time, body.flights, body.is_active, body.sort_order, did))
            conn.commit()
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/admin/destinations/{did}/")
def delete_destination(did: int, admin=Depends(require_admin)):
    try:
        with _db() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM t_destinations WHERE id=%s", (did,))
            conn.commit()
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/admin/destinations/{did}/toggle/")
def toggle_destination(did: int, admin=Depends(require_admin)):
    try:
        with _db() as conn:
            with conn.cursor() as cur:
                cur.execute("UPDATE t_destinations SET is_active = 1 - is_active WHERE id=%s", (did,))
            conn.commit()
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── 公开接口：前端拉取目的地列表 ─────────────────────────

@router.get("/destinations/")
def public_destinations(region: Optional[str] = None, keyword: Optional[str] = None):
    """前端用，无需登录"""
    try:
        with _db() as conn:
            with conn.cursor() as cur:
                conditions = ["is_active=1"]
                params = []
                if region and region != "全部":
                    conditions.append("region=%s"); params.append(region)
                if keyword:
                    conditions.append("(name LIKE %s OR country LIKE %s OR tag LIKE %s)")
                    params += [f"%{keyword}%"] * 3
                where = "WHERE " + " AND ".join(conditions)
                cur.execute(
                    f"SELECT * FROM t_destinations {where} ORDER BY sort_order,id",
                    params
                )
                rows = cur.fetchall()
                for r in rows:
                    r["highlights"] = json.loads(r["highlights"]) if r["highlights"] else []
                    r["food"] = json.loads(r["food"]) if r["food"] else []
                    if r.get("create_time"): r["create_time"] = r["create_time"].isoformat()
                    if r.get("update_time"): r["update_time"] = r["update_time"].isoformat()
        return rows
    except Exception as e:
        log.error(f"获取目的地失败: {e}")
        return []


# ── 系统信息 ──────────────────────────────────────────────

@router.get("/admin/system/")
def system_info(admin=Depends(require_admin)):
    import platform, sys
    from utils.cache_utils import get_redis
    redis_ok = False
    try:
        r = get_redis(); redis_ok = r is not None and bool(r.ping())
    except Exception:
        pass
    # 当前激活模型
    active_model = "未知"
    try:
        with _db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT name,model_name FROM t_model_config WHERE is_active=1 LIMIT 1")
                row = cur.fetchone()
                if row: active_model = f"{row['name']} ({row['model_name']})"
    except Exception:
        pass
    return {
        "python": sys.version,
        "platform": platform.platform(),
        "redis": "connected" if redis_ok else "disconnected",
        "server_time": datetime.now().isoformat(),
        "active_model": active_model,
    }

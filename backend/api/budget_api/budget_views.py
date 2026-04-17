from fastapi import APIRouter
from starlette.requests import Request
from pydantic import BaseModel
from typing import Optional
from utils.db_utils import get_connection
import logging

router = APIRouter()
log = logging.getLogger("budget")


class BudgetCreate(BaseModel):
    trip_name: str = "我的旅行"
    total: float
    currency: str = "CNY"


class RecordCreate(BaseModel):
    budget_id: int
    category: str  # 机票/酒店/租车/餐饮/景点/其他
    description: str
    amount: float


@router.post("/budget/", description="创建或更新旅行预算")
def upsert_budget(request: Request, obj: BudgetCreate):
    username = request.state.username
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                # 查是否已有预算
                cur.execute("SELECT id FROM t_travel_budget WHERE username=%s ORDER BY id DESC LIMIT 1", (username,))
                row = cur.fetchone()
                if row:
                    cur.execute("UPDATE t_travel_budget SET trip_name=%s, total=%s, currency=%s WHERE id=%s",
                                (obj.trip_name, obj.total, obj.currency, row["id"]))
                    bid = row["id"]
                else:
                    cur.execute("INSERT INTO t_travel_budget (username, trip_name, total, currency) VALUES (%s,%s,%s,%s)",
                                (username, obj.trip_name, obj.total, obj.currency))
                    bid = cur.lastrowid
            conn.commit()
        return {"ok": True, "budget_id": bid}
    except Exception as e:
        log.error(f"预算操作失败: {e}")
        return {"ok": False, "error": str(e)}
    finally:
        from utils.cache_utils import cache_delete
        cache_delete(f"budget:{username}")


@router.get("/budget/", description="获取当前预算和消费记录")
def get_budget(request: Request):
    from utils.cache_utils import cache_get, cache_set
    username = request.state.username
    cache_key = f"budget:{username}"

    cached = cache_get(cache_key)
    if cached:
        return cached

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM t_travel_budget WHERE username=%s ORDER BY id DESC LIMIT 1", (username,))
                budget = cur.fetchone()
                if not budget:
                    return {"budget": None, "records": [], "spent": 0}
                cur.execute("SELECT * FROM t_budget_records WHERE budget_id=%s ORDER BY record_date DESC",
                            (budget["id"],))
                records = cur.fetchall()
                spent = sum(r["amount"] for r in records)
                for r in records:
                    if r.get("record_date"):
                        r["record_date"] = r["record_date"].isoformat()
                if budget.get("created_at"):
                    budget["created_at"] = budget["created_at"].isoformat()
                if budget.get("updated_at"):
                    budget["updated_at"] = budget["updated_at"].isoformat()
        result = {"budget": budget, "records": records, "spent": float(spent)}
        cache_set(cache_key, result, ttl=300)
        return result
    except Exception as e:
        log.error(f"获取预算失败: {e}")
        return {"budget": None, "records": [], "spent": 0}


@router.post("/budget/record/", description="添加消费记录")
def add_record(request: Request, obj: RecordCreate):
    username = request.state.username
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO t_budget_records (username, budget_id, category, description, amount) VALUES (%s,%s,%s,%s,%s)",
                    (username, obj.budget_id, obj.category, obj.description, obj.amount)
                )
            conn.commit()
        return {"ok": True}
    except Exception as e:
        return {"ok": False, "error": str(e)}
    finally:
        from utils.cache_utils import cache_delete
        cache_delete(f"budget:{username}")


@router.delete("/budget/record/{record_id}/", description="删除消费记录")
def delete_record(record_id: int, request: Request):
    username = request.state.username
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM t_budget_records WHERE id=%s AND username=%s", (record_id, username))
            conn.commit()
        from utils.cache_utils import cache_delete
        cache_delete(f"budget:{username}")
        return {"ok": True}
    except Exception as e:
        return {"ok": False, "error": str(e)}

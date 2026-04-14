"""
Redis 缓存工具
用于缓存订单数据、天气数据等，减少数据库和外部 API 请求
"""
import json
import os
import redis
from utils.log_utils import log

_redis_client = None


def get_redis() -> redis.Redis:
    global _redis_client
    if _redis_client is None:
        try:
            _redis_client = redis.Redis(
                host=os.getenv("REDIS_HOST", "127.0.0.1"),
                port=int(os.getenv("REDIS_PORT", 6379)),
                db=0,
                decode_responses=True,
                socket_connect_timeout=2,
                socket_timeout=2,
            )
            _redis_client.ping()
            log.info("Redis 连接成功")
        except Exception as e:
            log.warning(f"Redis 连接失败，将不使用缓存: {e}")
            _redis_client = None
    return _redis_client


def cache_get(key: str):
    """从缓存读取，返回 Python 对象，不存在返回 None"""
    try:
        r = get_redis()
        if not r:
            return None
        val = r.get(key)
        return json.loads(val) if val else None
    except Exception:
        return None


def cache_set(key: str, value, ttl: int = 300):
    """写入缓存，ttl 单位秒，默认5分钟"""
    try:
        r = get_redis()
        if not r:
            return
        r.setex(key, ttl, json.dumps(value, ensure_ascii=False, default=str))
    except Exception:
        pass


def cache_delete(key: str):
    """删除缓存"""
    try:
        r = get_redis()
        if not r:
            return
        r.delete(key)
    except Exception:
        pass


def cache_delete_pattern(pattern: str):
    """删除匹配 pattern 的所有缓存键"""
    try:
        r = get_redis()
        if not r:
            return
        keys = r.keys(pattern)
        if keys:
            r.delete(*keys)
    except Exception:
        pass

"""
LLM 工厂模块
- create_model(config): 根据配置字典创建模型实例
- llm: 全局模型实例，启动时从数据库读取激活配置，管理后台切换时热更新
"""
import os
import logging
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()
log = logging.getLogger("llm")


def create_model(config: dict) -> ChatOpenAI:
    """
    config 字段：
      provider   : openai / tongyi / zhipu / custom
      model_name : 模型名称
      api_key    : API Key 明文
      base_url   : Base URL（可为空）
      temperature: 温度
    """
    model_name  = config["model_name"]
    api_key     = config.get("api_key") or ""
    base_url    = config.get("base_url") or ""
    temperature = float(config.get("temperature", 0.7))
    provider    = config.get("provider", "openai")

    if not api_key:
        raise ValueError(f"模型 [{model_name}] 的 API Key 为空，请在管理后台配置")

    kwargs = dict(model=model_name, api_key=api_key, temperature=temperature)

    if base_url:
        kwargs["base_url"] = base_url
    elif provider == "tongyi":
        kwargs["base_url"] = "https://dashscope.aliyuncs.com/compatible-mode/v1"

    return ChatOpenAI(**kwargs)


def _load_active_from_db() -> dict | None:
    """从数据库读取当前激活的模型配置，失败返回 None"""
    try:
        import pymysql
        conn = pymysql.connect(
            host=os.getenv("DB_HOST", "127.0.0.1"),
            port=int(os.getenv("DB_PORT", 3306)),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_DATABASE"),
            charset="utf8mb4",
            cursorclass=pymysql.cursors.DictCursor,
            connect_timeout=3,
        )
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM t_model_config WHERE is_active=1 LIMIT 1")
            row = cur.fetchone()
        conn.close()
        return row
    except Exception as e:
        log.warning(f"从数据库读取模型配置失败，使用 .env 兜底: {e}")
        return None


def _fallback_model() -> ChatOpenAI:
    """数据库不可用时，从 .env 读取兜底配置"""
    return ChatOpenAI(
        model=os.getenv("DEFAULT_MODEL_NAME", "qwen-plus"),
        api_key=os.getenv("OPENAI_API_KEY", ""),
        base_url=os.getenv("OPENAI_BASE_URL", ""),
        temperature=0.7,
    )


# ── 全局实例，模块加载时初始化 ──────────────────────────
_active_config = _load_active_from_db()
if _active_config:
    try:
        llm = create_model(_active_config)
        log.info(f"LLM 初始化成功: {_active_config['name']} ({_active_config['model_name']})")
    except Exception as e:
        log.error(f"LLM 初始化失败: {e}，使用兜底配置")
        llm = _fallback_model()
else:
    llm = _fallback_model()

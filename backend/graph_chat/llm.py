from langchain.chat_models import init_chat_model
from langchain_core.output_parsers import SimpleJsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.rate_limiters import InMemoryRateLimiter
from pydantic import BaseModel, Field
import os
from dotenv import load_dotenv

load_dotenv()

# ==========================================
# 模型配置区域 - 集中管理所有模型设置
# ==========================================

# 当前使用的主模型配置 - 基于你的.env文件
MODEL_CONFIG = {
    "provider": "openai",
    "model_name": "qwen3-max",
    "temperature": 0.7,
    "api_key_env": "OPENAI_API_KEY",
    "base_url_env": "OPENAI_BASE_URL",
}


# 模型工厂函数 - 根据配置创建模型实例
def create_model(config=None):
    """
    根据配置创建语言模型实例
    """
    if config is None:
        config = MODEL_CONFIG
    provider = config["provider"]

    model_name = config["model_name"]
    temperature = config["temperature"]
    api_key_env = config["api_key_env"]
    base_url_env = config.get("base_url_env")

    # 获取API密钥
    api_key = os.getenv(api_key_env)
    if not api_key:
        raise ValueError(f"环境变量 {api_key_env} 未设置")

    # 获取基础URL（如果配置了的话）
    base_url = os.getenv(base_url_env) if base_url_env else None

    if provider == "tongyi":
        # 通义千问 - 使用 OpenAI 兼容接口，避免 ChatTongyi 的 pydantic 兼容性问题
        return ChatOpenAI(
            model=model_name,
            api_key=api_key,
            temperature=temperature,
            base_url=base_url or "https://dashscope.aliyuncs.com/compatible-mode/v1",
        )

    elif provider == "openai":
        # OpenAI模型 - 使用你的代理配置
        kwargs = {
            "model": model_name,
            "api_key": os.getenv("OPENAI_API_KEY"),
            "temperature": temperature,
            "base_url": os.getenv("OPENAI_BASE_URL")
        }
        return ChatOpenAI(**kwargs)

    elif provider == "zhipu":
        # 智谱AI模型
        kwargs = {
            "model": model_name,
            "api_key": os.getenv("ZAI_API_KEY"),
            "temperature": temperature,
            "base_url": os.getenv("ZAI_BASE_URL") if os.getenv("ZAI_BASE_URL") else None
        }
        return ChatOpenAI(**kwargs)  # 智谱AI也使用OpenAI兼容接口
    else:
        raise ValueError(f"不支持的模型提供商: {provider}")


# 创建全局模型实例
llm = create_model()

# ==========================================
# 预设配置
# ==========================================

# 通义千问配置（当前使用）
TONGYI_CONFIG = {
    "provider": "tongyi",
    "model_name": "qwen-max",
    "temperature": 0.7,
    "api_key_env": "DASHSCOPE_API_KEY",
    "base_url_env": "DASHSCOPE_BASE_URL",
}

# OpenAI代理配置
OPENAI_PROXY_CONFIG = {
    "provider": "openai",
    "model_name": "gpt-4.1-mini",
    "temperature": 0.7,
    "api_key_env": "OPENAI_API_KEY",
    "base_url_env": "OPENAI_BASE_URL",
}

# 智谱AI配置
ZHIPU_CONFIG = {
    "provider": "zhipu",
    "model_name": "glm-4",  # 或其他智谱模型
    "temperature": 0.7,
    "api_key_env": "ZAI_API_KEY",
    "base_url_env": "ZAI_BASE_URL",
}


# ==========================================
# 快速切换函数
# ==========================================

# def switch_to_tongyi():
#     """切换到通义千问"""
#     global llm, tongyi_llm
#     llm = create_model(TONGYI_CONFIG)
#     tongyi_llm = llm
#     print("已切换到通义千问模型")
#
#
# def switch_to_openai():
#     """切换到OpenAI代理"""
#     global llm, tongyi_llm
#     llm = create_model(OPENAI_PROXY_CONFIG)
#     tongyi_llm = llm
#     print("已切换到OpenAI代理模型")
#
#
# def switch_to_zhipu():
#     """切换到智谱AI"""
#     global llm, tongyi_llm
#     llm = create_model(ZHIPU_CONFIG)
#     tongyi_llm = llm
#     print("已切换到智谱AI模型")


# ==========================================
# 测试函数
# ==========================================

# def test_current_model():
#     """测试当前模型是否正常工作"""
#     try:
#         response = llm.invoke("你好，请简单介绍一下你自己")
#         print("✅ 模型测试成功:")
#         print(f"响应: {response.content}")
#         return True
#     except Exception as e:
#         print(f"❌ 模型测试失败: {e}")
#         return False

# ==========================================
# 其他配置和工具函数（保持原有注释代码不变）
# ==========================================

# #定义速率限制器
# rate_limiter = InMemoryRateLimiter(
#     requests_per_second=1,  # 每秒 1 个
#     check_every_n_seconds=10,  # 每 10 秒检查一次（等效于 0.1 rps）
#     max_bucket_size=10  # 桶大小为 10 表示允许突发流量
# )

# #初始化模型，新版初始化方法
# openai_gpt_4_1_mini_llm = init_chat_model(
#     model="gpt-4.1-mini",
#     api_key=OPENAI_API_KEY,
#     base_url=OPENAI_BASE_URL,
#     temperature=0.9
# )

# 初始化模型
# llm = ChatOpenAI(
#     model="gpt-4.1-mini",
#     temperature=0.9,
#     api_key=OPENAI_API_KEY,
#     base_url=OPENAI_BASE_URL,
# )

# response = llm.invoke("What is the meaning of life?(用中文回答)")
# 流式输出
# for chunk in openai_gpt_4_1_mini_llm.stream(''):
#     print(chunk.content, end="", flush=True)
# print("\n")

# for chunk in tongyi_llm.stream(""):
#     print(chunk.content, end="", flush=True)
# print("\n")

# #模型的格式化输出
# class Movie(BaseModel):
#     title: str = Field(..., description="电影的标题")
#     director: str = Field(..., description="导演的名字")
#     rating: float = Field(..., description="评分")
#     year: int = Field(..., description="上映年份")
#
# prompt = ChatPromptTemplate.from_messages([
#     ('system', '你是一个电影推荐助手。'),
# ])
#
# chain = prompt | llm | SimpleJsonOutputParser()
# response2 = chain.invoke({"user_request": "推荐一部好看的电影"})
# print(response2)
#
# model_with_structure = llm.with_structured_output(Movie, include_raw= True) #启用结构化输出，并包含原始文本
# response = model_with_structure.invoke("推荐一部好看的电影")
# print(response)

import os
import re
import pickle
import hashlib
import numpy as np
from pathlib import Path
from typing import List, Dict
from langchain_openai import OpenAIEmbeddings
from langchain_core.tools import tool
from dotenv import load_dotenv
from utils.log_utils import log
from utils.db_utils import get_connection

load_dotenv()

FAQ_FILE_NAME = "order_faq.md"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")

_retriever_instance = None


class VectorStoreRetriever:
    def __init__(self, docs: List[Dict], vectors: List[List[float]], embedding_model):
        self._arr = np.array(vectors)
        self._docs = docs
        self._embedding_model = embedding_model

    @classmethod
    def from_docs(cls, docs: List[Dict], embedding_model):
        log.info(f"正在初始化向量检索库，共 {len(docs)} 个文档段落...")
        embeddings = embedding_model.embed_documents([doc["page_content"] for doc in docs])
        log.info("向量库初始化完成。")
        return cls(docs, embeddings, embedding_model)

    @classmethod
    def from_cache(cls, docs: List[Dict], vectors: List[List[float]], embedding_model):
        """从缓存直接构建，不调用 API"""
        return cls(docs, vectors, embedding_model)

    def query(self, query: str, k: int = 5) -> List[Dict]:
        try:
            embed = self._embedding_model.embed_query(query)
            scores = np.array(embed) @ self._arr.T
            real_k = min(k, len(self._docs))
            top_k_idx = np.argpartition(scores, -real_k)[-real_k:]
            top_k_idx_sorted = top_k_idx[np.argsort(-scores[top_k_idx])]
            return [{**self._docs[idx], "similarity": scores[idx]} for idx in top_k_idx_sorted]
        except Exception as e:
            log.error(f"检索过程发生错误: {e}")
            return []


def _get_file_hash(content: str) -> str:
    return hashlib.md5(content.encode()).hexdigest()


def _load_from_db_cache(file_hash: str):
    """从数据库加载向量缓存，返回 (docs, vectors) 或 None"""
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT doc_content, embedding FROM t_vector_cache WHERE doc_hash=%s ORDER BY id",
                    (file_hash,)
                )
                rows = cur.fetchall()
        if not rows:
            return None
        docs = [{"page_content": r["doc_content"]} for r in rows]
        vectors = [pickle.loads(r["embedding"]) for r in rows]
        log.info(f"从数据库缓存加载了 {len(docs)} 个向量，跳过 Embedding API 调用。")
        return docs, vectors
    except Exception as e:
        log.error(f"读取向量缓存失败: {e}")
        return None


def _save_to_db_cache(file_hash: str, docs: List[Dict], vectors: List[List[float]]):
    """将向量保存到数据库缓存"""
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                # 先清除旧缓存（文件内容变了）
                cur.execute("DELETE FROM t_vector_cache WHERE doc_hash != %s", (file_hash,))
                for doc, vec in zip(docs, vectors):
                    cur.execute(
                        "INSERT IGNORE INTO t_vector_cache (doc_hash, doc_content, embedding) VALUES (%s, %s, %s)",
                        (file_hash, doc["page_content"], pickle.dumps(vec))
                    )
            conn.commit()
        log.info(f"已将 {len(docs)} 个向量缓存到数据库。")
    except Exception as e:
        log.error(f"保存向量缓存失败: {e}")


def get_retriever():
    global _retriever_instance
    if _retriever_instance is not None:
        return _retriever_instance

    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY not found in environment variables.")

    basic_dir = Path(__file__).resolve().parent.parent
    file_path = basic_dir / FAQ_FILE_NAME
    if not file_path.exists():
        raise FileNotFoundError(f"{file_path} does not exist.")

    with open(file_path, encoding='utf8') as f:
        faq_text = f.read()

    docs = [{"page_content": txt.strip()} for txt in re.split(r"(?=\n##)", faq_text) if txt.strip()]
    if not docs:
        return None

    file_hash = _get_file_hash(faq_text)

    embeddings_model = OpenAIEmbeddings(
        model="text-embedding-3-large",
        api_key=OPENAI_API_KEY,
        openai_api_base=OPENAI_BASE_URL
    )

    # 尝试从数据库缓存加载
    cached = _load_from_db_cache(file_hash)
    if cached:
        cached_docs, cached_vectors = cached
        _retriever_instance = VectorStoreRetriever.from_cache(cached_docs, cached_vectors, embeddings_model)
    else:
        # 缓存不存在，调用 API 重建并保存
        log.info("向量缓存不存在，调用 Embedding API 重建...")
        retriever = VectorStoreRetriever.from_docs(docs, embeddings_model)
        _save_to_db_cache(file_hash, docs, retriever._arr.tolist())
        _retriever_instance = retriever

    return _retriever_instance


@tool
def lookup_policy(query: str) -> str:
    """
    查询公司政策，检查某些选项是否允许。
    在进行航班变更、退票或其他'写'操作之前，务必使用此函数查询相关规定。
    """
    log.info(f"查询政策: '{query}'")

    try:
        retriever = get_retriever()
        if not retriever:
            return "抱歉，政策知识库暂时无法使用。"

        # 查询 Top 2
        results = retriever.query(query, k=2)

        if not results:
            log.info("未找到相关政策文档。")
            return "未找到相关的政策说明。"

        # 记录最高相似度，方便调试
        top_score = results[0].get('similarity', 0)
        log.debug(f"政策查询 Top1 相似度: {top_score:.4f}")

        # 拼接内容
        context = "\n\n".join([doc["page_content"] for doc in results])
        return context

    except Exception as e:
        log.error(f"lookup_policy 执行失败: {e}")
        return "查询政策时发生系统错误，请稍后再试。"


if __name__ == '__main__':
    # 测试代码
    try:
        print(">>> 测试开始")
        answer = lookup_policy.invoke('怎么才能退票呢？')
        print("-" * 20)
        print("查询结果:\n", answer)
        print("-" * 20)
    except Exception as e:
        print(f"测试失败: {e}")
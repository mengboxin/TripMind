"""
基于 MySQL 的 LangGraph Checkpointer
替代 MemorySaver，实现持久化存储
"""
import pickle
from contextlib import contextmanager
from typing import Any, Dict, Iterator, Optional, Sequence, Tuple

from langchain_core.runnables import RunnableConfig
from langgraph.checkpoint.base import (
    BaseCheckpointSaver,
    Checkpoint,
    CheckpointMetadata,
    CheckpointTuple,
    get_checkpoint_id,
)

from utils.db_utils import get_connection


class MySQLCheckpointSaver(BaseCheckpointSaver):
    """将 LangGraph checkpoint 持久化到 MySQL"""

    def get_tuple(self, config: RunnableConfig) -> Optional[CheckpointTuple]:
        thread_id = config["configurable"]["thread_id"]
        checkpoint_ns = config["configurable"].get("checkpoint_ns", "")
        checkpoint_id = get_checkpoint_id(config)

        try:
            with get_connection() as conn:
                with conn.cursor() as cur:
                    if checkpoint_id:
                        cur.execute(
                            "SELECT checkpoint, metadata, parent_checkpoint_id, checkpoint_id "
                            "FROM t_lg_checkpoints "
                            "WHERE thread_id=%s AND checkpoint_ns=%s AND checkpoint_id=%s",
                            (thread_id, checkpoint_ns, checkpoint_id),
                        )
                    else:
                        cur.execute(
                            "SELECT checkpoint, metadata, parent_checkpoint_id, checkpoint_id "
                            "FROM t_lg_checkpoints "
                            "WHERE thread_id=%s AND checkpoint_ns=%s "
                            "ORDER BY checkpoint_id DESC LIMIT 1",
                            (thread_id, checkpoint_ns),
                        )
                    row = cur.fetchone()

            if not row:
                return None

            checkpoint = pickle.loads(row["checkpoint"])
            metadata = pickle.loads(row["metadata"])
            parent_id = row["parent_checkpoint_id"]
            cid = row["checkpoint_id"]

            parent_config = (
                {"configurable": {"thread_id": thread_id, "checkpoint_ns": checkpoint_ns, "checkpoint_id": parent_id}}
                if parent_id else None
            )
            return CheckpointTuple(
                config={"configurable": {"thread_id": thread_id, "checkpoint_ns": checkpoint_ns, "checkpoint_id": cid}},
                checkpoint=checkpoint,
                metadata=metadata,
                parent_config=parent_config,
            )
        except Exception as e:
            return None

    def list(
        self,
        config: Optional[RunnableConfig],
        *,
        filter: Optional[Dict[str, Any]] = None,
        before: Optional[RunnableConfig] = None,
        limit: Optional[int] = None,
    ) -> Iterator[CheckpointTuple]:
        if not config:
            return
        thread_id = config["configurable"]["thread_id"]
        checkpoint_ns = config["configurable"].get("checkpoint_ns", "")
        try:
            with get_connection() as conn:
                with conn.cursor() as cur:
                    sql = ("SELECT checkpoint, metadata, parent_checkpoint_id, checkpoint_id "
                           "FROM t_lg_checkpoints WHERE thread_id=%s AND checkpoint_ns=%s "
                           "ORDER BY checkpoint_id DESC")
                    params = [thread_id, checkpoint_ns]
                    if limit:
                        sql += " LIMIT %s"
                        params.append(limit)
                    cur.execute(sql, params)
                    rows = cur.fetchall()

            for row in rows:
                checkpoint = pickle.loads(row["checkpoint"])
                metadata = pickle.loads(row["metadata"])
                parent_id = row["parent_checkpoint_id"]
                cid = row["checkpoint_id"]
                parent_config = (
                    {"configurable": {"thread_id": thread_id, "checkpoint_ns": checkpoint_ns, "checkpoint_id": parent_id}}
                    if parent_id else None
                )
                yield CheckpointTuple(
                    config={"configurable": {"thread_id": thread_id, "checkpoint_ns": checkpoint_ns, "checkpoint_id": cid}},
                    checkpoint=checkpoint,
                    metadata=metadata,
                    parent_config=parent_config,
                )
        except Exception:
            return

    def put(
        self,
        config: RunnableConfig,
        checkpoint: Checkpoint,
        metadata: CheckpointMetadata,
        new_versions: Any,
    ) -> RunnableConfig:
        thread_id = config["configurable"]["thread_id"]
        checkpoint_ns = config["configurable"].get("checkpoint_ns", "")
        checkpoint_id = checkpoint["id"]
        parent_id = config["configurable"].get("checkpoint_id")

        try:
            with get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """INSERT INTO t_lg_checkpoints
                           (thread_id, checkpoint_ns, checkpoint_id, parent_checkpoint_id, checkpoint, metadata)
                           VALUES (%s, %s, %s, %s, %s, %s)
                           ON DUPLICATE KEY UPDATE
                               checkpoint=VALUES(checkpoint), metadata=VALUES(metadata)""",
                        (thread_id, checkpoint_ns, checkpoint_id, parent_id,
                         pickle.dumps(checkpoint), pickle.dumps(dict(metadata))),
                    )
                conn.commit()
        except Exception as e:
            pass

        return {"configurable": {"thread_id": thread_id, "checkpoint_ns": checkpoint_ns, "checkpoint_id": checkpoint_id}}

    def put_writes(
        self,
        config: RunnableConfig,
        writes: Sequence[Tuple[str, Any]],
        task_id: str,
    ) -> None:
        thread_id = config["configurable"]["thread_id"]
        checkpoint_ns = config["configurable"].get("checkpoint_ns", "")
        checkpoint_id = config["configurable"]["checkpoint_id"]

        try:
            with get_connection() as conn:
                with conn.cursor() as cur:
                    for idx, (channel, value) in enumerate(writes):
                        cur.execute(
                            """INSERT INTO t_lg_checkpoint_writes
                               (thread_id, checkpoint_ns, checkpoint_id, task_id, idx, channel, value)
                               VALUES (%s, %s, %s, %s, %s, %s, %s)
                               ON DUPLICATE KEY UPDATE value=VALUES(value)""",
                            (thread_id, checkpoint_ns, checkpoint_id, task_id, idx,
                             channel, pickle.dumps(value)),
                        )
                conn.commit()
        except Exception:
            pass

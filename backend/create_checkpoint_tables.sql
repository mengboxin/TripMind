USE ctrip_assistant;

-- LangGraph checkpoint 主表
CREATE TABLE IF NOT EXISTS t_lg_checkpoints (
    thread_id       VARCHAR(64)  NOT NULL,
    checkpoint_ns   VARCHAR(128) NOT NULL DEFAULT '',
    checkpoint_id   VARCHAR(64)  NOT NULL,
    parent_checkpoint_id VARCHAR(64) NULL,
    type            VARCHAR(32)  NULL,
    checkpoint      LONGBLOB     NOT NULL,
    metadata        LONGBLOB     NOT NULL,
    PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='LangGraph工作流检查点';

-- LangGraph checkpoint writes 表（存储中间写入）
CREATE TABLE IF NOT EXISTS t_lg_checkpoint_writes (
    thread_id       VARCHAR(64)  NOT NULL,
    checkpoint_ns   VARCHAR(128) NOT NULL DEFAULT '',
    checkpoint_id   VARCHAR(64)  NOT NULL,
    task_id         VARCHAR(64)  NOT NULL,
    idx             INT          NOT NULL,
    channel         VARCHAR(128) NOT NULL,
    type            VARCHAR(32)  NULL,
    value           LONGBLOB     NULL,
    PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id, task_id, idx)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='LangGraph工作流写入记录';

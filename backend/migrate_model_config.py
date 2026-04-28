"""
迁移 t_model_config 表：从 api_key_env/base_url_env 改为直接存 api_key/base_url
运行：python migrate_model_config.py
"""
import os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
import pymysql

conn = pymysql.connect(
    host=os.getenv("DB_HOST","127.0.0.1"), port=int(os.getenv("DB_PORT",3306)),
    user=os.getenv("DB_USER","root"), password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_DATABASE"), charset="utf8mb4",
    cursorclass=pymysql.cursors.DictCursor,
)

with conn.cursor() as cur:
    # 检查旧列是否存在
    cur.execute("SHOW COLUMNS FROM t_model_config LIKE 'api_key_env'")
    has_old = cur.fetchone()

    if has_old:
        print("检测到旧结构，开始迁移...")
        # 读取旧数据
        cur.execute("SELECT * FROM t_model_config")
        rows = cur.fetchall()

        # 添加新列
        try:
            cur.execute("ALTER TABLE t_model_config ADD COLUMN api_key VARCHAR(500) NOT NULL DEFAULT '' AFTER model_name")
        except Exception: pass
        try:
            cur.execute("ALTER TABLE t_model_config ADD COLUMN base_url VARCHAR(300) NOT NULL DEFAULT '' AFTER api_key")
        except Exception: pass

        # 从 env 读取值填入
        for row in rows:
            key = os.getenv(row.get('api_key_env',''), '')
            url = os.getenv(row.get('base_url_env',''), '')
            cur.execute("UPDATE t_model_config SET api_key=%s, base_url=%s WHERE id=%s", (key, url, row['id']))
            print(f"  迁移: {row['name']} -> key={'*'*8 if key else '(空)'}, url={url or '(空)'}")

        # 删除旧列
        try:
            cur.execute("ALTER TABLE t_model_config DROP COLUMN api_key_env")
            cur.execute("ALTER TABLE t_model_config DROP COLUMN base_url_env")
        except Exception: pass

        conn.commit()
        print("✅ 迁移完成")
    else:
        # 新建表或已是新结构，确保列存在
        try:
            cur.execute("ALTER TABLE t_model_config ADD COLUMN api_key VARCHAR(500) NOT NULL DEFAULT '' AFTER model_name")
            cur.execute("ALTER TABLE t_model_config ADD COLUMN base_url VARCHAR(300) NOT NULL DEFAULT '' AFTER api_key")
            conn.commit()
            print("✅ 新列已添加")
        except Exception as e:
            print(f"列已存在或无需变更: {e}")

    # 插入默认配置（如果表为空）
    cur.execute("SELECT COUNT(*) as cnt FROM t_model_config")
    if cur.fetchone()['cnt'] == 0:
        defaults = [
            ('通义千问 qwen-plus',  'tongyi', 'qwen-plus',    os.getenv('DASHSCOPE_API_KEY',''), 'https://dashscope.aliyuncs.com/compatible-mode/v1', 0.7, 0),
            ('通义千问 qwen-max',   'tongyi', 'qwen-max',     os.getenv('DASHSCOPE_API_KEY',''), 'https://dashscope.aliyuncs.com/compatible-mode/v1', 0.7, 0),
            ('OpenAI qwen-plus',    'openai', 'qwen-plus',    os.getenv('OPENAI_API_KEY',''),    os.getenv('OPENAI_BASE_URL',''), 0.7, 1),
            ('OpenAI gpt-4.1-mini', 'openai', 'gpt-4.1-mini', os.getenv('OPENAI_API_KEY',''),   os.getenv('OPENAI_BASE_URL',''), 0.7, 0),
            ('智谱 GLM-4',          'zhipu',  'glm-4',        os.getenv('ZAI_API_KEY',''),       os.getenv('ZAI_BASE_URL',''),   0.7, 0),
        ]
        for d in defaults:
            cur.execute(
                "INSERT IGNORE INTO t_model_config (name,provider,model_name,api_key,base_url,temperature,is_active) VALUES (%s,%s,%s,%s,%s,%s,%s)", d
            )
        conn.commit()
        print(f"✅ 已插入 {len(defaults)} 条默认模型配置")

conn.close()

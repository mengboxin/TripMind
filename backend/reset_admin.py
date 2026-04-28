"""
临时脚本：重置 admin 账号密码，或创建 admin 账号
运行方式：在 backend 目录下执行
  python reset_admin.py
"""
import os, sys
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

import pymysql
from utils.password_hash import get_hashed_password

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "Admin@123456"   # 改成你想要的密码
ADMIN_EMAIL    = "admin@tripmind.com"

conn = pymysql.connect(
    host=os.getenv("DB_HOST", "127.0.0.1"),
    port=int(os.getenv("DB_PORT", 3306)),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_DATABASE"),
    charset="utf8mb4",
    cursorclass=pymysql.cursors.DictCursor,
)

hashed = get_hashed_password(ADMIN_PASSWORD)

with conn.cursor() as cur:
    cur.execute("SELECT id FROM t_usermodel WHERE username=%s", (ADMIN_USERNAME,))
    row = cur.fetchone()
    if row:
        cur.execute(
            "UPDATE t_usermodel SET password=%s, email=%s WHERE username=%s",
            (hashed, ADMIN_EMAIL, ADMIN_USERNAME)
        )
        print(f"✅ 已更新 admin 密码")
    else:
        # 生成一个 passenger_id
        import random
        pid = f"{random.randint(1000,9999)} {random.randint(100000,999999)}"
        cur.execute(
            "INSERT INTO t_usermodel (username, password, email, passenger_id) VALUES (%s,%s,%s,%s)",
            (ADMIN_USERNAME, hashed, ADMIN_EMAIL, pid)
        )
        print(f"✅ 已创建 admin 账号")

conn.commit()
conn.close()
print(f"   用户名: {ADMIN_USERNAME}")
print(f"   密  码: {ADMIN_PASSWORD}")
print(f"   请登录后台后立即修改密码！")

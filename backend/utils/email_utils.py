"""
邮件发送 + OTP 验证码工具
- 验证码存储在 Redis，key 格式：otp:{scene}:{email}
- scene: register / change_pwd / reset_pwd
"""
import os
import random
import smtplib
import string
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from utils.cache_utils import get_redis
from utils.log_utils import log

_OTP_KEY_PREFIX = "otp"


def _smtp_cfg():
    """每次调用时动态读取环境变量，避免模块加载时缓存旧值"""
    return {
        "host":     os.getenv("SMTP_HOST", "smtp.qq.com"),
        "port":     int(os.getenv("SMTP_PORT", 465)),
        "ssl":      os.getenv("SMTP_SSL", "true").lower() == "true",
        "user":     os.getenv("SMTP_USER", ""),
        "password": os.getenv("SMTP_PASSWORD", ""),
        "from":     os.getenv("SMTP_FROM", os.getenv("SMTP_USER", "")),
        "expire":   int(os.getenv("OTP_EXPIRE_SECONDS", 300)),
    }


def _otp_redis_key(scene: str, email: str) -> str:
    return f"{_OTP_KEY_PREFIX}:{scene}:{email.lower()}"


def generate_otp(length: int = 6) -> str:
    return ''.join(random.choices(string.digits, k=length))


def save_otp(scene: str, email: str, code: str) -> None:
    r = get_redis()
    if not r:
        raise RuntimeError("Redis 不可用，无法保存验证码")
    expire = _smtp_cfg()["expire"]
    r.setex(_otp_redis_key(scene, email), expire, code)


def verify_otp(scene: str, email: str, code: str) -> bool:
    """校验验证码，验证成功后立即删除（一次性）"""
    r = get_redis()
    if not r:
        raise RuntimeError("Redis 不可用，无法校验验证码")
    key = _otp_redis_key(scene, email)
    stored = r.get(key)
    if stored and stored == code:
        r.delete(key)
        return True
    return False


def send_otp_email(to_email: str, code: str, scene: str) -> None:
    cfg = _smtp_cfg()
    expire_min = cfg["expire"] // 60

    scene_label = {
        "register":   "注册验证",
        "change_pwd": "修改密码",
        "reset_pwd":  "重置密码",
    }.get(scene, "身份验证")

    subject = f"【TripMind】{scene_label}验证码"
    body = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0e0e13;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0e0e13;padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#17171f;border-radius:20px;border:1px solid #2a2838;overflow:hidden;">

        <!-- 顶部品牌栏 -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e1b2e,#2d1f4e);padding:28px 36px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:40px;height:40px;background:linear-gradient(135deg,#b6a0ff,#7e51ff);border-radius:12px;text-align:center;vertical-align:middle;">
                  <span style="color:#340090;font-size:20px;font-weight:900;">✦</span>
                </td>
                <td style="padding-left:12px;">
                  <div style="color:#f6f2fa;font-size:18px;font-weight:800;letter-spacing:-0.5px;">途灵 TripMind</div>
                  <div style="color:#acaab1;font-size:12px;margin-top:2px;">AI 旅行规划助手</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- 主体内容 -->
        <tr>
          <td style="padding:36px 36px 28px;">
            <div style="color:#acaab1;font-size:14px;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">{scene_label}</div>
            <h1 style="color:#f6f2fa;font-size:24px;font-weight:700;margin:0 0 20px;line-height:1.3;">
              你的验证码
            </h1>
            <p style="color:#acaab1;font-size:15px;line-height:1.7;margin:0 0 28px;">
              你正在进行 <strong style="color:#b6a0ff;">{scene_label}</strong> 操作，请使用以下验证码完成验证：
            </p>

            <!-- 验证码展示框 -->
            <div style="background:#0e0e13;border:1px solid #2a2838;border-radius:16px;padding:28px;text-align:center;margin-bottom:28px;">
              <div style="font-size:42px;font-weight:800;letter-spacing:14px;color:#b6a0ff;font-family:'Courier New',monospace;text-shadow:0 0 20px rgba(182,160,255,0.3);">
                {code}
              </div>
              <div style="color:#4b5563;font-size:12px;margin-top:12px;">
                验证码 <strong style="color:#acaab1;">{expire_min} 分钟</strong>内有效
              </div>
            </div>

            <div style="background:#1e1b2e;border-left:3px solid #7e51ff;border-radius:0 8px 8px 0;padding:14px 16px;margin-bottom:24px;">
              <p style="color:#acaab1;font-size:13px;margin:0;line-height:1.6;">
                🔒 请勿将验证码告知任何人，TripMind 工作人员不会主动索取验证码。
              </p>
            </div>

            <p style="color:#4b5563;font-size:13px;margin:0;">
              如果这不是你的操作，请忽略此邮件，你的账号依然安全。
            </p>
          </td>
        </tr>

        <!-- 底部 -->
        <tr>
          <td style="background:#13131a;padding:20px 36px;border-top:1px solid #1e1e28;">
            <p style="color:#4b5563;font-size:12px;margin:0;text-align:center;">
              © 2025 TripMind · AI 旅行规划助手 · 此邮件由系统自动发送，请勿回复
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = cfg["from"]
    msg["To"]      = to_email
    msg.attach(MIMEText(body, "html", "utf-8"))

    host, port, use_ssl = cfg["host"], cfg["port"], cfg["ssl"]
    user, password = cfg["user"], cfg["password"]

    if not user or not password:
        raise RuntimeError("SMTP_USER 或 SMTP_PASSWORD 未配置，请检查 .env 文件")

    log.info(f"发送邮件: {host}:{port} ssl={use_ssl} -> {to_email}")
    try:
        if use_ssl:
            with smtplib.SMTP_SSL(host, port, timeout=15) as server:
                server.login(user, password)
                server.sendmail(user, [to_email], msg.as_string())
        else:
            with smtplib.SMTP(host, port, timeout=15) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(user, password)
                server.sendmail(user, [to_email], msg.as_string())
        log.info(f"验证码邮件已发送至 {to_email}，场景={scene}")
    except smtplib.SMTPAuthenticationError as e:
        log.error(f"SMTP 认证失败: {e}")
        raise RuntimeError("邮件发送失败：SMTP 认证失败，请检查授权码是否正确")
    except smtplib.SMTPException as e:
        log.error(f"SMTP 错误: {e}")
        raise RuntimeError(f"邮件发送失败：{e}")
    except Exception as e:
        log.error(f"邮件发送异常: {e}")
        raise RuntimeError(f"邮件发送失败：{e}")

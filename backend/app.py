import streamlit as st
import uuid
import json
import time
from langchain_core.messages import ToolMessage, AIMessage

# --- 1. 沉浸式配置 ---
st.set_page_config(
    page_title="Ctrip AI Voyage",
    page_icon="✈️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# --- 2. 注入大厂级 CSS ---
CUSTOM_CSS = """
<style>
    /* 全局字体与背景 */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');

    .stApp {
        background-color: #F5F7FA;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    /* 隐藏默认 Header 和 Footer */
    header {visibility: hidden;}
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}

    /* 顶部导航栏模拟 */
    .nav-header {
        background: linear-gradient(90deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%);
        padding: 1rem 2rem;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 999;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        color: white;
    }
    .nav-logo { font-size: 1.2rem; font-weight: 700; display: flex; align-items: center; gap: 10px; }
    .nav-status { font-size: 0.8rem; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; }

    /* 调整主内容区域，避开 Header */
    .main .block-container {
        padding-top: 5rem;
        padding-bottom: 6rem;
        max-width: 900px;
    }

    /* 聊天气泡通用 */
    .chat-bubble {
        padding: 12px 16px;
        border-radius: 12px;
        position: relative;
        font-size: 0.95rem;
        line-height: 1.5;
        max-width: 85%;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        margin-bottom: 10px;
    }

    /* AI 气泡 */
    .chat-row-ai {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
    }
    .ai-avatar {
        width: 36px;
        height: 36px;
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        border: 1px solid #eee;
        flex-shrink: 0;
    }
    .ai-bubble {
        background: #FFFFFF;
        color: #333;
        border-top-left-radius: 2px;
    }

    /* 用户气泡 */
    .chat-row-user {
        display: flex;
        gap: 12px;
        flex-direction: row-reverse;
        margin-bottom: 20px;
    }
    .user-avatar {
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        flex-shrink: 0;
    }
    .user-bubble {
        background: #007AFF;
        color: white;
        border-top-right-radius: 2px;
    }

    /* 票务卡片 */
    .ticket-card {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid #E5E7EB;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        margin: 10px 0;
        font-family: sans-serif;
    }
    .ticket-top {
        background: #F8FAFC;
        padding: 12px 16px;
        border-bottom: 1px dashed #E5E7EB;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .ticket-type { font-weight: 600; color: #007AFF; font-size: 0.9rem; }
    .ticket-status { font-size: 0.75rem; color: #64748B; background: #E2E8F0; padding: 2px 8px; border-radius: 4px; }

    .ticket-body { padding: 16px; }
    .flight-route { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .airport-code { font-size: 1.4rem; font-weight: 700; color: #1E293B; }
    .flight-arrow { color: #94A3B8; font-size: 0.8rem; }
    .flight-meta { display: flex; gap: 16px; font-size: 0.85rem; color: #64748B; }
    .meta-item { display: flex; align-items: center; gap: 4px; }

    /* 安全拦截区 */
    .security-alert {
        background: #FFFBF0;
        border: 1px solid #FCD34D;
        border-radius: 8px;
        padding: 12px;
        margin: 10px 0;
        display: flex;
        gap: 10px;
        align-items: start;
    }
    .alert-icon { font-size: 1.2rem; }
    .alert-content h4 { margin: 0 0 4px 0; font-size: 0.95rem; color: #92400E; }
    .alert-content p { margin: 0; font-size: 0.85rem; color: #B45309; }

    /* 输入框固定底部 */
    [data-testid="stChatInput"] {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        max-width: 900px;
        padding: 0 1rem;
        z-index: 99;
    }
</style>

<div class="nav-header">
    <div class="nav-logo">✈️ Ctrip Assistant</div>
    <div class="nav-status">🟢 Online</div>
</div>
"""
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)


# --- 3. 核心引擎 ---
@st.cache_resource(show_spinner=False)
def load_engine():
    try:
        from graph_chat.graph import graph
        return graph
    except Exception:
        return None

#创建工作流引擎
graph = load_engine()
if not graph:
    st.error("系统连接失败，请检查后台服务。")
    st.stop()

# --- 4. 状态管理 ---
if "session_id" not in st.session_state:
    st.session_state.session_id = str(uuid.uuid4())
    st.session_state.messages = []

config = {"configurable": {"passenger_id": "3442 587242", "thread_id": st.session_state.session_id}}


# --- 5. UI 渲染函数 ---
def render_ai_msg(content):
    st.markdown(f"""
    <div class="chat-row-ai">
        <div class="ai-avatar">🤖</div>
        <div class="chat-bubble ai-bubble">{content}</div>
    </div>
    """, unsafe_allow_html=True)


def render_user_msg(content):
    st.markdown(f"""
    <div class="chat-row-user">
        <div class="user-avatar">我</div>
        <div class="chat-bubble user-bubble">{content}</div>
    </div>
    """, unsafe_allow_html=True)


def render_ticket_card(args, tool_type="search"):
    if tool_type == "search_flights":
        return f"""
        <div class="ticket-card">
            <div class="ticket-top">
                <span class="ticket-type">✈️ 航班查询</span>
                <span class="ticket-status">待确认</span>
            </div>
            <div class="ticket-body">
                <div class="flight-route">
                    <span class="airport-code">{args.get('departure_airport', '???')}</span>
                    <span class="flight-arrow">─────────</span>
                    <span class="airport-code">{args.get('arrival_airport', '???')}</span>
                </div>
                <div class="flight-meta">
                    <span class="meta-item">📅 {args.get('start_time', '')[:10]}</span>
                    <span class="meta-item">🕒 全天</span>
                </div>
            </div>
        </div>
        """
    elif tool_type == "book_flight":
        return f"""
        <div class="ticket-card" style="border-top-color: #F59E0B;">
            <div class="ticket-top" style="background: #FFFBEB;">
                <span class="ticket-type" style="color: #D97706;">🎫 预订确认</span>
                <span class="ticket-status" style="color: #D97706; background: #FEF3C7;">需授权</span>
            </div>
            <div class="ticket-body">
                <div class="flight-meta" style="flex-direction: column; gap: 8px;">
                    <div class="meta-item"><strong>航班 ID：</strong>{args.get('flight_id')}</div>
                    <div class="meta-item"><strong>舱位等级：</strong>{args.get('fare_conditions', 'Economy')}</div>
                    <div class="meta-item"><strong>乘客信息：</strong>自动关联账户</div>
                </div>
            </div>
        </div>
        """
    else:
        return f"""<div class="chat-bubble ai-bubble" style="background:#f8f9fa; font-family:monospace;">🔧 调用工具: {tool_type}<br>{json.dumps(args, ensure_ascii=False)}</div>"""


# --- 6. 历史记录渲染 ---
# 使用 container 保证输入框在底部
chat_container = st.container()

with chat_container:
    # 欢迎语
    if not st.session_state.messages:
        st.markdown("""
        <div style="text-align: center; margin-top: 10vh; color: #64748B;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">✈️</div>
            <h3>欢迎使用携程智能助手</h3>
            <p>我可以帮您查机票、订酒店、管理行程</p>
        </div>
        """, unsafe_allow_html=True)

        c1, c2, c3 = st.columns([1, 1, 1])
        if c2.button("✨ 查一下我的航班", use_container_width=True):
            st.session_state.messages.append({"role": "user", "content": "查一下我的航班"})
            st.rerun()

    # 渲染历史
    for msg in st.session_state.messages:
        if msg["role"] == "user":
            render_user_msg(msg["content"])
        else:
            # 如果内容是HTML卡片，直接渲染，否则包在气泡里
            if "<div" in msg["content"]:
                st.markdown(f"""
                <div class="chat-row-ai">
                    <div class="ai-avatar">🤖</div>
                    <div style="flex-grow: 1;">{msg['content']}</div>
                </div>
                """, unsafe_allow_html=True)
            else:
                render_ai_msg(msg["content"])

    # --- 7. 审批与执行 (Human-in-the-loop) ---
    try:
        snapshot = graph.get_state(config)
        if snapshot.next:
            last_msg = snapshot.values["messages"][-1]
            if hasattr(last_msg, 'tool_calls') and last_msg.tool_calls:

                # 渲染审批卡片区
                with st.chat_message("assistant", avatar="🛡️"):
                    st.markdown("""
                    <div class="security-alert">
                        <div class="alert-icon">🔒</div>
                        <div class="alert-content">
                            <h4>安全操作请求</h4>
                            <p>助手正在请求执行敏感操作，需要您的批准。</p>
                        </div>
                    </div>
                    """, unsafe_allow_html=True)

                    for tc in last_msg.tool_calls:
                        st.markdown(render_ticket_card(tc['args'], tc['name']), unsafe_allow_html=True)

                    c1, c2 = st.columns(2)
                    if c1.button("✅ 确认执行", type="primary", use_container_width=True):
                        st.session_state.messages.append({"role": "assistant", "content": "✅ *操作已批准，正在处理...*"})
                        list(graph.stream(None, config=config, stream_mode='values'))
                        final_msg = graph.get_state(config).values["messages"][-1]
                        if isinstance(final_msg, AIMessage):
                            st.session_state.messages.append({"role": "assistant", "content": final_msg.content})
                        st.rerun()

                    if c2.button("🚫 拒绝", use_container_width=True):
                        st.session_state.messages.append({"role": "assistant", "content": "🚫 *操作已拒绝*"})
                        tool_msgs = [ToolMessage(tool_call_id=tc['id'], content="用户拒绝操作") for tc in
                                     last_msg.tool_calls]
                        list(graph.stream({"messages": tool_msgs}, config=config, stream_mode='values'))
                        final_msg = graph.get_state(config).values["messages"][-1]
                        if isinstance(final_msg, AIMessage):
                            st.session_state.messages.append({"role": "assistant", "content": final_msg.content})
                        st.rerun()
    except Exception:
        pass

# --- 8. 底部输入框 ---
if prompt := st.chat_input("输入您的需求..."):
    # 1. 显示用户消息
    st.session_state.messages.append({"role": "user", "content": prompt})
    render_user_msg(prompt)  # 立即渲染

    # 2. 显示加载动画
    with st.chat_message("assistant", avatar="🤖"):
        with st.spinner("正在查询实时数据..."):
            try:
                events = graph.stream({'messages': ('user', prompt)}, config=config, stream_mode='values')
                full_res = ""

                # 这里为了简单，只取最后结果。如果想做流式打字机，需结合 st.empty
                for event in events:
                    if "messages" in event:
                        m = event["messages"][-1]
                        if isinstance(m, AIMessage) and m.content:
                            full_res = m.content

                if full_res:
                    st.session_state.messages.append({"role": "assistant", "content": full_res})
                    st.rerun()  # 刷新以显示新消息

                # 检查是否有中断
                if graph.get_state(config).next:
                    st.rerun()

            except Exception as e:
                st.error(f"Error: {e}")
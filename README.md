# 途灵 TripMind — 技术文档

## 项目概述

途灵 TripMind 是一个基于 **LangGraph 多智能体架构**的全栈 AI 旅行助手系统。用户通过自然语言与系统交互，完成机票查询/预订/改签/退票、酒店预订、租车预订、行程推荐等旅行服务。系统内置 **Human-in-the-loop** 安全审批机制，所有写操作在执行前须经用户确认。

---

## 技术栈

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Python | 3.12 | 主要开发语言 |
| FastAPI | 0.115 | REST API 框架，提供 OpenAPI 文档 |
| LangGraph | 0.2 | 多智能体工作流编排引擎 |
| LangChain | 0.3 | LLM 工具链、Prompt 管理 |
| langchain-openai | 0.3 | OpenAI 模型接入 |
| MySQL | 8.0 | 业务数据、Checkpoint、对话历史持久化 |
| SQLAlchemy | 2.0 | ORM（部分模块使用） |
| PyMySQL | 1.1 | MySQL 驱动 |
| PyJWT / python-jose | - | JWT 令牌生成与验证 |
| Passlib + bcrypt | - | 密码哈希 |
| Uvicorn | 0.34 | ASGI 服务器 |
| Loguru | 0.7 | 结构化日志 |
| Dynaconf | 3.2 | 多环境配置管理（development / production） |

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19 | UI 框架 |
| Vite | 8 | 构建工具与开发服务器 |
| Tailwind CSS | 4 | 原子化样式框架 |

---

## 系统架构

### 整体架构

```
┌─────────────────────────────────────────────────────┐
│                    前端 (React)                      │
│  Login / Register / Chat (侧边栏 + 消息流 + 审批栏)  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP / REST
┌──────────────────────▼──────────────────────────────┐
│                 FastAPI 后端                         │
│  /api/auth/  /api/graph/  /api/chat/  /api/user/    │
│  JWT 中间件 → 路由 → 业务逻辑                        │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              LangGraph 工作流引擎                    │
│                                                     │
│  START → route_to_workflow                          │
│              │                                      │
│    ┌─────────▼──────────┐                           │
│    │  primary_assistant │ ←──────────────┐          │
│    └─────────┬──────────┘                │          │
│              │ 意图识别 / 委派             │          │
│    ┌─────────┼──────────────────┐        │          │
│    ▼         ▼         ▼        ▼        │          │
│  flight   hotel      car      trip      │          │
│  _asst    _asst     _asst    _asst      │          │
│    │         │         │        │       │          │
│  safe/    safe/     safe/   safe/       │          │
│  sensitive sensitive sensitive sensitive│          │
│    │                            └───────┘          │
│    └──── interrupt_before (敏感工具) ────┘          │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                   MySQL                             │
│  travel DB（航班/酒店/租车/行程业务表）               │
│  t_lg_checkpoints（LangGraph 状态持久化）            │
│  t_chat_history（对话历史）                          │
│  t_user（用户账户）                                  │
└─────────────────────────────────────────────────────┘
```

### 多智能体设计

系统采用**主助理 + 专业子助理**的分层委派模式：

**主助理 (Primary Assistant)**
- 接收用户输入，判断意图
- 通过调用 `ToFlightAssistant` / `ToHotelAssistant` / `ToCarAssistant` / `ToTripAssistant` 这四个路由工具，将控制权委派给对应子助理
- 子助理完成任务后通过 `CompleteOrEscalate` 工具将控制权归还主助理

**子助理（各业务域）**

| 子助理 | 安全工具（只读） | 敏感工具（写操作，需审批） |
|--------|----------------|--------------------------|
| 航班助理 | `search_flights`, `fetch_user_flight_information` | `book_flight`, `update_ticket_to_new_flight`, `cancel_ticket` |
| 酒店助理 | `search_hotels`, `fetch_user_hotel_bookings` | `book_hotel`, `update_hotel`, `cancel_hotel` |
| 租车助理 | `search_car_rentals`, `fetch_user_car_bookings` | `book_car_rental`, `update_car_rental`, `cancel_car_rental` |
| 行程助理 | `search_trip_recommendations`, `fetch_user_trip_bookings` | `book_excursion`, `update_excursion`, `cancel_excursion` |

### Human-in-the-loop 机制

LangGraph 通过 `interrupt_before` 在执行敏感工具节点前暂停图的运行：

```python
graph = builder.compile(
    checkpointer=memory,
    interrupt_before=[
        "flight_sensitive_tools",
        "car_sensitive_tools",
        "hotel_sensitive_tools",
        "trip_sensitive_tools",
    ]
)
```

**审批流程：**

1. 用户发送消息 → 图运行至敏感工具节点前暂停
2. API 返回提示语，前端显示「批准 / 拒绝」按钮
3. 用户点击批准 → 前端发送 `"y"` → API 以 `None` 输入恢复图执行
4. 用户点击拒绝 → 前端发送 `"取消操作"` → API 注入 `ToolMessage(content="用户拒绝")` 恢复图，LLM 据此回复

### 状态管理 (State)

```python
class State(TypedDict):
    messages: Annotated[List[AnyMessage], add_messages]
    dialog_state: Annotated[List[Literal[
        "primary_assistant", "flight_assistant",
        "car_assistant", "hotel_assistant", "trip_assistant"
    ]], update_dialog_stack]
```

`dialog_state` 是一个栈结构，委派时压栈，子助理调用 `CompleteOrEscalate` 时弹栈，主助理始终在栈底。

### Checkpoint 持久化

`MySQLCheckpointSaver` 实现了 LangGraph 的 `BaseCheckpointSaver` 接口，将每一步的图状态序列化（`pickle`）后存入 MySQL，支持跨请求的多轮对话恢复。

```
t_lg_checkpoints       — 存储每个 checkpoint 的完整状态快照
t_lg_checkpoint_writes — 存储每个任务的中间写操作
```

---

## 项目结构

```
├── backend/
│   ├── main.py                      # FastAPI 应用工厂与启动入口
│   ├── app.py                       # Streamlit 独立演示界面
│   ├── graph_chat/
│   │   ├── graph.py                 # 图编译：组装所有子图，配置 interrupt_before
│   │   ├── build_primary_graph.py   # 主助理节点与路由逻辑
│   │   ├── build_child_graph.py     # 四个子助理子图（含 leave_skill 节点）
│   │   ├── agent_assistant.py       # 各助理的 Prompt + LLM.bind_tools Runnable
│   │   ├── assistant.py             # CtripAssistant 节点类（通用包装）
│   │   ├── base_data_model.py       # 路由工具数据模型（ToXxxAssistant, CompleteOrEscalate）
│   │   ├── state.py                 # 全局 State TypedDict 定义
│   │   ├── llm.py                   # LLM 实例初始化
│   │   ├── mysql_checkpointer.py    # 自定义 MySQL Checkpoint 实现
│   │   └── entry_node.py            # 子助理入口节点工厂函数
│   ├── tools/
│   │   ├── flights_tools.py         # 航班相关 LangChain @tool
│   │   ├── hotels_tools.py          # 酒店相关 @tool
│   │   ├── car_tools.py             # 租车相关 @tool
│   │   ├── trip_tools.py            # 行程相关 @tool
│   │   ├── search_tools.py          # 通用搜索工具
│   │   ├── retriever_vector.py      # 向量检索工具
│   │   ├── location_trans.py        # 地名/机场代码转换
│   │   ├── tools_handler.py         # ToolNode 错误回退封装
│   │   └── init_db.py               # 数据库时间初始化脚本
│   ├── api/
│   │   ├── routers.py               # 路由注册
│   │   ├── graph_api/
│   │   │   ├── graph_views.py       # /graph/ /chat/ /user/bookings/ 接口
│   │   │   └── graph_schemas.py     # 请求/响应 Pydantic Schema
│   │   └── system_mgt/
│   │       ├── user_views.py        # 注册、登录接口
│   │       └── user_schemas.py      # 用户相关 Schema
│   ├── db/
│   │   ├── dao.py                   # 通用 DAO 基类
│   │   └── system_mgt/
│   │       ├── models.py            # SQLAlchemy 用户模型
│   │       └── user_dao.py          # 用户数据访问对象
│   ├── utils/
│   │   ├── jwt_utils.py             # JWT 生成（python-jose）
│   │   ├── dependencies.py          # FastAPI 依赖注入
│   │   ├── middlewares.py           # 请求中间件（注入 username 到 request.state）
│   │   ├── cors.py                  # CORS 配置
│   │   ├── db_utils.py              # MySQL 连接池工具
│   │   ├── handler_error.py         # 全局异常处理
│   │   ├── log_utils.py             # Loguru 日志实例
│   │   ├── docs_oauth2.py           # Swagger UI OAuth2 配置
│   │   └── password_hash.py         # bcrypt 密码工具
│   └── config/
│       ├── __init__.py              # Dynaconf settings 导出
│       ├── development.yml          # 开发环境配置
│       ├── production.yml           # 生产环境配置
│       └── log_config.py            # Loguru 初始化
└── frontend/
    └── src/
        ├── App.jsx                  # 路由：登录态判断，渲染 Login/Register/Chat
        ├── components/
        │   ├── Chat.jsx             # 主界面：侧边栏 + 消息流 + 审批栏 + 输入框
        │   ├── Login.jsx            # 登录表单
        │   └── Register.jsx         # 注册表单
        └── index.css                # 全局样式（含 Google Fonts 引入）
```

---

## API 接口

所有接口均挂载在 `/api` 前缀下，除登录/注册外均需携带 `Authorization: Bearer <token>` 请求头。

### 用户认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/` | 登录，返回 JWT token |
| POST | `/api/register/` | 注册新用户 |

### 工作流

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/graph/` | 发送消息给 LangGraph，返回 AI 回复 |

请求体：
```json
{
  "user_input": "帮我查一下北京到上海的航班",
  "config": {
    "configurable": {
      "passenger_id": "3442 587242",
      "thread_id": "uuid-string"
    }
  }
}
```

响应体：
```json
{
  "assistant": "AI 回复内容"
}
```

> 当图在敏感工具前暂停时，`assistant` 字段返回审批提示语。前端检测到该提示后显示审批按钮，用户批准后以 `user_input: "y"` 再次调用本接口恢复执行。

### 对话历史

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/chat/save/` | 保存/更新对话（upsert by thread_id） |
| GET | `/api/chat/history/` | 获取当前用户最近 30 条对话列表 |
| GET | `/api/chat/history/{thread_id}/` | 获取指定对话的完整消息记录 |

### 订单

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/user/bookings/` | 获取当前用户的机票、酒店、租车订单 |

---

## 数据库设计

### 业务表（travel 数据库）

| 表名 | 说明 |
|------|------|
| `flights` | 航班信息（flight_id, flight_no, departure/arrival_airport, scheduled_departure/arrival） |
| `tickets` | 机票（ticket_no, book_ref, passenger_id） |
| `ticket_flights` | 机票-航班关联（ticket_no, flight_id, fare_conditions, amount） |
| `bookings` | 预订单（book_ref, book_date, total_amount） |
| `boarding_passes` | 登机牌（ticket_no, flight_id, seat_no） |
| `hotels` | 酒店（id, name, location, booked） |
| `car_rentals` | 租车（id, name, location, booked） |

### 系统表

| 表名 | 说明 |
|------|------|
| `t_user` | 用户账户（username, password_hash, create_time） |
| `t_lg_checkpoints` | LangGraph checkpoint 快照（thread_id, checkpoint_ns, checkpoint_id, pickle 序列化数据） |
| `t_lg_checkpoint_writes` | LangGraph 中间写操作记录 |
| `t_chat_history` | 对话历史（username, thread_id, title, messages JSON, updated_at） |

---

## 认证与安全

**JWT 认证流程：**

1. 用户登录 → 后端验证密码（bcrypt）→ 生成 JWT（python-jose，HS256 算法）
2. 前端将 token 存入 `localStorage`，每次请求附加 `Authorization: Bearer <token>`
3. `MyOAuth2PasswordBearer` 作为 FastAPI 全局依赖，拦截所有请求进行 token 验证
4. 中间件解析 token 后将 `username` 注入 `request.state`，供各接口直接使用

**敏感操作保护：**

LangGraph `interrupt_before` 机制确保所有写操作（预订、改签、退票）在执行前必须经过用户显式确认，AI 无法绕过此检查点自动执行。

---

## 快速开始

### 环境要求

- Python 3.12+
- Node.js 18+
- MySQL 8.0+

### 后端启动

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 初始化数据库（按顺序执行）
mysql -u root -p < create_user_table.sql
mysql -u root -p < create_checkpoint_tables.sql
mysql -u root -p < create_chat_history_table.sql
mysql -u root -p < travel2.sql

# 配置环境变量
# 编辑 backend/.env 填写数据库连接和 OpenAI Key

# 启动服务（默认 8000 端口）
python main.py
```

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

### Streamlit 演示界面（可选）

```bash
cd backend
streamlit run app.py
```

---

## 环境变量

`backend/.env`：

```env
# 数据库
DB_HOST=localhost
DB_PORT=3306
DB_NAME=travel
DB_USER=root
DB_PASSWORD=your_password

# LLM
OPENAI_API_KEY=your_openai_key
OPENAI_BASE_URL=https://api.openai.com/v1

# JWT
JWT_SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# 服务
HOST=0.0.0.0
PORT=8000
```

`frontend/.env`：

```env
VITE_API_BASE=http://127.0.0.1:8000/api
```



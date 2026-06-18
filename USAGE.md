# ERP 系统使用说明

## 目录

1. [系统概述](#系统概述)
2. [环境要求](#环境要求)
3. [快速开始](#快速开始)
4. [本地开发环境搭建](#本地开发环境搭建)
5. [系统功能说明](#系统功能说明)
6. [API 接口文档](#api-接口文档)
7. [数据库说明](#数据库说明)
8. [常见问题](#常见问题)

---

## 系统概述

本系统是一套面向制造型企业的数字化管理平台，包含以下核心模块：

| 模块 | 功能 |
|------|------|
| 客户管理 (CRM) | 客户资料、联系人、跟进记录管理 |
| 订单管理 | 订单创建、状态流转、订单查询 |
| 生产进度 | 生产工单、阶段跟踪、生产看板 |
| 库存管理 | 原材料/成品库存、出入库管理 |
| 质量管理 | 质检记录、质量问题追踪 |

### 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Python 3.11+ / FastAPI |
| 前端 | React 19 / TypeScript / Ant Design 6 |
| 数据库 | PostgreSQL 15 |
| 状态管理 | Zustand |
| 构建工具 | Vite 8 |
| 容器化 | Docker / Docker Compose |

---

## 环境要求

### 使用 Docker 部署（推荐）

- Docker Desktop 4.0+
- Docker Compose 2.0+

### 本地开发

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+

---

## 快速开始

### 方式一：Docker 部署（推荐）

```bash
# 1. 进入项目目录
cd /Users/rentianxiang/Downloads/Mimo

# 2. 创建环境配置文件
cp .env.example .env

# 3. 启动所有服务
docker-compose up -d

# 4. 访问系统
# 前端: http://localhost:3000
# API 文档: http://localhost:8000/docs
# 数据库: localhost:5432
```

### 方式二：本地开发

```bash
# 1. 启动数据库
docker-compose up -d postgres

# 2. 后端设置
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env
alembic upgrade head
uvicorn app.main:app --reload

# 3. 前端设置（新终端）
cd frontend
npm install
npm run dev
```

---

## 本地开发环境搭建

### 1. 数据库配置

#### 使用 Docker 启动 PostgreSQL

```bash
docker-compose up -d postgres
```

数据库连接信息：
- 主机: `localhost`
- 端口: `5432`
- 用户名: `erp_user`
- 密码: `erp_password`
- 数据库名: `erp_db`

#### 或使用本地 PostgreSQL

```sql
CREATE USER erp_user WITH PASSWORD 'erp_password';
CREATE DATABASE erp_db OWNER erp_user;
```

### 2. 后端配置

```bash
cd backend

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp ../.env.example .env
# 编辑 .env 文件，修改数据库连接信息（如需要）

# 运行数据库迁移
alembic upgrade head

# 启动开发服务器
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

后端启动后：
- API 服务: http://localhost:8000
- Swagger 文档: http://localhost:8000/docs
- ReDoc 文档: http://localhost:8000/redoc

### 3. 前端配置

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端启动后访问: http://localhost:5173

### 4. 运行测试

```bash
cd backend
pytest tests/ -v
```

---

## 系统功能说明

### 1. 仪表盘 (Dashboard)

访问路径: `/`

显示系统核心统计数据：
- 客户总数
- 订单总数
- 生产工单总数
- 质量统计

### 2. 客户管理

访问路径: `/customers`

#### 功能列表

| 功能 | 说明 |
|------|------|
| 客户列表 | 查看所有客户，支持搜索过滤 |
| 客户详情 | 查看客户详细信息、联系人、跟进记录 |
| 添加联系人 | 为客户添加联系人信息 |
| 添加跟进记录 | 记录客户沟通情况 |

#### 客户字段说明

| 字段 | 说明 |
|------|------|
| Code | 客户编码（唯一） |
| Name | 客户名称 |
| Level | 客户等级（normal/important/vip） |
| Country | 国家/地区 |
| Source | 客户来源 |
| Status | 状态（active/inactive） |

### 3. 订单管理

访问路径: `/orders`

#### 功能列表

| 功能 | 说明 |
|------|------|
| 订单列表 | 查看所有订单，按状态筛选 |
| 创建订单 | 新建订单并添加产品明细 |
| 订单详情 | 查看订单信息和产品列表 |
| 状态变更 | 修改订单状态 |

#### 订单状态流转

```
待确认 (pending)
  ↓
已确认 (confirmed)
  ↓
生产中 (production)
  ↓
品质检验 (quality)
  ↓
包装中 (packaging)
  ↓
待发货 (shipping)
  ↓
已完成 (completed)

任何阶段 → 已取消 (cancelled)
```

### 4. 生产进度管理

访问路径: `/production`

#### 功能列表

| 功能 | 说明 |
|------|------|
| 生产看板 | 显示生产统计数据 |
| 生产工单列表 | 查看所有生产工单 |
| 工单详情 | 查看工单信息和生产阶段 |

#### 生产阶段

系统支持以下生产阶段的跟踪：
1. 原料准备
2. 配料生产
3. 灌装
4. 包装
5. 质检
6. 入库
7. 发货

### 5. 库存管理

访问路径: `/inventory`

#### 功能列表

| 功能 | 说明 |
|------|------|
| 原材料列表 | 查看原材料库存，支持添加新材料 |
| 成品列表 | 查看成品库存，支持添加新产品 |
| 出入库记录 | 记录库存变动 |

#### 库存预警

当库存低于安全库存时，系统会显示红色警告标签。

### 6. 质量管理

访问路径: `/quality`

#### 功能列表

| 功能 | 说明 |
|------|------|
| 质检记录列表 | 查看所有质检记录 |
| 添加质检记录 | 创建新的质检记录 |
| 质量问题列表 | 查看和更新质量问题状态 |

#### 质检类型

- 原料检验 (material)
- 半成品检验 (semi_product)
- 成品检验 (finished)

---

## API 接口文档

### 基础信息

- Base URL: `http://localhost:8000/api/v1`
- 认证方式: Bearer Token (JWT)
- 内容类型: `application/json`

### 客户管理 API

```
GET    /customers              # 获取客户列表
POST   /customers              # 创建客户
GET    /customers/{id}         # 获取客户详情
PUT    /customers/{id}         # 更新客户
DELETE /customers/{id}         # 删除客户
POST   /customers/{id}/contacts     # 添加联系人
POST   /customers/{id}/follow-ups   # 添加跟进记录
```

### 订单管理 API

```
GET    /orders                 # 获取订单列表
POST   /orders                 # 创建订单
GET    /orders/{id}            # 获取订单详情
PUT    /orders/{id}            # 更新订单
PUT    /orders/{id}/status     # 更新订单状态
```

### 生产进度 API

```
GET    /production/dashboard        # 获取生产看板数据
GET    /production/orders           # 获取生产工单列表
POST   /production/orders           # 创建生产工单
GET    /production/orders/{id}      # 获取工单详情
PUT    /production/orders/{id}      # 更新工单
PUT    /production/orders/{id}/stages/{stage_id}  # 更新生产阶段
```

### 库存管理 API

```
GET    /inventory/materials         # 获取原材料列表
POST   /inventory/materials         # 创建原材料
GET    /inventory/products          # 获取成品列表
POST   /inventory/products          # 创建成品
POST   /inventory/transactions      # 创建出入库记录
GET    /inventory/transactions      # 获取出入库记录
```

### 质量管理 API

```
GET    /quality/inspections         # 获取质检记录列表
POST   /quality/inspections         # 创建质检记录
GET    /quality/inspections/{id}    # 获取质检详情
GET    /quality/issues              # 获取质量问题列表
PUT    /quality/issues/{id}         # 更新质量问题状态
```

### 完整 API 文档

启动后端服务后，访问以下地址查看完整 API 文档：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 数据库说明

### 数据表结构

| 表名 | 说明 |
|------|------|
| customers | 客户主表 |
| contacts | 联系人表 |
| follow_ups | 跟进记录表 |
| orders | 订单主表 |
| order_items | 订单明细表 |
| production_orders | 生产工单表 |
| production_stages | 生产阶段表 |
| materials | 原材料表 |
| finished_products | 成品表 |
| stock_transactions | 出入库记录表 |
| quality_inspections | 质检记录表 |
| quality_issues | 质量问题表 |

### 数据库迁移

```bash
cd backend

# 生成新的迁移文件
alembic revision --autogenerate -m "描述信息"

# 执行迁移
alembic upgrade head

# 回滚迁移
alembic downgrade -1
```

---

## 常见问题

### 1. Docker 启动失败

**问题**: `docker-compose up` 报错

**解决方案**:
```bash
# 检查 Docker 是否运行
docker info

# 清理并重新构建
docker-compose down -v
docker-compose up -d --build
```

### 2. 数据库连接失败

**问题**: 后端无法连接数据库

**解决方案**:
```bash
# 检查数据库是否运行
docker-compose ps

# 检查数据库日志
docker-compose logs postgres

# 确认 .env 文件中的数据库连接信息正确
cat .env
```

### 3. 前端构建失败

**问题**: `npm run build` 报错

**解决方案**:
```bash
# 清理依赖并重新安装
rm -rf node_modules package-lock.json
npm install

# 检查 TypeScript 错误
npx tsc --noEmit
```

### 4. 测试失败

**问题**: `pytest` 测试不通过

**解决方案**:
```bash
# 确保安装了测试依赖
pip install -r requirements.txt

# 运行详细测试输出
pytest tests/ -v --tb=long
```

### 5. 端口被占用

**问题**: 端口 8000/3000/5432 已被占用

**解决方案**:
```bash
# 查找占用端口的进程
lsof -i :8000

# 终止进程
kill -9 <PID>

# 或修改配置使用其他端口
# 后端: uvicorn app.main:app --port 8001
# 前端: 修改 vite.config.ts 中的 server.port
```

### 6. 如何重置数据库

```bash
# 停止服务
docker-compose down

# 删除数据卷
docker-compose down -v

# 重新启动
docker-compose up -d

# 重新运行迁移
cd backend
alembic upgrade head
```

---

## 项目结构

```
Mimo/
├── backend/                    # 后端代码
│   ├── app/
│   │   ├── main.py            # FastAPI 应用入口
│   │   ├── core/              # 核心配置
│   │   │   ├── config.py      # 环境变量配置
│   │   │   ├── database.py    # 数据库连接
│   │   │   └── security.py    # JWT 认证
│   │   ├── models/            # SQLAlchemy 数据模型
│   │   ├── schemas/           # Pydantic 请求/响应模型
│   │   ├── api/v1/            # API 路由
│   │   └── services/          # 业务逻辑层
│   ├── alembic/               # 数据库迁移
│   ├── tests/                 # 测试文件
│   └── requirements.txt       # Python 依赖
├── frontend/                   # 前端代码
│   ├── src/
│   │   ├── api/               # API 调用封装
│   │   ├── components/        # 公共组件
│   │   ├── pages/             # 页面组件
│   │   └── store/             # 状态管理
│   ├── package.json           # Node.js 依赖
│   └── vite.config.ts         # Vite 配置
├── docker-compose.yml          # Docker 编排
├── .env.example                # 环境变量示例
└── README.md                   # 项目说明
```

---

## 开发规范

### 代码风格

- 后端: 遵循 PEP 8 规范
- 前端: 使用 ESLint + Prettier

### Git 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

---

## 联系方式

如有问题或建议，请联系开发团队。

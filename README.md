# SmartFactory ERP

企业生产进度实时跟踪与客户维护管理系统。面向制造型企业的数字化管理平台，实现生产全过程实时跟踪、订单状态可视化管理以及客户关系维护。

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Python FastAPI + SQLAlchemy + Alembic |
| 前端 | React + TypeScript + Ant Design + Zustand |
| 数据库 | PostgreSQL 15 |
| 图表 | Recharts |
| 国际化 | react-i18next (中文/English/Español) |
| 部署 | Docker Compose / 本地部署 |

## 功能模块

### 基础模块
- **客户管理 (CRM)** — 客户档案、联系人、跟进记录、客户分析
- **订单管理** — 创建/编辑/删除订单、审批流程、状态管理、导出
- **生产管理** — 生产工单、工序跟踪、进度管理
- **库存管理** — 原材料/成品管理、出入库、库存预警
- **质量管理** — 质量检验、问题跟踪

### 扩展模块
- **消息通知** — 站内通知、自动推送、未读提醒
- **审批工作流** — 多级审批、可配置流程、手动/自动触发
- **采购管理** — 供应商管理、采购申请/订单、验收入库、退货
- **数据大屏** — 订单趋势、生产统计、库存概览、质量分析
- **报表导出** — Excel/PDF 导出（订单、生产、质量、库存）
- **系统管理** — 用户管理、数据字典、仪表盘配置、权限控制

## 快速开始

### 方式一：本地部署（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/Rtxer2/mimotest.git
cd mimotest

# 2. 一键启动
./start.sh

# 或生产模式（前端打包 + 后端服务）
./start.sh prod
```

访问 http://localhost:8000

### 方式二：Docker Compose

```bash
# 1. 复制环境配置
cp .env.example .env

# 2. 启动服务
docker-compose up -d

# 3. 访问应用
open http://localhost:8000
```

### 方式三：手动部署

```bash
# 1. 启动 PostgreSQL
docker-compose up -d postgres

# 2. 后端
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8000

# 3. 前端（开发模式）
cd frontend
npm install
npm run dev
```

## 默认账户

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@erp.local | admin123 |

## 项目结构

```
├── backend/
│   ├── app/
│   │   ├── api/v1/          # API 路由
│   │   ├── core/            # 配置、安全、数据库
│   │   ├── models/          # SQLAlchemy 模型
│   │   ├── schemas/         # Pydantic 数据模型
│   │   └── services/        # 业务逻辑
│   ├── alembic/             # 数据库迁移
│   └── scripts/             # 种子数据
├── frontend/
│   └── src/
│       ├── api/             # API 客户端
│       ├── components/      # 公共组件
│       ├── i18n/            # 国际化翻译
│       ├── pages/           # 页面组件
│       ├── store/           # 状态管理
│       └── utils/           # 工具函数
├── scripts/                 # 部署/备份脚本
├── docker-compose.yml
└── Dockerfile
```

## API 文档

启动后端后访问：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 数据备份

```bash
# 备份数据库
./scripts/backup.sh

# 查看备份列表
./scripts/list-backups.sh

# 恢复数据库
./scripts/restore.sh ./backups/erp_backup_20260619_120000.sql.gz
```

## 角色权限

| 功能 | admin | manager | operator | viewer |
|------|:-----:|:-------:|:--------:|:------:|
| 查看所有模块 | ✅ | ✅ | ✅ | ✅ |
| 创建/编辑数据 | ✅ | ✅ | ✅ | ❌ |
| 删除数据 | ✅ | ❌ | ❌ | ❌ |
| 用户管理 | ✅ | ❌ | ❌ | ❌ |
| 审批流程配置 | ✅ | ❌ | ❌ | ❌ |
| 采购管理 | ✅ | ✅ | ✅ | ❌ |
| 报表导出 | ✅ | ✅ | ✅ | ❌ |

## 许可证

MIT

# 藏书印钤印日志

基于 Vue 3 + Element Plus 前端与 Express + SQLite 后端的藏书印钤印记录管理应用。核心模块是钤印记录而非印章本身，每条记录关联一枚印章编号。

## 功能

- 钤印记录列表（表格展示，按日期倒序排列）
- 钤印记录详情查看
- 新增 / 编辑 / 删除（完整 CRUD）
- 字段：印章编号、书名、作者、钤印页码、钤印日期、简短备注
- 首次启动空库时自动写入 5 条示例数据

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3、Element Plus、Pinia、Vue Router、axios、Vite |
| 后端 | Express、sql.js（纯 JS SQLite，无需原生编译） |
| 数据库 | `./backend/data/stamp_records.db`（自动生成，不入库） |

## 目录结构

```
├── backend/          # API 服务（端口 5000）
│   ├── data/         # SQLite 数据库文件（自动生成）
│   ├── routes/
│   │   └── records.js
│   ├── db.js
│   └── server.js
├── frontend/         # Web 界面（端口 5101）
│   └── src/
│       ├── api/
│       ├── router/
│       ├── stores/
│       └── views/
└── README.md
```

## 环境要求

- Node.js 18+
- npm（项目内安装依赖，无需全局 pnpm/yarn）

## 启动方式

> Windows PowerShell 不支持 `&&`，请用下方**分步命令**或**项目根目录脚本**。

### 方式 A：项目根目录（推荐）

```bash
# 安装依赖（首次）
npm run install:all

# 终端 1 - 后端
npm start

# 终端 2 - 前端
npm run dev
```

### 方式 B：分别进入子目录

**后端：**

```bash
cd backend
npm install
npm start
```

后端运行于 [http://localhost:5000](http://localhost:5000)

**前端（新开终端）：**

```bash
cd frontend
npm install
npm run dev
```

前端运行于 [http://localhost:5101](http://localhost:5101)

### 常见问题

| 现象 | 处理 |
|------|------|
| `&&` 不是有效语句 | 改用方式 A，或分多条命令执行 |
| 端口 5101 被占用 | Vite 会自动尝试下一端口，看终端输出的实际地址 |
| 页面空白 / 加载失败 | 确认已执行 `npm install`，且后端已在 5000 端口运行 |
| 数据库文件从哪来 | 首次启动后端时自动创建并写入 5 条示例数据 |

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/records` | 获取全部钤印记录 |
| GET | `/api/records/:id` | 获取单条钤印记录 |
| POST | `/api/records` | 新增钤印记录 |
| PUT | `/api/records/:id` | 更新钤印记录 |
| DELETE | `/api/records/:id` | 删除钤印记录 |

### 请求/响应示例

**新增记录 (POST /api/records)**

请求体：
```json
{
  "seal_id": "SEAL-001",
  "book_title": "红楼梦",
  "author": "曹雪芹",
  "page_number": 37,
  "stamp_date": "2024-03-15",
  "remark": "钤于第三回扉页"
}
```

响应：
```json
{
  "data": {
    "id": 1,
    "seal_id": "SEAL-001",
    "book_title": "红楼梦",
    "author": "曹雪芹",
    "page_number": 37,
    "stamp_date": "2024-03-15",
    "remark": "钤于第三回扉页",
    "created_at": "2024-03-15 10:30:00",
    "updated_at": "2024-03-15 10:30:00"
  }
}
```

## 数据字段

| 字段 | 中文名 | 说明 |
|------|--------|------|
| `id` | 记录编号 | 自增主键 |
| `seal_id` | 印章编号 | 关联的印章编号，如 SEAL-001 |
| `book_title` | 书名 | 钤印的书籍名称 |
| `author` | 作者 | 书籍作者 |
| `page_number` | 钤印页码 | 正整数 |
| `stamp_date` | 钤印日期 | YYYY-MM-DD 格式 |
| `remark` | 备注 | 简短备注，选填 |
| `created_at` | 创建时间 | 自动生成 |
| `updated_at` | 更新时间 | 自动更新 |

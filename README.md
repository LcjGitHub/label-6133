# 个人藏书印管理

基于 Vue 3 + Element Plus 前端与 Express + SQLite 后端的藏书印（印章）管理 MVP。

## 功能

- 印章卡片列表（`el-row` / `el-col` 布局）
- 印章详情查看
- 新增 / 编辑 / 删除（基础 CRUD）
- 字段：印文、材质、尺寸、刻制日期、用途、图片 URL
- 内置 5 条种子数据

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3、Element Plus、Pinia、Vue Router、axios、Vite |
| 后端 | Express、sql.js（纯 JS SQLite，无需原生编译） |
| 数据库 | `./backend/data/seals.db` |

## 目录结构

```
├── backend/          # API 服务（端口 5000）
│   ├── data/         # SQLite 数据库（自动生成）
│   ├── routes/
│   ├── db.js
│   └── server.js
├── frontend/         # Web 界面（端口 5101）
│   └── src/
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

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/seals` | 获取全部印章 |
| GET | `/api/seals/:id` | 获取单条印章 |
| POST | `/api/seals` | 新增印章 |
| PUT | `/api/seals/:id` | 更新印章 |
| DELETE | `/api/seals/:id` | 删除印章 |

## 数据字段

| 字段 | 说明 |
|------|------|
| `inscription` | 印文 |
| `material` | 材质 |
| `size` | 尺寸 |
| `carved_date` | 刻制日期（YYYY-MM-DD） |
| `purpose` | 用途 |
| `image_url` | 图片 URL（选填） |

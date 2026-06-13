# 印材图鉴

基于 Vue 3 + Element Plus 前端与 Express + SQLite 后端的中国传统印章材料图鉴应用。收录各类印章石材、玉石等印材信息，帮助用户了解和查阅印材知识。

## 功能

- 印材列表（卡片网格展示，支持响应式布局）
- 印材详情查看（大图展示 + 完整信息）
- 新增 / 编辑 / 删除（完整 CRUD）
- 字段：印材名称、产地、硬度描述、参考颜色、简介文字、示意图片链接
- 首次启动空库时自动写入 5 条示例数据

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3、Element Plus、Pinia、Vue Router、axios、Vite |
| 后端 | Express、sql.js（纯 JS SQLite，无需原生编译） |
| 数据库 | `./backend/data/stamp_materials.db`（自动生成，不入库） |

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
| GET | `/api/records` | 获取全部印材 |
| GET | `/api/records/:id` | 获取单个印材详情 |
| POST | `/api/records` | 新增印材 |
| PUT | `/api/records/:id` | 更新印材 |
| DELETE | `/api/records/:id` | 删除印材 |

### 请求/响应示例

**新增印材 (POST /api/records)**

请求体：
```json
{
  "name": "寿山石",
  "origin": "福建省福州市寿山乡",
  "hardness": "摩氏硬度2-3，质地温润细腻",
  "color": "色彩丰富，有红、黄、白、黑、灰、绿等色",
  "description": "寿山石是中国传统四大印章石之首，被誉为\"石中之王\"。",
  "image_url": "https://picsum.photos/seed/shoushan/400/400"
}
```

响应：
```json
{
  "data": {
    "id": 1,
    "name": "寿山石",
    "origin": "福建省福州市寿山乡",
    "hardness": "摩氏硬度2-3，质地温润细腻",
    "color": "色彩丰富，有红、黄、白、黑、灰、绿等色",
    "description": "寿山石是中国传统四大印章石之首，被誉为\"石中之王\"。",
    "image_url": "https://picsum.photos/seed/shoushan/400/400",
    "created_at": "2024-03-15 10:30:00",
    "updated_at": "2024-03-15 10:30:00"
  }
}
```

## 数据字段

| 字段 | 中文名 | 说明 |
|------|--------|------|
| `id` | 印材编号 | 自增主键 |
| `name` | 印材名称 | 如：寿山石、青田石 |
| `origin` | 产地 | 印材的产地信息 |
| `hardness` | 硬度描述 | 摩氏硬度及质地描述 |
| `color` | 参考颜色 | 印材的颜色特征 |
| `description` | 简介文字 | 印材的详细介绍 |
| `image_url` | 示意图片链接 | 公开可访问的图片 URL |
| `created_at` | 创建时间 | 自动生成 |
| `updated_at` | 更新时间 | 自动更新 |

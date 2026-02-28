# 项目规格说明（SPEC）

初始要求（来自 `.github/copilot-instructions.md`):

- 使用 Next.js 框架。
- 后端使用 serverless 架构，部署在 Vercel 平台上。
- 使用 Supabase 作为数据库，存储信息和数据。
- 满足 `.github/SPEC.md` 文件中描述的功能需求。
- 把交流中提出的新需求记录在 `.github/SPEC.md` 文件中，并在程序设计中满足这些新需求。
- 以 `my-app` 文件夹为 workspace。
- 更新 `.gitignore` 文件，忽略 `node_modules`、`.next`、`.vercel` 等不必要的文件夹和文件。

## 已实现功能（截至 2026-02-28）:

✅ **核心功能**
- 支持文件上传（PDF、MD、TXT），存储在 Supabase Storage 并在 `files` 表保存元数据。
- 文件列表显示与实时更新
- 文件详情预览与文本提取
- 文件删除功能（同时删除存储和数据库记录）

✅ **API 端点**
- `GET /api/files` - 获取文件列表
- `POST /api/files` - 上传新文件
- `DELETE /api/files/[id]` - 删除文件

✅ **前端功能**
- 主界面显示文件列表和上传按钮
- 文件详情页可在选项卡中预览 PDF/MD 或查看纯文本
- 英文界面
- 响应式移动端适配设计

✅ **项目配置**
- Next.js 配置优化（`next.config.js`）
- 环境配置示例文件 `.env.example`
- 详细的 README.md 文档，包含快速开始指南
- 更新的 `.gitignore` 忽略不必要文件

✅ **文本提取功能**
- PDF 文本提取（使用 pdf-parse）✅ 实现完成
- MD 文本提取（直接 UTF-8 读取）✅
- TXT 文本提取（直接 UTF-8 读取）✅

## 功能详细说明:

### 1. 文件上传功能 & PDF 文本提取
- 支持 PDF、MD、TXT 格式
- 文件存储在 Supabase Storage
- 文件元数据保存在数据库
- **自动文本提取**：
  - **PDF**：使用 `pdf-parse` 库，支持多页面文本提取
    - 实现：`const parser = new PDFParse(uint8Array); await parser.load(); const result = await parser.getText();`
    - 返回：`{ text: '提取的全部文本', pages: [{...}, ...] }`
    - 支持 serverless 环境（纯 JavaScript 库，无系统依赖）
  - **MD/TXT**：直接读取为 UTF-8 文本
### 2. 文件查阅功能
- **PDF 文件**：
  - PDF 预览（嵌入式查看器）
  - 提取的文本内容（支持滚动）
- **MD 文件**：
  - 格式化预览（HTML 渲染）
  - 原始 Markdown 文本（支持滚动）
- **TXT 文件**：
  - 原始文本显示（支持滚动）

### 3. 文件管理功能
- 查看已上传文件列表
- 删除文件（同时删除存储和数据库记录）
- 实时更新文件列表

## UI 设计（已实现）:

### 首页布局
- **顶部**：文件管理标题和上传按钮
- **左侧**：文件列表面板
  - 显示文件计数
  - 每个文件显示名称、查看按钮和删除按钮
  - 支持选中状态高亮
- **右侧**：文件详情面板（选中文件后显示）
  - 文件名称和关闭按钮
  - 选项卡式视图切换

### 视觉设计
- 现代化配色（蓝色主题 #0066cc）
- Flexbox 响应式布局
- 清晰的按钮状态反馈
- 光滑的过渡效果
- 合理的字体大小和行高
- 移动设备上自动调整布局

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Next.js | 16.1.6 |
| 前端 | React | 18.2.0 |
| 后端 | Serverless | Vercel 兼容 |
| 数据库 | Supabase | 最新 |
| 文件存储 | Supabase Storage | - |
| 文件处理 | pdf-parse | 2.4.5 |
| Markdown | markdown-it | 14.0.0 |
| 文件上传 | formidable | 3.5.4 |

## 项目结构

```
my-app/
├── pages/
│   ├── index.js                    # 主页面（文件列表和详情）
│   └── api/
│       ├── files/
│       │   ├── index.js            # GET/POST 文件列表和上传
│       │   └── [id].js             # DELETE 删除文件
│       └── summary.js              # 摘要 API（预留）
├── lib/
│   ├── supabaseServer.js           # Supabase 服务端客户端
│   └── supabaseClient.js           # Supabase 客户端（预留）
├── public/                         # 静态资源
├── .next/                          # Next.js 构建输出（git 忽略）
├── next.config.js                  # Next.js 配置
├── package.json                    # NPM 依赖
├── package-lock.json               # 依赖锁定文件
├── .env.example                    # 环境变量示例
├── .env.local                      # 本地环境变量（git 忽略）
└── README.md                       # 详细文档
```

## 限制说明

- 仅支持 PDF、MD、TXT 格式文件的上传和查阅
- 不设置登录功能（所有用户共享文件空间）
- Vercel 部署有文件大小和请求超时限制
- 无身份验证或权限管理

## 部署说明

### Vercel 部署
1. Push 代码到 GitHub
2. 连接仓库到 Vercel
3. 配置环境变量：
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. 部署

### Supabase 设置
1. 创建 `files` 表
2. 创建 `files` Storage bucket
3. 获取 API 密钥和 URL

## 开发指南

### 本地开发
```bash
cd my-app
npm install
npm run dev
```

### 构建
```bash
npm run build
npm start
```

### 环境配置
创建 `.env.local`：
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 更新历史

| 日期 | 更新内容 |
|------|---------|
| 2026-02-28 | 初始实现：上传、预览、删除功能；现代化 UI；完整文档 |
| 2026-02-28 | ✅ PDF 文本提取完成实现：使用 pdf-parse 库，支持 serverless 环境 |

后续如有新需求，请在本文件追加条目并说明变更日期。

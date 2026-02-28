GitHub Models Integration Guide
================================

您已经配置了 GitHub Token，可以成功使用 GitHub Models 进行 AI 总结生成！

## 优先级规则

系统按以下优先级自动选择 AI 模型：

1. **GitHub Token** (优先级最高) - 如果 `GITHUB_TOKEN` 存在则使用
2. **OpenAI API Key** (优先级次之) - 如果未设置 GitHub Token 则使用
3. **错误** - 两个都未设置时

## 当前配置

您的 `.env.local` 已配置：
```env
GITHUB_TOKEN=github_pat_...
```

系统现在会使用 GitHub Models 通过 GitHub Copilot Pro 进行总结生成。

## GitHub Models 优势

✅ **免费额度** - GitHub Copilot Pro 订阅包含免费的 AI 调用额度
✅ **集成** - 与 GitHub 账户无缝集成
✅ **安全** - 企业级安全和隐私保护
✅ **稳定性** - 微软 Azure 基础设施支持

## 工作流程

```
前端请求生成总结
    ↓
lib/ai.js 检查 GITHUB_TOKEN
    ↓
使用 GitHub Models API (Azure 端点)
    ↓
获取生成结果
    ↓
存储到 Supabase
    ↓
显示在前端
```

## API 端点

当使用 GitHub Token 时：
- **基础 URL**: https://models.inference.ai.azure.com
- **模型**: gpt-4-mini
- **认证**: 使用 GitHub Token 作为 Bearer token

## 可用模型

GitHub Models 当前支持的模型：
- `gpt-4o` - 最强大的模型（推荐）
- `gpt-4-turbo` - 强大的模型
- `gpt-3.5-turbo` - 快速模型
- `claude-3.5-sonnet` - Anthropic Claude
- `llama-2` - Meta Llama
- `mistral` - Mistral AI
- `phi-3` - Microsoft Phi

当前项目配置使用 **`gpt-4o`**（推荐用于文档总结）。

## 环境配置方式

### 只使用 GitHub Token
```env
# .env.local
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
GITHUB_TOKEN=github_pat_...
# 不需要 OPENAI_API_KEY
```

### 备用 OpenAI Key
```env
# .env.local
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
GITHUB_TOKEN=github_pat_...        # 优先使用
OPENAI_API_KEY=sk-...              # 备用
```

## 使用步骤

1. **启动服务器**
   ```bash
   npm run dev
   ```

2. **上传文件**
   - 在 UI 中上传 PDF/MD/TXT 文件

3. **生成总结**
   - 点击 "✨ Summary" 标签
   - 点击 "🤖 Generate Summary"
   - 系统自动使用 GitHub Models

4. **查看结果**
   - 总结会在几秒内显示
   - 支持设置自定义提示词

## 故障排除

### 错误：Token 无效
```
Error: Invalid authentication
```
**解决方案：**
- 验证 GitHub token 是否正确复制
- 确保 token 有足够权限
- 检查 token 是否过期

### 错误：超出使用限额
```
Error: Rate limit exceeded
```
**解决方案：**
- GitHub Copilot Pro 订阅通常有足够额度处理许多请求
- 检查 GitHub 账户的使用统计
- 考虑使用 OpenAI API 作为备用

### 错误：连接超时
```
Error: Connection timeout
```
**解决方案：**
- 检查网络连接
- 验证 Azure 端点可访问
- 稍后重试

## 性能特性

**GitHub Models via GitHub Copilot Pro:**
- 延迟：2-10 秒（取决于文件大小）
- 可靠性：High（微软 Azure 支持）
- 成本：Free（包含在 Copilot Pro 订阅中）

## 与 OpenAI 的对比

| 特性 | GitHub Models | OpenAI |
|------|---|---|
| 认证 | GitHub Token | API Key |
| 基础设施 | Azure | OpenAI |
| 成本 | Free (Copilot Pro) | 按使用量付费 |
| 隐私 | 企业级 | 标准 |
| 速度 | 快速 | 快速 |
| 可靠性 | 高 | 高 |

## 切换到 OpenAI（如需）

如果想临时使用 OpenAI：

1. 移除或注释 `GITHUB_TOKEN`
2. 添加 `OPENAI_API_KEY`
3. 重启服务器

系统会自动检测并使用 OpenAI。

## 最佳实践

✅ **Do:**
- 保持 GitHub token 安全，不要提交到 git
- 定期检查使用统计
- 为大文件设置合理的提示词指导
- 监控 API 调用成本（如使用 OpenAI 时）

❌ **Don't:**
- 在代码中硬编码 token
- 分享你的 GitHub token
- 尝试使用过期的 token
- 一次性生成大量总结（节省额度）

## 更多信息

- GitHub Models 文档：https://docs.github.com/en/github-models
- GitHub Copilot Pro：https://github.com/features/copilot/pro
- 项目文档：见 `AI_SETUP.md`

---

有任何问题，请查看项目的其他文档或检查 GitHub Copilot 的使用统计。

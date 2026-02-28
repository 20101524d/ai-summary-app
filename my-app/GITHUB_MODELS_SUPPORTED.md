GitHub Models 支持的模型列表
============================

## ✅ 问题已解决

GitHub Models 不支持 `gpt-4-mini` 模型。已更新为使用 `gpt-4o`。

## 📋 GitHub Models 支持的模型

GitHub Models（通过 GitHub Copilot Pro）当前支持以下模型：

### 🏆 推荐使用

| 模型 | 性能 | 速度 | 成本 | 用途 |
|------|------|------|------|------|
| **gpt-4o** | ⭐⭐⭐⭐⭐ | 快 | 低 | 通用任务、总结 |

### 其他可用模型

| 模型 | 性能 | 速度 | 备备注 |
|------|------|------|------|
| gpt-4-turbo | ⭐⭐⭐⭐ | 中等 | 复杂任务 |
| gpt-3.5-turbo | ⭐⭐⭐ | 快 | 简单任务 |
| Claude 3.5 Sonnet | ⭐⭐⭐⭐⭐ | 中等 | 高质量输出 |
| Llama 2 | ⭐⭐⭐ | 快 | 开源选择 |
| Mistral | ⭐⭐⭐⭐ | 快 | 平衡方案 |
| Phi 3 | ⭐⭐ | 快 | 轻量级 |

## 🔧 当前配置

项目已配置为：

**GitHub Models 优先：**
```javascript
// 使用 gpt-4o (GitHub Models 支持)
const githubOpenAI = createOpenAI({
  apiKey: githubToken,
  baseURL: 'https://models.inference.ai.azure.com',
})
model = githubOpenAI('gpt-4o')
```

**OpenAI 降级：**
```javascript
// 如果未设置 GITHUB_TOKEN，使用 OpenAI 的 gpt-4-mini
model = openai('gpt-4-mini')
```

## 📊 模型选择建议

### 总结任务（当前使用）
✅ **首选**: `gpt-4o` (GitHub Models)
- 性能最强
- 速度快
- 完全免费（Copilot Pro 内）

### 文本生成任务
✅ `gpt-4-turbo` - 复杂内容
✅ `gpt-3.5-turbo` - 快速生成

### 代码相关任务
✅ `gpt-4o` - 最强代码理解
✅ `Claude 3.5 Sonnet` - 优秀的结构化输出

## 🚀 如何切换模型

如果想尝试其他模型，修改 `lib/ai.js`:

```javascript
// 改为使用其他模型
const modelName = 'claude-3.5-sonnet' // 改为你想要的模型
const githubOpenAI = createOpenAI({...})
model = githubOpenAI(modelName)
```

## ⚠️ 常见错误

### 错误：Unknown model: gpt-4-mini
```
原因：尝试在 GitHub Models 中使用 gpt-4-mini
解决：使用 gpt-4o 代替
```

### 错误：Authentication failed
```
原因：GITHUB_TOKEN 无效或过期
解决：检查 GitHub token 有效期
```

### 错误：Rate limit exceeded
```
原因：超过使用限额
解决：等待一段时间或使用 OpenAI API 作为备用
```

## 📝 使用场景对应的模型

```
文档总结 (当前任务)
  ├─ GitHub Models: gpt-4o ✅ (推荐)
  └─ OpenAI: gpt-4-mini
  
代码分析
  ├─ GitHub Models: gpt-4o ✅
  └─ OpenAI: gpt-4-turbo
  
创意写作
  ├─ GitHub Models: Claude 3.5 Sonnet
  └─ OpenAI: gpt-4o

快速响应
  ├─ GitHub Models: gpt-3.5-turbo
  └─ OpenAI: gpt-3.5-turbo
```

## 🔄 API 端点信息

### GitHub Models
```
基础 URL: https://models.inference.ai.azure.com
认证: Bearer Token (GitHub Token)
支持的模型: 见上表
成本: 免费 (Copilot Pro 订阅内)
```

### OpenAI
```
基础 URL: https://api.openai.com/v1
认证: Bearer Token (API Key)
支持的模型: 多种
成本: 按使用量付费
```

## 💡 最佳实践

1. **优先使用 GitHub Models**
   - 免费（包含在 Copilot Pro）
   - 性能优秀
   - 速度快

2. **作为备用使用 OpenAI**
   - 在 GitHub Models 不可用时
   - 需要特定模型时

3. **监控使用**
   - GitHub: 检查 Copilot Pro 额度
   - OpenAI: 检查使用成本

## 📞 更多信息

- [GitHub Models 官方文档](https://docs.github.com/en/github-models)
- [GitHub Copilot Pro](https://github.com/features/copilot/pro)
- [ai SDK 文档](https://sdk.vercel.ai)

---

**现已配置为使用 gpt-4o (GitHub Models)，完全免费！** 🎉

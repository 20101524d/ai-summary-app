# 数据库清空指南

## 🧹 如何清空数据库以便测试

### 方法 1: 快速清空所有数据（推荐）

1. **打开 Supabase SQL 编辑器**
   - 登录 Supabase 后台
   - 进入 `SQL Editor`

2. **运行清空脚本**
   - 复制 `CLEANUP_DATABASE.sql` 中的内容
   - 粘贴到 SQL 编辑器
   - 点击 `Run` 或按 `Ctrl+Enter`

3. **验证结果**
   ```sql
   SELECT COUNT(*) FROM files;
   SELECT COUNT(*) FROM summaries;
   SELECT COUNT(*) FROM prompts;
   ```
   所有表应该返回 `0`

### 方法 2: 按需选择清空

如果只想清空特定的表：

```sql
-- 只清空 summaries (总结)
DELETE FROM summaries;
ALTER SEQUENCE summaries_id_seq RESTART WITH 1;

-- 只清空 prompts (提示词)
DELETE FROM prompts;
ALTER SEQUENCE prompts_id_seq RESTART WITH 1;

-- 只清空 files (文件)
DELETE FROM files;
ALTER SEQUENCE files_id_seq RESTART WITH 1;
```

### 方法 3: 保留 Storage 但清空数据库

如果文件已上传到 Supabase Storage，但你想清空数据库中的记录：

```sql
-- 清空数据库记录（不删除 Storage 中的文件）
DELETE FROM summaries;
DELETE FROM prompts;
DELETE FROM files;

-- 重置 ID 序列
ALTER SEQUENCE summaries_id_seq RESTART WITH 1;
ALTER SEQUENCE prompts_id_seq RESTART WITH 1;
ALTER SEQUENCE files_id_seq RESTART WITH 1;
```

然后手动在 Storage 中删除文件：
- 进入 Supabase 后台 → Storage → files bucket
- 选择文件并删除

### 方法 4: 完全重置（包括 Storage）

如果想彻底清空一切：

1. **清空数据库**（同上）

2. **清空 Storage**
   - 进入 Supabase 后台 → Storage
   - 选择 `files` bucket 中的所有文件
   - 点击删除

3. **重新初始化表结构**
   ```sql
   -- 如果表被删除，重新运行 DATABASE_SETUP.sql
   ```

## 📋 清空流程详解

### 为什么需要按顺序删除？

数据库有外键约束：
```
files (主表)
  ↓ (referenced by)
summaries (file_id → files.id)
prompts (file_id → files.id)
```

如果直接删除 `files`，会因为外键约束而失败。
正确的顺序是：`summaries` → `prompts` → `files`

### 为什么重置 ID 序列？

```sql
ALTER SEQUENCE summaries_id_seq RESTART WITH 1;
```

这会让新上传的文件 ID 从 1 开始，而不是从上次的最后一个 ID 继续。
这在测试时很有用，可以保证 ID 的可预测性。

## ⚠️ 注意事项

### 不可逆操作
- ✅ 清空数据库 **无法撤销**，请确保不需要数据
- ✅ 定期备份重要数据
- ✅ 在生产环境前务必测试

### Supabase Storage 说明
- 删除数据库中的文件记录 **不会自动删除** Storage 中的文件
- 需要手动在 Storage 中删除，或直接删除整个 bucket

### 数据库事务
所有操作都在同一个事务中运行。如果任何语句失败，整个操作会回滚。

## 🔄 完整测试流程

```
1. 运行 CLEANUP_DATABASE.sql
   ↓
2. 验证所有表为空
   ↓
3. 上传新文件测试
   ↓
4. 生成 AI 总结测试
   ↓
5. 设置提示词测试
   ↓
6. 验证数据正确保存
   ↓
7. 重复需要时清空并重新测试
```

## 💡 测试建议

### 场景 1: 测试基本功能
```bash
# 1. 清空数据库
# 运行 CLEANUP_DATABASE.sql

# 2. 启动应用
npm run dev

# 3. 测试上传
# - 上传文件
# - 验证文件出现在列表

# 4. 测试总结
# - 生成 AI 总结
# - 验证总结保存

# 5. 测试提示词
# - 设置自定义提示词
# - 验证提示词已保存
```

### 场景 2: 测试多文件
```bash
# 1. 清空数据库
# 运行 CLEANUP_DATABASE.sql

# 2. 上传多个文件（PDF, MD, TXT）

# 3. 为不同文件设置不同提示词

# 4. 为每个文件生成总结

# 5. 验证独立存储
```

### 场景 3: 测试边界条件
```bash
# 1. 清空数据库

# 2. 测试大文件上传

# 3. 测试特殊字符提示词

# 4. 测试 API 错误处理
```

## 🔍 验证命令

清空后运行以下命令验证：

```sql
-- 1. 检查表是否为空
SELECT COUNT(*) as table_count, 'files' as table_name FROM files
UNION ALL
SELECT COUNT(*), 'summaries' FROM summaries
UNION ALL
SELECT COUNT(*), 'prompts' FROM prompts;

-- 2. 检查索引是否完好
SELECT * FROM pg_indexes 
WHERE tablename IN ('files', 'summaries', 'prompts');

-- 3. 检查外键约束是否完好
SELECT constraint_name, table_name, column_name
FROM information_schema.key_column_usage
WHERE table_name IN ('files', 'summaries', 'prompts');
```

## 📱 从应用界面清空

如果不想使用 SQL，也可以从应用中一个一个删除：

1. 打开应用 (`npm run dev`)
2. 在"Files"列表中选中每个文件
3. 点击"Delete"按钮
4. 重复直到列表为空

但这比较慢，特别是有很多测试数据时。

## 🆘 问题排除

### 问题: 外键约束错误
```
ERROR: update or delete on table "files" violates foreign key constraint
```
**解决**: 先删除 summaries 和 prompts，再删除 files

### 问题: 序列不存在
```
ERROR: relation "summaries_id_seq" does not exist
```
**解决**: 跳过 ALTER SEQUENCE 语句，只运行 DELETE

### 问题: 权限不足
```
ERROR: permission denied
```
**解决**: 确保使用 service role key 连接，不是 anon key

---

现在您可以随时清空数据库进行测试！ 🚀

# Database Integration - Quick Reference

## Database Tables at a Glance

### 3 Main Tables:
1. **files** - Document metadata and extracted text
2. **summaries** - AI-generated summary content per file  
3. **prompts** - AI system prompts (file-specific or global default)

## Quick Setup

```bash
# 1. Copy environment template
cp .env.example .env.local

# 2. Add your Supabase credentials to .env.local
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...

# 3. Create database tables using DATABASE_SETUP.sql
# (Run SQL in Supabase Dashboard → SQL Editor)

# 4. Start development server
npm run dev
```

## API Quick Reference

### Files
```bash
# Upload file
curl -F "file=@document.pdf" http://localhost:3000/api/files

# List files
curl http://localhost:3000/api/files

# Delete file
curl -X DELETE http://localhost:3000/api/files/1
```

### Summaries
```bash
# Get summary
curl "http://localhost:3000/api/summary?file_id=1"

# Generate summary (AI will use appropriate prompt)
curl -X POST http://localhost:3000/api/summary \
  -H "Content-Type: application/json" \
  -d '{"file_id": 1}'
```

### Prompts
```bash
# Get global default prompt
curl http://localhost:3000/api/prompts/default

# Set global default prompt
curl -X POST http://localhost:3000/api/prompts/default \
  -H "Content-Type: application/json" \
  -d '{"prompt_text": "Summarize concisely"}'

# Set file-specific prompt
curl -X POST http://localhost:3000/api/prompts/1 \
  -H "Content-Type: application/json" \
  -d '{"prompt_text": "Focus on technical aspects"}'

# Get file-specific or default prompt
curl http://localhost:3000/api/prompts/1

# Delete file-specific prompt (reverts to default)
curl -X DELETE http://localhost:3000/api/prompts/1
```

## Data Model

### files table
```
id          → Auto-incrementing primary key
name        → Original filename
type        → MIME type (e.g., application/pdf)
path        → Storage path in Supabase
text        → Extracted text content
url         → Signed URL for access
size        → File size in bytes
created_at  → Upload timestamp
```

### summaries table
```
id          → Auto-incrementing primary key
file_id     → Foreign key to files (CASCADE DELETE)
content     → The AI-generated summary
model       → AI model used (e.g., "gpt-4-mini")
created_at  → Generation timestamp
updated_at  → Last modification time
UNIQUE      → One summary per file
```

### prompts table
```
id          → Auto-incrementing primary key
file_id     → Foreign key to files (NULL for default)
prompt_text → The AI system prompt
is_default  → Boolean (only one globally)
created_at  → Creation timestamp
updated_at  → Last modification time
```

## Frontend Integration

### Displaying Summaries
```javascript
// Get summary
const res = await fetch(`/api/summary?file_id=${fileId}`);
const data = await res.json();
console.log(data.content); // AI summary text
```

### Managing Prompts
```javascript
// Set custom prompt for a file
const res = await fetch(`/api/prompts/${fileId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt_text: 'Custom prompt here' })
});

// Generate summary using stored prompt
const res = await fetch('/api/summary', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ file_id: fileId })
});
const { content } = await res.json();
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection error | Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local |
| "Table does not exist" | Run SQL from DATABASE_SETUP.sql in Supabase |
| Summary generation fails | Verify AI credentials (GITHUB_TOKEN or OPENAI_API_KEY) |
| File not found in DB | Check Supabase "files" table, verify upload completed |
| Signed URL expired | URLs regenerate automatically (24-hour expiry) |

## Performance Tips

- **Indices**: Already created for `created_at`, `file_id`, `is_default`
- **Unique Constraints**: Prevents duplicate summaries per file
- **Cascade Deletes**: Automatically clean up related summaries/prompts
- **Pagination**: Future enhancement for large file lists

## File Size Limits

- Vercel: 100MB per request
- AI Models: Token limits (automatically truncate)
- Supabase Storage: Project-dependent quota

## Security Notes

- 🔒 Service role key kept server-side only
- 🔒 File paths stored in database (not exposed to client)
- 🔒 Signed URLs generated on-demand with 24-hour expiry
- 🔒 All API inputs validated before database operations
- 🔒 No authentication required (future enhancement: add auth)

## Environment Variables

```env
# Required
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxx

# AI (choose one)
GITHUB_TOKEN=github_pat_xxxx              # Option 1
OPENAI_API_KEY=sk-xxxx                    # Option 2
```

## Useful Supabase Queries

```sql
-- List all files with summary status
SELECT f.id, f.name, COUNT(s.id) as has_summary
FROM files f
LEFT JOIN summaries s ON f.id = s.file_id
GROUP BY f.id;

-- Find files without summaries
SELECT f.id, f.name FROM files f
WHERE NOT EXISTS (SELECT 1 FROM summaries WHERE file_id = f.id);

-- Get prompt usage
SELECT file_id, COUNT(*) FROM prompts GROUP BY file_id;

-- Storage usage
SELECT ROUND(SUM(size::numeric)/1024/1024, 2) as size_mb FROM files;
```

## Prompt Fallback Logic

When generating a summary, the system selects a prompt in this order:

```
1. Custom prompt for this file? → Use it
2. Global default prompt? → Use it
3. Neither? → Use hardcoded default:
   "请用中文生成一份简洁的文档总结，包括主要内容、关键点和结论。"
```

This ensures summaries always use the most appropriate prompt.

## Documentation References

- **Detailed Guide**: See `DATABASE_INTEGRATION.md`
- **Setup Checklist**: See `DATABASE_CHECKLIST.md`
- **SQL Schemas**: See `DATABASE_SETUP.sql`
- **Getting Started**: See `README.md`

## Common Development Tasks

### Add a new API endpoint
1. Create file in `/pages/api/`
2. Use `createSupabaseServer()` to get database client
3. Handle GET/POST/DELETE methods as needed
4. Return JSON responses with appropriate status codes

### Query the database
```javascript
import { createSupabaseServer } from '../../lib/supabaseServer'

const supabase = createSupabaseServer()
const { data, error } = await supabase
  .from('files')
  .select('*')
  .order('created_at', { ascending: false })
```

### Deploy to Vercel
1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy (automatic on push to main)

---

**Last Updated**: February 28, 2026  
**Status**: ✅ Production Ready

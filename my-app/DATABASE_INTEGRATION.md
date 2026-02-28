# AI Summary App - Database Integration Guide

## Overview
This document provides a complete guide to the Postgres database integration in Supabase for the AI Summary App. The app stores documents, AI-generated summaries, and custom AI prompts in Supabase.

## Database Architecture

### Tables Structure

#### 1. **files** table
Stores metadata about uploaded documents.

```sql
CREATE TABLE IF NOT EXISTS files (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  type TEXT,
  path TEXT NOT NULL,
  text TEXT,
  url TEXT,
  size INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at DESC);
```

**Fields:**
- `id`: Unique identifier for the file
- `name`: Original filename
- `type`: MIME type (application/pdf, text/markdown, text/plain)
- `path`: Storage path in Supabase Storage
- `text`: Extracted text content from the file (automatically extracted on upload)
- `url`: Signed URL for accessing the file (regenerated on demand)
- `size`: File size in bytes
- `created_at`: Timestamp of upload

#### 2. **summaries** table
Stores AI-generated summaries for documents.

```sql
CREATE TABLE IF NOT EXISTS summaries (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  file_id BIGINT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  model TEXT DEFAULT 'gpt-4-mini',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(file_id)
);

CREATE INDEX IF NOT EXISTS idx_summaries_file_id ON summaries(file_id);
CREATE INDEX IF NOT EXISTS idx_summaries_created_at ON summaries(created_at DESC);
```

**Fields:**
- `id`: Unique identifier for the summary
- `file_id`: Foreign key reference to the file
- `content`: The AI-generated summary text
- `model`: AI model used for generation (e.g., "gpt-4-mini")
- `created_at`: When the summary was first generated
- `updated_at`: Last update timestamp
- **UNIQUE constraint**: Ensures one summary per file

#### 3. **prompts** table
Stores custom AI prompts and default system prompt configuration.

```sql
CREATE TABLE IF NOT EXISTS prompts (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  file_id BIGINT REFERENCES files(id) ON DELETE CASCADE,
  prompt_text TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prompts_file_id ON prompts(file_id);
CREATE INDEX IF NOT EXISTS idx_prompts_is_default ON prompts(is_default) WHERE is_default = TRUE;
```

**Fields:**
- `id`: Unique identifier for the prompt
- `file_id`: Foreign key (NULL for default prompts)
- `prompt_text`: The AI system prompt
- `is_default`: Boolean flag for default prompt (only one should exist)
- `created_at`: When the prompt was created
- `updated_at`: Last modification timestamp

**Prompt Logic:**
- When `file_id` is NULL and `is_default` is TRUE: Global default prompt
- When `file_id` is set: Custom prompt for that specific file
- Priority order: Custom file prompt > Default prompt > Hardcoded default

## API Endpoints

### Files Management
- `POST /api/files` - Upload a new file
- `GET /api/files` - List all uploaded files
- `DELETE /api/files/[id]` - Delete a file and its summaries

### Summaries Management
- `GET /api/summary?file_id=[id]` - Get existing summary
- `POST /api/summary` - Generate new summary
  - Request body: `{ file_id: number }`
  - Features:
    - Fetches file content from database
    - Uses custom prompt if available, otherwise uses default
    - Stores/updates summary in database

### Prompts Management

#### File-Specific Prompts
- `GET /api/prompts/[file_id]` - Get prompt for file (or default if none)
- `POST/PUT /api/prompts/[file_id]` - Create/update custom prompt
- `DELETE /api/prompts/[file_id]` - Delete custom prompt

#### Default Prompts
- `GET /api/prompts/default` - Get global default prompt
- `POST/PUT /api/prompts/default` - Create/update default prompt
- `DELETE /api/prompts/default` - Delete default prompt

## Data Flow Diagram

```
Upload Flow:
User File → /api/files (POST)
           └─→ Store in Supabase Storage
           └─→ Extract text (PDF/MD/TXT)
           └─→ Save metadata to `files` table
           └─→ Return file metadata

Summary Generation Flow:
User Request → /api/summary (POST)
            └─→ Fetch file content from `files.text`
            └─→ Get custom prompt from `prompts` (if exists)
            └─→ Fall back to default prompt from `prompts`
            └─→ Call AI API (GitHub Models or OpenAI)
            └─→ Insert/Update `summaries` table
            └─→ Return summary content

Prompt Management Flow:
User Input → /api/prompts/[id] (POST/PUT)
          └─→ Check if custom prompt exists
          └─→ Insert or update in `prompts` table
          └─→ Return confirmation
```

## Environment Configuration

Required environment variables in `.env.local`:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Configuration (choose one)
GITHUB_TOKEN=your-github-token                # For GitHub Models API
# OR
OPENAI_API_KEY=your-openai-api-key           # For OpenAI API
```

## Database Initialization Steps

### Step 1: Create Tables in Supabase
1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL commands from `DATABASE_SETUP.sql`:
   - Create `files` table (should already exist)
   - Create `summaries` table
   - Create `prompts` table
   - Create all necessary indices

### Step 2: Configure Storage
1. Go to Supabase Dashboard → Storage
2. Create a bucket named `files`
3. Set permissions (public read access recommended for signed URLs)

### Step 3: Test Connection
```bash
# Run the development server
npm run dev

# Visit http://localhost:3000
# Upload a test file to verify database integration
```

## Security Considerations

1. **Authentication**: Currently public (no user authentication)
   - Future: Add row-level security (RLS) for multi-user support
   
2. **Storage Permissions**: 
   - Files are stored with signed URLs (24-hour expiry)
   - Signed URLs are regenerated on-demand

3. **API Keys**:
   - `SUPABASE_SERVICE_ROLE_KEY` should be kept in server environment only
   - Never expose in client-side code

4. **Data Validation**:
   - All inputs are validated before database operations
   - File size limits enforced by Vercel (100MB)
   - Token limits enforced by AI APIs

## Backup and Recovery

### Backup Strategy
```sql
-- Regular exports from Supabase Dashboard
-- Settings → Database → Backups
```

### Data Recovery
1. Use Supabase Dashboard backups
2. Or manually restore from SQL exports
3. Recommended: Weekly backups to external storage

## Performance Optimization

### Queries Optimization
- **Files list**: Indexed by `created_at` for fast listing
- **Summary lookup**: Direct by `file_id` (UNIQUE constraint)
- **Default prompt**: Indexed by `is_default` flag

### Caching Strategy
- Client-side: Summary content cached in React state
- Server-side: Database handles caching naturally
- Storage: Signed URLs cached in frontend (24-hour validity)

### Pagination (Future)
```javascript
// For large file lists
const { data, count } = await supabase
  .from('files')
  .select('*', { count: 'exact' })
  .range(0, 19)  // Items 0-19
  .order('created_at', { ascending: false })
```

## Troubleshooting

### Common Issues

**1. "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"**
- Check `.env.local` file exists
- Verify credentials in Supabase Dashboard

**2. "Database not responding"**
- Check Supabase project status in dashboard
- Verify network connectivity
- Check API rate limits

**3. "Summary generation fails"**
- Verify AI credentials (GITHUB_TOKEN or OPENAI_API_KEY)
- Check file content extraction (should be in `files.text`)
- Monitor token limits for large files

**4. "File not found in database"**
- Verify file upload completes successfully
- Check `files` table in Supabase SQL Editor
- Confirm Storage bucket exists

## Monitoring and Logging

### Database Metrics
- Monitor query performance in Supabase Dashboard
- Check storage usage in Files → Storage
- Review API activity logs

### Application Logging
```javascript
// API endpoints log important actions
console.log('[Summary API] File ID:', file_id)
console.log('[Summary API] Custom Prompt found:', !!customPrompt)
console.log('[File Upload] File saved to path:', path)
```

## Future Enhancements

1. **Multi-user Support**
   - Add user authentication with Supabase Auth
   - Implement row-level security (RLS)
   - Add user_id to all tables

2. **Advanced Features**
   - File versioning/history
   - Collaborative editing with presence
   - Full-text search across summaries
   - Summary comparison tools

3. **Performance**
   - Implement pagination for file lists
   - Add caching layer (Redis)
   - Batch summary generation
   - Async job queue

## References

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [PostgreSQL JSON](https://www.postgresql.org/docs/current/datatype-json.html)
- [Row-Level Security](https://supabase.com/docs/guides/auth/row-level-security)

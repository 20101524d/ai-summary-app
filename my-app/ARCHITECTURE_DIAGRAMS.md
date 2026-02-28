# Database Integration Architecture Diagram

## System Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                      User Browser                              │
├───────────────────────────────────────────────────────────────┤
│  • File upload UI                                              │
│  • File list view                                              │
│  • Summary display                                             │
│  • Prompt settings                                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP/REST
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼─────┐    ┌───────▼───────┐   ┌────▼────┐
   │ Upload   │    │ Summary API   │   │ Prompts │
   │Endpoint  │    │   Endpoint    │   │Endpoint │
   └────┬─────┘    └───────┬───────┘   └────┬────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼──────┐
                    │ Next.js API │
                    │   Routes    │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐      ┌──────▼──────┐    ┌────▼─────┐
   │ Storage │      │  Database   │    │   AI API  │
   │ (Files) │      │ (PostgreSQL)│    │ (GitHub/  │
   │         │      │             │    │  OpenAI)  │
   └────┬────┘      └──────┬──────┘    └──────────┘
        │                  │
   ┌────▼────────────────────────┐
   │  Supabase                    │
   │  ├─ Storage bucket           │
   │  │  └─ Stores file content   │
   │  │                           │
   │  └─ PostgreSQL schemas:      │
   │     ├─ files table           │
   │     ├─ summaries table       │
   │     └─ prompts table         │
   └──────────────────────────────┘
```

## Data Flow Diagram

### 1. File Upload Flow
```
User selects file
    │
    ▼
POST /api/files (multipart/form-data)
    │
    ├─→ Upload to Supabase Storage
    │
    ├─→ Extract text (PDF/MD/TXT)
    │
    ├─→ INSERT INTO files table
    │   ├─ name
    │   ├─ type
    │   ├─ path
    │   ├─ text (extracted)
    │   └─ created_at
    │
    └─→ Return file object with ID
         │
         ▼
    Display in file list
```

### 2. Summary Generation Flow
```
User clicks "Generate Summary"
    │
    ▼
POST /api/summary { file_id: N }
    │
    ├─→ FROM files WHERE id = N
    │   └─ Get: text, name, path
    │
    ├─→ FROM prompts WHERE file_id = N
    │   └─ Check: Custom prompt exists?
    │
    ├─→ If no custom prompt:
    │   FROM prompts WHERE is_default = true
    │   └─ Get: Global default prompt
    │
    ├─→ Select prompt (custom > default > hardcoded)
    │
    ├─→ Call AI API with:
    │   ├─ File text
    │   └─ Selected prompt
    │
    ├─→ Receive AI summary
    │
    ├─→ Check existing summary
    │   └─ UPDATE or INSERT into summaries
    │
    └─→ Return { summary_id, content }
         │
         ▼
    Display in Summary tab
```

### 3. Prompt Management Flow
```
User saves custom prompt
    │
    ▼
POST/PUT /api/prompts/[file_id] { prompt_text }
    │
    ├─→ Validate prompt not empty
    │
    ├─→ Check if prompt exists for file
    │   └─ SELECT * FROM prompts WHERE file_id = N
    │
    ├─→ If exists:
    │   └─ UPDATE prompts SET prompt_text, updated_at
    │
    ├─→ If not exists:
    │   └─ INSERT INTO prompts (file_id, prompt_text, created_at)
    │
    └─→ Return success response
         │
         ▼
    Used in next summary generation
```

## Database Schema Relationships

```
┌──────────────────────┐
│      files           │
├──────────────────────┤
│ id (PK)              │
│ name                 │
│ type                 │
│ path                 │
│ text ← extracted!    │
│ url                  │
│ size                 │
│ created_at           │
└────┬────────────┬────┘
     │            │
     │ 1          │ 1
     │            │
┌────▼────────┐  │
│  summaries   │  │
├──────────────┤  │
│ id (PK)      │  │
│ file_id (FK) ◄──┘
│ content      │
│ model        │
│ created_at   │
│ updated_at   │
│ UNIQUE       │ ← One per file!
└──────────────┘

     Also:
┌──────────────────────┐
│     prompts          │
├──────────────────────┤
│ id (PK)              │
│ file_id (FK) ◄──┐    │
│ prompt_text      │    │
│ is_default       │    │
│ created_at       │    │
│ updated_at       │    │
└──────────────────┘
   (NULL if default)
```

## API Endpoint Map

```
/api/files/
├── GET          → List all files
├── POST         → Upload new file (auto text extract)
└── [id]
    └── DELETE   → Delete file (cascade cleanup)

/api/summary
├── GET          → Get existing summary for file_id
└── POST         → Generate new/update summary

/api/prompts/
├── GET          → List all prompts
├── [id]
│   ├── GET      → Get prompt for [id] (custom or default)
│   ├── POST     → Create file prompt
│   ├── PUT      → Update file prompt
│   └── DELETE   → Delete file prompt
│
└── default
    ├── GET      → Get global default prompt
    ├── POST     → Create default prompt
    ├── PUT      → Update default prompt
    └── DELETE   → Delete default prompt
```

## Text Extraction Pipeline

```
Uploaded File
    │
    ├─ Is PDF?
    │  └─→ Use pdf-parse library
    │     └─ Extract pages → full text
    │
    ├─ Is MD?
    │  └─→ UTF-8 read
    │     └─ Store as-is
    │
    └─ Is TXT?
       └─→ UTF-8 read
          └─ Store as-is
          │
          └─→ Stored in files.text column
             Used for:
             ├─ Text tab display
             ├─ AI summary input
             └─ Search (future)
```

## Prompt Selection Logic

```
Generate Summary (file_id = 123)
    │
    ├─ SELECT FROM prompts WHERE file_id = 123
    │  └─ Found? Use it
    │
    ├─ If not found:
    │  ├─ SELECT FROM prompts WHERE file_id IS NULL AND is_default = true
    │  │  └─ Found? Use it
    │  │
    │  └─ If still not found:
    │     └─ Use hardcoded:
    │        "请用中文生成一份简洁的文档总结..."
    │
    ▼
Selected Prompt + File Text → AI API → Summary
```

## Database Indices

```
files table:
├─ idx_files_created_at
│  └─ For: sorting, timeline queries
│
summaries table:
├─ idx_summaries_file_id
│  └─ For: quick lookup by file
│
└─ idx_summaries_created_at
   └─ For: recent summaries list
   
prompts table:
├─ idx_prompts_file_id
│  └─ For: file-specific lookup
│
└─ idx_prompts_is_default
   └─ For: default prompt lookup
```

## Security & Data Integrity

```
Cascade Delete Logic:
┌──────────────┐
│ Delete file  │
└──────┬───────┘
       │
       ├─→ files.id = 123 is deleted
       │
       ├─→ Trigger: summaries.file_id = 123 deleted
       │   (CASCADE DELETE constraint)
       │
       ├─→ Trigger: prompts.file_id = 123 deleted
       │   (CASCADE DELETE constraint)
       │
       └─→ Storage file also deleted
           (manual in API)

Result: Clean data, no orphans!
```

## Performance Optimization

```
Fast Queries:
├─ Get file list
│  └─ O(log N) → Index on created_at
│
├─ Get summary
│  └─ O(1) → Direct by file_id (UNIQUE)
│
├─ Get prompt
│  └─ O(log N) → Index on file_id or is_default
│
└─ List all files
   └─ O(N log N) → Sorted by created_at DESC

Slow operations (acceptable):
├─ Full-text search (future enhancement)
├─ Large batch operations
└─ Complex analytics queries
```

## Deployment Architecture

```
┌──────────────┐
│   GitHub     │
│ (Source)     │
└──────┬───────┘
       │
       │ git push
       ▼
┌──────────────┐
│   Vercel     │
│ (Frontend    │◄─── Environment variables:
│  + API)      │     ├─ SUPABASE_URL
└──────┬───────┘     ├─ SUPABASE_SERVICE_ROLE_KEY
       │             ├─ GITHUB_TOKEN (or OPENAI_API_KEY)
       │             └─ Other settings
       │
       ├─→ Deploys Next.js
       ├─→ Runs API routes
       │
       └──────────────┬─────────────────┐
                      │                 │
                  ┌───▼────┐    ┌──────▼────┐
                  │Supabase│    │ AI Provider│
                  │PostgreS│    │API Servers │
                  │  Storage   │             │
                  └────────┘    └────────────┘
```

---

**Complete database integration ready for production deployment! 🚀**

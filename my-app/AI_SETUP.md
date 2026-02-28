AI Summary Configuration Guide
===============================

This document explains how to set up and use the AI summary functionality.

## Prerequisites

Ensure you have completed the basic setup from `README.md` and have Supabase configured.

## Step 1: Set Up Database Tables

Run the SQL commands in `DATABASE_SETUP.sql` in your Supabase SQL Editor:

1. Log in to your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `DATABASE_SETUP.sql`
4. Execute the SQL

This creates the `summaries` and `prompts` tables required for the AI features.

## Step 2: Configure API Key

### Option A: Using GitHub Models (Recommended)

1. Get a GitHub token with the required scopes
2. Add to `.env.local`:
   ```env
   GITHUB_TOKEN=github_pat_...
   ```
3. This provides free AI inference through GitHub Copilot Pro

### Option B: Using OpenAI API (Fallback)

1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Add to `.env.local`:
   ```env
   OPENAI_API_KEY=sk-...
   ```

**Priority**: If both are set, GitHub Models will be used first.

For detailed GitHub Models usage, see [GITHUB_MODELS.md](./GITHUB_MODELS.md).

## Step 3: Test the Feature

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Upload a file (PDF, MD, or TXT)

3. Click "View" to open the file details

4. Click the "✨ Summary" tab

5. Click "🤖 Generate Summary" to generate an AI summary

## How to Use

### Generating Summaries

For each file, you can:

1. **Generate Summary**: Click "🤖 Generate Summary" to use the AI to create a summary
   - Uses the file-specific prompt if set
   - Falls back to default prompt if file-specific prompt not set
   - Falls back to built-in default if no prompts configured

2. **Manage Prompts**: Click "⚙️ Settings" to:
   - View/edit the custom prompt for this specific file
   - Save custom prompts to guide AI behavior
   - Delete custom prompts to use defaults

### About Prompts

**System Prompts** control how the AI generates summaries:

- **File-specific prompts**: Apply only to a particular file
- **Default prompt**: Used for any file without a custom prompt
- **Built-in default**: "请用中文生成一份简洁的文档总结，包括主要内容、关键点和结论。"

Example prompts:

```
# Technical Documentation
请用中文总结以下技术文档，重点突出技术架构、核心概念和实现要点。

# Business Report
请用中文总结以下商业文档，重点包括目标、关键指标和行动plan。

# Academic Paper
请用中文总结以下学术文档，重点突出研究问题、方法论和主要发现。

# Quick Summary
使用3-5个要点总结文档的核心内容。
```

## API Endpoints

### Summary Management

- **GET /api/summary?file_id={id}** - Get existing summary for a file
- **POST /api/summary** - Generate or update a summary
  - Body: `{ "file_id": <id> }`

### Prompt Management

- **GET /api/prompts** - List all prompts
- **GET /api/prompts/{id}** - Get prompt for file with ID (or default)
- **PUT /api/prompts/{id}** - Update/create prompt for file
  - Body: `{ "prompt_text": "..." }`
- **DELETE /api/prompts/{id}** - Delete custom prompt for file
- **GET /api/prompts/default** - Get default prompt

## Troubleshooting

### "OPENAI_API_KEY not configured"
- Ensure `.env.local` has `OPENAI_API_KEY` set
- Restart the dev server after changing .env.local

### "File not found"
- Ensure the file was uploaded successfully
- Check file still exists in your file list

### "Failed to generate summary"
- Check your API key is valid
- Check your OpenAI account has credits
- Check file size (very large files may timeout)
- Check network connection

### Summary not appearing after generation
- Wait a moment for the API call to complete
- Check browser console for errors
- Verify database connection

## Performance Notes

- Summaries are truncated to 8000 tokens before sending to AI (API limits)
- Summary generation may take 10-30 seconds depending on file size
- Very large files may timeout

## Privacy & Security

- Summaries are stored in your Supabase database
- Prompts are stored in your Supabase database
- File content is sent to OpenAI API for processing
- Ensure your API keys are kept secret and not committed to version control

## Future Enhancements

- [ ] Support for GitHub Models with Copilot pro
- [ ] Batch summary generation for multiple files
- [ ] Summary regeneration history/versions
- [ ] Prompt templates library
- [ ] Custom summary length options

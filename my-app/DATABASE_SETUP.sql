-- AI Summary App - Supabase Database Setup
-- Run these SQL commands in your Supabase SQL Editor

-- 1. Create summaries table
CREATE TABLE IF NOT EXISTS summaries (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  file_id BIGINT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  model TEXT DEFAULT 'gpt-4-mini',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(file_id)
);

-- 2. Create prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  file_id BIGINT REFERENCES files(id) ON DELETE CASCADE,
  prompt_text TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create indices for better query performance
CREATE INDEX IF NOT EXISTS idx_summaries_file_id ON summaries(file_id);
CREATE INDEX IF NOT EXISTS idx_prompts_file_id ON prompts(file_id);
CREATE INDEX IF NOT EXISTS idx_prompts_is_default ON prompts(is_default) WHERE is_default = TRUE;

-- Notes:
-- - The 'files' table should already exist from the file upload feature
-- - Summaries are tied to files with a UNIQUE constraint (one summary per file)
-- - Prompts can be file-specific or default (when file_id is NULL and is_default is TRUE)
-- - Both tables have automatic timestamps for tracking creation and updates

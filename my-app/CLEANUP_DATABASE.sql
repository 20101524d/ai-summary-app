-- AI Summary App - Database Cleanup Script
-- Run this in your Supabase SQL Editor to clear all test data

-- WARNING: This will delete ALL data from the tables
-- Use only for testing purposes!

-- 1. Delete summaries (has foreign key to files)
DELETE FROM summaries;

-- 2. Delete prompts (has foreign key to files)
DELETE FROM prompts;

-- 3. Delete files (original table)
DELETE FROM files;

-- Reset auto-increment IDs (optional - makes IDs start from 1 again)
-- For PostgreSQL (Supabase), this is done with sequences:
ALTER SEQUENCE summaries_id_seq RESTART WITH 1;
ALTER SEQUENCE prompts_id_seq RESTART WITH 1;
ALTER SEQUENCE files_id_seq RESTART WITH 1;

-- Verify the cleanup
SELECT COUNT(*) as files_count FROM files;
SELECT COUNT(*) as summaries_count FROM summaries;
SELECT COUNT(*) as prompts_count FROM prompts;

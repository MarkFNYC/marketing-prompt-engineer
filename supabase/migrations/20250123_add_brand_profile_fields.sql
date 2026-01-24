-- Migration: Add brand profile fields to projects table
-- Date: 2025-01-23
-- Description: Adds target_audience and brand_voice fields to enable richer brand context

-- Add new columns to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS target_audience TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS brand_voice TEXT DEFAULT '';

-- Add comment for documentation
COMMENT ON COLUMN projects.target_audience IS 'Description of the ideal customer/audience for this brand';
COMMENT ON COLUMN projects.brand_voice IS 'Brand voice and tone guidelines for content generation';

-- Create an index on user_id for faster lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

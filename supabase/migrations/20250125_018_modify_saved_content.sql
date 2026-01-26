-- Migration: Add campaign reference to saved_content table
-- Version: 1.1
-- Date: January 2025

-- Add campaign_id foreign key
ALTER TABLE saved_content
ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL;

-- Add index
CREATE INDEX IF NOT EXISTS idx_saved_content_campaign_id ON saved_content(campaign_id);

-- Add column comment
COMMENT ON COLUMN saved_content.campaign_id IS 'Optional link to parent campaign. NULL for legacy outputs or quick-saves outside campaign flow.';

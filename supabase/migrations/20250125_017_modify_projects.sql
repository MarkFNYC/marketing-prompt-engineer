-- Migration: Add new fields to projects table (brand profile)
-- Version: 1.1
-- Date: January 2025
-- Note: In this app, "projects" serves as the brand profile table

-- Add persistent mandatories
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS persistent_mandatories TEXT[] DEFAULT '{}';

-- Add persistent constraints
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS persistent_constraints TEXT;

-- Add value proposition
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS value_proposition TEXT;

-- Add column comments
COMMENT ON COLUMN projects.persistent_mandatories IS 'Elements that must appear in all outputs: legal disclaimers, taglines, brand elements';
COMMENT ON COLUMN projects.persistent_constraints IS 'Limitations applying to all campaigns: regulatory, competitive, resource constraints';
COMMENT ON COLUMN projects.value_proposition IS 'One-liner differentiator used to inform AI context';

-- Migration: Create campaign-related ENUM types
-- Version: 1.1
-- Date: January 2025

-- Campaign entry mode
CREATE TYPE campaign_mode AS ENUM ('discovery', 'directed');

-- Structured goal categories
CREATE TYPE campaign_goal_type AS ENUM ('awareness', 'consideration', 'conversion', 'retention');

-- Performance Memory outcomes
CREATE TYPE campaign_outcome AS ENUM ('worked', 'didnt_work', 'mixed', 'pending');

-- Strategy Check interaction results
CREATE TYPE strategy_check_result AS ENUM ('shown', 'accepted', 'overridden', 'dismissed');

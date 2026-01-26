-- Migration: Create campaigns table
-- Version: 1.1
-- Date: January 2025

CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- Basic info
    name VARCHAR(255) NOT NULL,
    mode campaign_mode NOT NULL,
    discipline VARCHAR(50),

    -- Discovery Mode brief (rich)
    business_problem TEXT,
    success_metric TEXT,
    success_metric_value VARCHAR(100),
    timeline DATE,
    budget VARCHAR(50),
    campaign_constraints TEXT,
    what_been_tried TEXT,

    -- Directed Mode brief (light)
    goal_type campaign_goal_type,
    goal_description TEXT,
    campaign_mandatories TEXT[],

    -- Message Strategy
    message_strategy_options JSONB,
    selected_message_strategy JSONB,

    -- Media Strategy
    media_strategy_options JSONB,
    selected_media_strategy JSONB,

    -- Strategy Check (Directed)
    strategy_check_shown BOOLEAN DEFAULT FALSE,
    strategy_check_recommendation TEXT,
    strategy_check_user_response strategy_check_result,

    -- Performance Memory
    outcome campaign_outcome DEFAULT 'pending',
    outcome_notes TEXT,
    outcome_metrics JSONB,
    outcome_recorded_at TIMESTAMPTZ,
    ai_generated_learning TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_brand_id ON campaigns(brand_id);
CREATE INDEX idx_campaigns_mode ON campaigns(mode);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);
CREATE INDEX idx_campaigns_outcome ON campaigns(outcome) WHERE outcome != 'pending';
CREATE INDEX idx_campaigns_search ON campaigns
    USING GIN (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(business_problem, '')));

-- RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own campaigns" ON campaigns
    FOR ALL USING (auth.uid() = user_id);

-- Trigger for updated_at (uses existing function if available)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_campaigns_timestamp
    BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

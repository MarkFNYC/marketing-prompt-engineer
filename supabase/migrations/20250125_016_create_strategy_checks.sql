-- Migration: Create strategy_checks analytics table
-- Version: 1.1
-- Date: January 2025

CREATE TABLE strategy_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,

    discipline VARCHAR(50) NOT NULL,
    goal_type campaign_goal_type,
    goal_description TEXT,

    misalignment_severity VARCHAR(20),
    recommendation_shown TEXT,
    alternative_disciplines TEXT[],

    check_result strategy_check_result NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_strategy_checks_user_id ON strategy_checks(user_id);
CREATE INDEX idx_strategy_checks_campaign_id ON strategy_checks(campaign_id);
CREATE INDEX idx_strategy_checks_created_at ON strategy_checks(created_at DESC);
CREATE INDEX idx_strategy_checks_result ON strategy_checks(check_result);

-- RLS
ALTER TABLE strategy_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own strategy checks" ON strategy_checks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own strategy checks" ON strategy_checks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Migration: Create helper functions for campaigns
-- Version: 1.1
-- Date: January 2025

-- Function: Get full campaign context for AI prompt injection
CREATE OR REPLACE FUNCTION get_campaign_context(p_campaign_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'campaign', jsonb_build_object(
            'id', c.id,
            'name', c.name,
            'mode', c.mode,
            'business_problem', c.business_problem,
            'success_metric', c.success_metric,
            'success_metric_value', c.success_metric_value,
            'timeline', c.timeline,
            'budget', c.budget,
            'campaign_constraints', c.campaign_constraints,
            'what_been_tried', c.what_been_tried,
            'goal_type', c.goal_type,
            'goal_description', c.goal_description,
            'campaign_mandatories', c.campaign_mandatories,
            'selected_message_strategy', c.selected_message_strategy,
            'selected_media_strategy', c.selected_media_strategy
        ),
        'brand', jsonb_build_object(
            'id', p.id,
            'name', p.name,
            'industry', p.industry,
            'target_audience', p.target_audience,
            'brand_voice', p.brand_voice,
            'value_proposition', p.value_proposition,
            'persistent_mandatories', p.persistent_mandatories,
            'persistent_constraints', p.persistent_constraints
        )
    ) INTO v_result
    FROM campaigns c
    JOIN projects p ON p.id = c.brand_id
    WHERE c.id = p_campaign_id;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user's campaign history for Performance Memory
CREATE OR REPLACE FUNCTION get_user_campaign_history(
    p_user_id UUID,
    p_brand_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    campaign_id UUID,
    campaign_name VARCHAR(255),
    mode campaign_mode,
    goal_type campaign_goal_type,
    business_problem TEXT,
    selected_message_strategy JSONB,
    outcome campaign_outcome,
    outcome_notes TEXT,
    ai_generated_learning TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.name,
        c.mode,
        c.goal_type,
        c.business_problem,
        c.selected_message_strategy,
        c.outcome,
        c.outcome_notes,
        c.ai_generated_learning,
        c.created_at
    FROM campaigns c
    WHERE c.user_id = p_user_id
      AND (p_brand_id IS NULL OR c.brand_id = p_brand_id)
      AND c.outcome != 'pending'
      AND c.archived_at IS NULL
    ORDER BY c.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

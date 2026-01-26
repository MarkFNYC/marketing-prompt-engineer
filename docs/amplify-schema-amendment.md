# Database Schema Amendment v1.1
## Instructions for Integration

**Purpose:** This document amends the existing Amplify database schema to support the two-mode architecture (Discovery Mode + Directed Mode) and campaign-centric organization.

**Integration Approach:**
- Sections marked **[NEW TABLE]** are new tables to create
- Sections marked **[MODIFY TABLE]** include ALTER statements for existing tables
- Sections marked **[NEW INDEX]** are indexes to add
- Sections marked **[NEW FUNCTION]** are functions/triggers to add
- All changes are additive and non-breaking to existing data

**Migration Safety:** These changes do not delete or modify existing data. Existing outputs continue to work without campaigns. New features use campaigns.

---

## Amendment Summary

| Change Type | Object | Summary |
|-------------|--------|---------|
| NEW TABLE | `campaigns` | Core table for campaign-centric architecture |
| NEW TABLE | `strategy_checks` | Analytics table for Strategy Check interactions |
| MODIFY TABLE | `brands` | Add mandatories, constraints, value_proposition fields |
| MODIFY TABLE | `outputs` | Add campaign_id foreign key |
| NEW FUNCTION | `create_campaign_with_brief` | Helper for campaign creation |
| UPDATE | Entity Relationships | campaigns sits between brands and outputs |

---

## Updated Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   users     │───┬───│   brands    │───────│  campaigns  │
└─────────────┘   │   └─────────────┘       └─────────────┘
       │          │          │                     │
       │          │          │                     │
       ▼          │          ▼                     ▼
┌─────────────┐   │   ┌─────────────┐       ┌─────────────┐
│subscriptions│   │   │   outputs   │◄──────┤  (campaign) │
└─────────────┘   │   └─────────────┘       └─────────────┘
                  │          │
                  │          ▼
                  │   ┌─────────────┐
                  │   │   folders   │  ← Retained for legacy organization
                  │   └─────────────┘
                  │          │
                  │          ▼
                  │   ┌─────────────┐       ┌─────────────┐
                  │   │    tags     │◄──────│ output_tags │
                  │   └─────────────┘       └─────────────┘
                  │
                  │   ┌─────────────┐
                  └───│integrations │
                      └─────────────┘

                      ┌─────────────┐
                      │  personas   │  ← Unchanged
                      └─────────────┘

                      ┌─────────────────┐
                      │ strategy_checks │  ← New analytics table
                      └─────────────────┘
```

**Key Change:** Campaigns now sit between brands and outputs. Outputs can optionally belong to a campaign. Folders are retained for users who prefer that organization method.

---

## New Types (ENUMs)

### [NEW TYPE] campaign_mode

```sql
-- Tracks whether user entered via Discovery or Directed mode
CREATE TYPE campaign_mode AS ENUM ('discovery', 'directed');
```

---

### [NEW TYPE] campaign_goal_type

```sql
-- Structured goal categories for Directed Mode brief
CREATE TYPE campaign_goal_type AS ENUM ('awareness', 'consideration', 'conversion', 'retention');
```

---

### [NEW TYPE] campaign_outcome

```sql
-- Performance Memory: tracks campaign results (Phase 2, but schema-ready)
CREATE TYPE campaign_outcome AS ENUM ('worked', 'didnt_work', 'mixed', 'pending');
```

---

### [NEW TYPE] strategy_check_result

```sql
-- Tracks user interaction with Strategy Check in Directed Mode
CREATE TYPE strategy_check_result AS ENUM ('shown', 'accepted', 'overridden', 'dismissed');
```

---

## New Tables

### [NEW TABLE] campaigns

The core table for campaign-centric architecture. Stores briefs, message strategy, and media strategy.

```sql
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    
    -- ============================================
    -- BASIC INFO
    -- ============================================
    name VARCHAR(255) NOT NULL,
    mode campaign_mode NOT NULL,
    discipline VARCHAR(50),  -- Primary discipline (may be null for Discovery until selected)
    
    -- ============================================
    -- DISCOVERY MODE BRIEF (Rich)
    -- These fields are populated when mode = 'discovery'
    -- ============================================
    business_problem TEXT,
    success_metric TEXT,
    success_metric_value VARCHAR(100),
    timeline DATE,
    budget VARCHAR(50),  -- Stores range: '<5k', '5k-25k', '25k-100k', '100k+'
    campaign_constraints TEXT,
    what_been_tried TEXT,
    
    -- ============================================
    -- DIRECTED MODE BRIEF (Light)
    -- These fields are populated when mode = 'directed'
    -- ============================================
    goal_type campaign_goal_type,
    goal_description TEXT,
    campaign_mandatories TEXT[],  -- Campaign-specific mandatories (in addition to brand mandatories)
    
    -- ============================================
    -- MESSAGE STRATEGY (Discovery Mode)
    -- Populated during Discovery Mode flow
    -- ============================================
    -- AI-generated strategic angle options
    -- Structure: [{ id, name, core_message, angle, rationale }, ...]
    message_strategy_options JSONB,
    
    -- User's selected/refined message strategy
    -- Structure: { id, name, core_message, angle, rationale, user_refinements }
    selected_message_strategy JSONB,
    
    -- ============================================
    -- MEDIA STRATEGY (Discovery Mode)
    -- Populated during Discovery Mode flow
    -- ============================================
    -- AI-recommended channel mix
    -- Structure: { recommended: [{ channel, role, budget_allocation, rationale }], not_recommended: [{ channel, reason }] }
    media_strategy_options JSONB,
    
    -- User's confirmed channel mix (may differ from AI recommendation)
    -- Structure: [{ channel, role, budget_allocation }]
    selected_media_strategy JSONB,
    
    -- ============================================
    -- STRATEGY CHECK (Directed Mode)
    -- Captures whether Strategy Check was shown and user's response
    -- ============================================
    strategy_check_shown BOOLEAN DEFAULT FALSE,
    strategy_check_recommendation TEXT,
    strategy_check_user_response strategy_check_result,
    
    -- ============================================
    -- PERFORMANCE MEMORY (Phase 2)
    -- Tracks campaign outcomes for institutional learning
    -- ============================================
    outcome campaign_outcome DEFAULT 'pending',
    outcome_notes TEXT,
    outcome_metrics JSONB,  -- Flexible storage for user-entered metrics
    outcome_recorded_at TIMESTAMPTZ,
    ai_generated_learning TEXT,  -- AI-generated insight based on outcome
    
    -- ============================================
    -- METADATA
    -- ============================================
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,  -- When user finished the full flow
    archived_at TIMESTAMPTZ    -- Soft archive (not delete)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_brand_id ON campaigns(brand_id);
CREATE INDEX idx_campaigns_mode ON campaigns(mode);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);
CREATE INDEX idx_campaigns_outcome ON campaigns(outcome) WHERE outcome != 'pending';

-- Full-text search on campaign name and business problem
CREATE INDEX idx_campaigns_search ON campaigns
    USING GIN (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(business_problem, '')));

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own campaigns" ON campaigns
    FOR ALL USING (auth.uid() = user_id);
```

---

### [NEW TABLE] strategy_checks

Analytics table for tracking Strategy Check interactions. Separate from campaigns table to capture checks even for abandoned sessions.

```sql
CREATE TABLE strategy_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    
    -- What was checked
    discipline VARCHAR(50) NOT NULL,
    goal_type campaign_goal_type,
    goal_description TEXT,
    
    -- The check itself
    misalignment_severity VARCHAR(20),  -- 'none', 'mild', 'strong'
    recommendation_shown TEXT,
    alternative_disciplines TEXT[],  -- Suggested alternatives if misaligned
    
    -- User's response
    check_result strategy_check_result NOT NULL,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_strategy_checks_user_id ON strategy_checks(user_id);
CREATE INDEX idx_strategy_checks_campaign_id ON strategy_checks(campaign_id);
CREATE INDEX idx_strategy_checks_created_at ON strategy_checks(created_at DESC);
CREATE INDEX idx_strategy_checks_result ON strategy_checks(check_result);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE strategy_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own strategy checks" ON strategy_checks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own strategy checks" ON strategy_checks
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## Table Modifications

### [MODIFY TABLE] brands

Add fields for persistent mandatories, constraints, and value proposition.

```sql
-- ============================================
-- ADD NEW COLUMNS
-- ============================================

-- Persistent mandatories: elements that must appear in ALL outputs for this brand
-- Examples: "30-day money-back guarantee", "© 2025 Company Name", "FDA disclaimer"
ALTER TABLE brands 
ADD COLUMN persistent_mandatories TEXT[];

-- Persistent constraints: limitations that apply to ALL campaigns for this brand
-- Examples: "Regulated industry - no health claims", "Cannot mention competitor by name"
ALTER TABLE brands 
ADD COLUMN persistent_constraints TEXT;

-- Value proposition: one-liner on what makes this brand different
-- Used to inform AI context for all outputs
ALTER TABLE brands 
ADD COLUMN value_proposition TEXT;

-- ============================================
-- ADD COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON COLUMN brands.persistent_mandatories IS 'Elements that must appear in all outputs: legal disclaimers, taglines, brand elements';
COMMENT ON COLUMN brands.persistent_constraints IS 'Limitations applying to all campaigns: regulatory, competitive, resource constraints';
COMMENT ON COLUMN brands.value_proposition IS 'One-liner differentiator used to inform AI context';
```

**Updated brands table structure:**

```sql
-- For reference, the full brands table now looks like:
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    website VARCHAR(500),
    industry VARCHAR(255),
    challenge TEXT,
    target_audience TEXT,
    brand_voice TEXT,
    competitors TEXT[],
    is_default BOOLEAN DEFAULT FALSE,
    -- NEW FIELDS (v1.1)
    persistent_mandatories TEXT[],
    persistent_constraints TEXT,
    value_proposition TEXT,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### [MODIFY TABLE] outputs

Add campaign reference. Outputs can now optionally belong to a campaign.

```sql
-- ============================================
-- ADD CAMPAIGN REFERENCE
-- ============================================

-- Foreign key to campaigns (nullable - outputs can exist without campaigns for legacy/quick-save)
ALTER TABLE outputs 
ADD COLUMN campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL;

-- Index for efficient campaign-based queries
CREATE INDEX idx_outputs_campaign_id ON outputs(campaign_id);

-- ============================================
-- ADD COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON COLUMN outputs.campaign_id IS 'Optional link to parent campaign. NULL for legacy outputs or quick-saves outside campaign flow.';
```

**Updated outputs table structure (relevant fields):**

```sql
-- For reference, outputs now includes:
CREATE TABLE outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    persona_id UUID REFERENCES personas(id) ON DELETE SET NULL,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,  -- NEW (v1.1)
    
    -- ... rest of existing fields unchanged
);
```

---

## New Functions

### [NEW FUNCTION] update_campaigns_timestamp

Trigger to auto-update updated_at on campaigns table.

```sql
-- Apply existing update_updated_at function to campaigns
CREATE TRIGGER update_campaigns_timestamp
    BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

### [NEW FUNCTION] get_campaign_context

Helper function to retrieve full campaign context for AI prompt injection.

```sql
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
            'id', b.id,
            'name', b.name,
            'industry', b.industry,
            'target_audience', b.target_audience,
            'brand_voice', b.brand_voice,
            'value_proposition', b.value_proposition,
            'persistent_mandatories', b.persistent_mandatories,
            'persistent_constraints', b.persistent_constraints,
            'competitors', b.competitors
        )
    ) INTO v_result
    FROM campaigns c
    JOIN brands b ON b.id = c.brand_id
    WHERE c.id = p_campaign_id;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Usage:** Call this function before generating outputs to get full context for AI prompt injection.

```sql
-- Example usage
SELECT get_campaign_context('campaign-uuid-here');
```

---

### [NEW FUNCTION] get_user_campaign_history

Helper function to retrieve past campaigns for Performance Memory context.

```sql
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
```

**Usage:** Call this when starting a new campaign to surface relevant past campaigns.

```sql
-- Get last 5 completed campaigns for a user
SELECT * FROM get_user_campaign_history('user-uuid-here', NULL, 5);

-- Get campaigns for a specific brand
SELECT * FROM get_user_campaign_history('user-uuid-here', 'brand-uuid-here', 10);
```

---

## Analytics Events

### [NEW TABLE] Recommended analytics events to track

These aren't database tables, but events to log for product analytics. Include in your analytics implementation (Mixpanel, Amplitude, PostHog, etc.):

| Event Name | When Fired | Properties |
|------------|------------|------------|
| `mode_selected` | User chooses Discovery or Directed | `mode`, `user_id`, `brand_id` |
| `campaign_started` | Campaign record created | `campaign_id`, `mode`, `brand_id` |
| `brief_completed` | User submits brief | `campaign_id`, `mode`, `brief_fields_completed` |
| `message_strategy_generated` | AI returns options | `campaign_id`, `options_count` |
| `message_strategy_selected` | User picks an angle | `campaign_id`, `selected_option_id` |
| `media_strategy_generated` | AI returns channels | `campaign_id`, `channels_recommended` |
| `media_strategy_confirmed` | User confirms mix | `campaign_id`, `channels_selected` |
| `strategy_check_shown` | Check displayed (Directed) | `campaign_id`, `discipline`, `severity` |
| `strategy_check_response` | User responds to check | `campaign_id`, `result` |
| `campaign_completed` | User finishes full flow | `campaign_id`, `mode`, `outputs_generated` |
| `outcome_recorded` | User records campaign result | `campaign_id`, `outcome` |

---

## Migration Files

### Migration Order

Add these migrations after existing migrations:

```
014_create_campaign_types.sql      -- New ENUMs
015_create_campaigns.sql           -- campaigns table
016_create_strategy_checks.sql     -- strategy_checks table
017_modify_brands.sql              -- Add columns to brands
018_modify_outputs.sql             -- Add campaign_id to outputs
019_create_campaign_functions.sql  -- Helper functions
```

---

### [MIGRATION] 014_create_campaign_types.sql

```sql
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
```

---

### [MIGRATION] 015_create_campaigns.sql

```sql
-- Migration: Create campaigns table
-- Version: 1.1
-- Date: January 2025

CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    
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

-- Trigger for updated_at
CREATE TRIGGER update_campaigns_timestamp
    BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

### [MIGRATION] 016_create_strategy_checks.sql

```sql
-- Migration: Create strategy_checks analytics table
-- Version: 1.1
-- Date: January 2025

CREATE TABLE strategy_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
```

---

### [MIGRATION] 017_modify_brands.sql

```sql
-- Migration: Add new fields to brands table
-- Version: 1.1
-- Date: January 2025

-- Add persistent mandatories
ALTER TABLE brands 
ADD COLUMN persistent_mandatories TEXT[];

-- Add persistent constraints
ALTER TABLE brands 
ADD COLUMN persistent_constraints TEXT;

-- Add value proposition
ALTER TABLE brands 
ADD COLUMN value_proposition TEXT;

-- Add column comments
COMMENT ON COLUMN brands.persistent_mandatories IS 'Elements that must appear in all outputs: legal disclaimers, taglines, brand elements';
COMMENT ON COLUMN brands.persistent_constraints IS 'Limitations applying to all campaigns: regulatory, competitive, resource constraints';
COMMENT ON COLUMN brands.value_proposition IS 'One-liner differentiator used to inform AI context';
```

---

### [MIGRATION] 018_modify_outputs.sql

```sql
-- Migration: Add campaign reference to outputs table
-- Version: 1.1
-- Date: January 2025

-- Add campaign_id foreign key
ALTER TABLE outputs 
ADD COLUMN campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL;

-- Add index
CREATE INDEX idx_outputs_campaign_id ON outputs(campaign_id);

-- Add column comment
COMMENT ON COLUMN outputs.campaign_id IS 'Optional link to parent campaign. NULL for legacy outputs or quick-saves outside campaign flow.';
```

---

### [MIGRATION] 019_create_campaign_functions.sql

```sql
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
            'id', b.id,
            'name', b.name,
            'industry', b.industry,
            'target_audience', b.target_audience,
            'brand_voice', b.brand_voice,
            'value_proposition', b.value_proposition,
            'persistent_mandatories', b.persistent_mandatories,
            'persistent_constraints', b.persistent_constraints,
            'competitors', b.competitors
        )
    ) INTO v_result
    FROM campaigns c
    JOIN brands b ON b.id = c.brand_id
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
```

---

## JSONB Schema Documentation

### message_strategy_options

Structure for AI-generated message strategy options:

```json
[
  {
    "id": "uuid",
    "name": "Trusted Advisor Positioning",
    "core_message": "Stop evaluating vendors. Start solving the problem.",
    "angle": "Position as expert that helps prospects think through challenges",
    "rationale": "Long sales cycles reward trust-building over hard selling.",
    "best_for": ["thought leadership", "enterprise sales", "consultative selling"]
  },
  {
    "id": "uuid",
    "name": "Risk Reversal Positioning",
    "core_message": "The cost of waiting is higher than the cost of acting.",
    "angle": "Quantify the pain of status quo",
    "rationale": "IT buyers are risk-averse. Make inaction feel expensive.",
    "best_for": ["ROI-focused buyers", "competitive displacement", "urgency creation"]
  }
]
```

### selected_message_strategy

Structure for user's selected/refined strategy:

```json
{
  "id": "uuid",
  "name": "Trusted Advisor Positioning",
  "core_message": "Stop evaluating vendors. Start solving the problem.",
  "angle": "Position as expert that helps prospects think through challenges",
  "rationale": "Long sales cycles reward trust-building over hard selling.",
  "user_refinements": "Emphasize our 10-year track record and named customer logos"
}
```

### media_strategy_options

Structure for AI-recommended channel mix:

```json
{
  "recommended": [
    {
      "channel": "LinkedIn Organic",
      "role": "Thought leadership, credibility building",
      "budget_allocation": "Time investment",
      "rationale": "Primary channel for reaching IT decision-makers"
    },
    {
      "channel": "Email Nurture",
      "role": "Stay top of mind with engaged prospects",
      "budget_allocation": "15%",
      "rationale": "Cost-effective for long sales cycles"
    }
  ],
  "not_recommended": [
    {
      "channel": "TikTok",
      "reason": "Audience mismatch for enterprise IT buyers"
    },
    {
      "channel": "Broad Paid Search",
      "reason": "Previous campaign showed high CPC, low conversion"
    }
  ]
}
```

### selected_media_strategy

Structure for user's confirmed channel mix:

```json
[
  {
    "channel": "LinkedIn Organic",
    "role": "Thought leadership",
    "budget_allocation": "Time investment"
  },
  {
    "channel": "LinkedIn Paid",
    "role": "Retargeting engaged prospects",
    "budget_allocation": "40%"
  },
  {
    "channel": "Email Nurture",
    "role": "Convert warm leads",
    "budget_allocation": "20%"
  },
  {
    "channel": "Long-form Content",
    "role": "SEO + gated assets",
    "budget_allocation": "40%"
  }
]
```

### outcome_metrics

Flexible structure for user-entered performance metrics:

```json
{
  "leads_generated": 45,
  "conversion_rate": "3.2%",
  "cost_per_lead": "$125",
  "pipeline_influenced": "$180,000",
  "custom_metrics": {
    "webinar_registrations": 120,
    "content_downloads": 340
  }
}
```

---

## Integration Checklist for Claude Code

When applying this schema amendment:

- [ ] Run migration 014: Create campaign ENUMs
- [ ] Run migration 015: Create campaigns table
- [ ] Run migration 016: Create strategy_checks table
- [ ] Run migration 017: Add columns to brands table
- [ ] Run migration 018: Add campaign_id to outputs table
- [ ] Run migration 019: Create helper functions
- [ ] Update TypeScript/JavaScript types for new tables
- [ ] Update API endpoints to support campaign CRUD
- [ ] Update output creation to optionally link to campaign
- [ ] Implement get_campaign_context in application layer
- [ ] Add analytics events for campaign flow tracking

---

## Backward Compatibility Notes

1. **Existing outputs are unaffected.** They will have `campaign_id = NULL` and continue to work.

2. **Existing brands are unaffected.** New columns are nullable and don't require backfill.

3. **Folders remain functional.** Users can continue using folders. Campaigns are an additional (preferred) organization method.

4. **Personas unchanged.** No modifications to personas table or seed data.

5. **Prompt history unchanged.** Existing analytics continue to work.

---

*Schema Amendment Version 1.1 — January 2025*
*Based on PRD Amendment v1.1*

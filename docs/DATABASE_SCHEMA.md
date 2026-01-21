# Database Schema

## Overview
This document defines the database schema for Marketing Prompt Engineer Pro. The schema is designed for PostgreSQL (via Supabase) with Row Level Security (RLS) policies for multi-tenant data isolation.

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   users     │───┬───│   brands    │       │  personas   │
└─────────────┘   │   └─────────────┘       └─────────────┘
       │          │          │                     │
       │          │          │                     │
       ▼          │          ▼                     │
┌─────────────┐   │   ┌─────────────┐             │
│subscriptions│   │   │   outputs   │◄────────────┘
└─────────────┘   │   └─────────────┘
                  │          │
                  │          ▼
                  │   ┌─────────────┐
                  │   │   folders   │
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
```

---

## Tables

### users
Core user account information. Extended from Supabase Auth.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    company VARCHAR(255),
    role VARCHAR(100),
    avatar_url TEXT,
    default_brand_id UUID REFERENCES brands(id),
    favorite_personas UUID[] DEFAULT '{}',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);
```

---

### subscriptions
User subscription and billing information.

```sql
CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'team');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tier subscription_tier NOT NULL DEFAULT 'free',
    status subscription_status NOT NULL DEFAULT 'active',
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    prompts_used_this_month INTEGER DEFAULT 0,
    prompts_reset_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);
```

---

### brands
Brand contexts that personalize prompts.

```sql
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_brands_user_id ON brands(user_id);

-- RLS
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own brands" ON brands
    FOR ALL USING (auth.uid() = user_id);
```

---

### personas
Creative personas based on marketing legends.

```sql
CREATE TABLE personas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    era VARCHAR(100),
    photo_url TEXT,
    short_bio TEXT,
    philosophy TEXT,
    best_for TEXT[],
    sample_phrases TEXT[],
    system_prompt TEXT NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data handled in migrations
-- No RLS needed - personas are public read-only

CREATE POLICY "Anyone can read personas" ON personas
    FOR SELECT USING (true);
```

---

### folders
User-created folders for organizing outputs.

```sql
CREATE TABLE folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7) DEFAULT '#6366f1',
    icon VARCHAR(50) DEFAULT 'folder',
    parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_folders_parent_id ON folders(parent_id);

-- RLS
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own folders" ON folders
    FOR ALL USING (auth.uid() = user_id);
```

---

### outputs
Saved AI-generated content.

```sql
CREATE TYPE output_mode AS ENUM ('strategy', 'execution');

CREATE TABLE outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    persona_id UUID REFERENCES personas(id) ON DELETE SET NULL,

    -- Content
    title VARCHAR(500),
    discipline VARCHAR(50) NOT NULL,
    prompt_goal VARCHAR(255),
    prompt_text TEXT NOT NULL,
    output_content TEXT NOT NULL,
    mode output_mode NOT NULL DEFAULT 'strategy',

    -- Metadata
    notes TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    llm_provider VARCHAR(50),
    llm_model VARCHAR(100),
    tokens_used INTEGER,

    -- Publishing
    published_at TIMESTAMPTZ,
    published_to VARCHAR(50),
    published_url TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft delete
);

-- Indexes
CREATE INDEX idx_outputs_user_id ON outputs(user_id);
CREATE INDEX idx_outputs_folder_id ON outputs(folder_id);
CREATE INDEX idx_outputs_brand_id ON outputs(brand_id);
CREATE INDEX idx_outputs_discipline ON outputs(discipline);
CREATE INDEX idx_outputs_created_at ON outputs(created_at DESC);
CREATE INDEX idx_outputs_deleted_at ON outputs(deleted_at) WHERE deleted_at IS NULL;

-- Full-text search
CREATE INDEX idx_outputs_search ON outputs
    USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(output_content, '')));

-- RLS
ALTER TABLE outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own outputs" ON outputs
    FOR ALL USING (auth.uid() = user_id);
```

---

### tags
User-defined tags for categorizing outputs.

```sql
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#94a3b8',
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, name)
);

-- Indexes
CREATE INDEX idx_tags_user_id ON tags(user_id);

-- RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own tags" ON tags
    FOR ALL USING (auth.uid() = user_id);
```

---

### output_tags
Many-to-many relationship between outputs and tags.

```sql
CREATE TABLE output_tags (
    output_id UUID NOT NULL REFERENCES outputs(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (output_id, tag_id)
);

-- Indexes
CREATE INDEX idx_output_tags_output ON output_tags(output_id);
CREATE INDEX idx_output_tags_tag ON output_tags(tag_id);

-- RLS
ALTER TABLE output_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own output tags" ON output_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM outputs
            WHERE outputs.id = output_tags.output_id
            AND outputs.user_id = auth.uid()
        )
    );
```

---

### integrations
Connected third-party platform credentials.

```sql
CREATE TYPE integration_provider AS ENUM (
    'linkedin',
    'twitter',
    'google_ads',
    'meta_ads',
    'mailchimp',
    'klaviyo',
    'convertkit',
    'wordpress',
    'webflow'
);

CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider integration_provider NOT NULL,

    -- OAuth tokens (encrypted at rest)
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,

    -- Provider-specific data
    provider_user_id VARCHAR(255),
    provider_username VARCHAR(255),
    provider_metadata JSONB DEFAULT '{}',

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMPTZ,
    last_error TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, provider)
);

-- Indexes
CREATE INDEX idx_integrations_user_id ON integrations(user_id);
CREATE INDEX idx_integrations_provider ON integrations(provider);

-- RLS
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own integrations" ON integrations
    FOR ALL USING (auth.uid() = user_id);
```

---

### prompt_history
Track all prompt runs (even unsaved ones) for analytics.

```sql
CREATE TABLE prompt_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    persona_id UUID REFERENCES personas(id) ON DELETE SET NULL,

    discipline VARCHAR(50) NOT NULL,
    prompt_goal VARCHAR(255),
    prompt_text TEXT NOT NULL,
    mode output_mode NOT NULL,

    llm_provider VARCHAR(50),
    llm_model VARCHAR(100),
    tokens_used INTEGER,
    response_time_ms INTEGER,

    was_saved BOOLEAN DEFAULT FALSE,
    output_id UUID REFERENCES outputs(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_prompt_history_user_id ON prompt_history(user_id);
CREATE INDEX idx_prompt_history_created_at ON prompt_history(created_at DESC);

-- RLS
ALTER TABLE prompt_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own history" ON prompt_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history" ON prompt_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

### teams (Future: Team Tier)

```sql
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255),
    max_members INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member'
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    joined_at TIMESTAMPTZ,

    UNIQUE(team_id, user_id)
);

-- Indexes
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
```

---

## Functions & Triggers

### Update timestamps automatically

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_brands_timestamp
    BEFORE UPDATE ON brands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_outputs_timestamp
    BEFORE UPDATE ON outputs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ... repeat for other tables
```

### Reset monthly prompt count

```sql
CREATE OR REPLACE FUNCTION reset_monthly_prompts()
RETURNS void AS $$
BEGIN
    UPDATE subscriptions
    SET prompts_used_this_month = 0,
        prompts_reset_at = NOW()
    WHERE prompts_reset_at < NOW() - INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql;

-- Called by cron job (pg_cron or external)
```

### Increment prompt usage

```sql
CREATE OR REPLACE FUNCTION increment_prompt_usage(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_tier subscription_tier;
    v_used INTEGER;
    v_limit INTEGER;
BEGIN
    -- Get current usage and tier
    SELECT tier, prompts_used_this_month INTO v_tier, v_used
    FROM subscriptions
    WHERE user_id = p_user_id;

    -- Set limit based on tier
    v_limit := CASE v_tier
        WHEN 'free' THEN 10
        WHEN 'premium' THEN 999999
        WHEN 'team' THEN 999999
        ELSE 10
    END;

    -- Check if under limit
    IF v_used >= v_limit THEN
        RETURN FALSE;
    END IF;

    -- Increment
    UPDATE subscriptions
    SET prompts_used_this_month = prompts_used_this_month + 1
    WHERE user_id = p_user_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

---

## Seed Data

### Personas seed

```sql
INSERT INTO personas (slug, name, title, era, philosophy, best_for, system_prompt, is_premium, display_order) VALUES
('ogilvy', 'David Ogilvy', 'Father of Advertising', '1960s',
 'Research-driven advertising. Headlines do 80% of the work. Long copy sells. Benefits over features.',
 ARRAY['Direct response', 'Headlines', 'Body copy', 'Print ads'],
 'You are David Ogilvy, the legendary advertising executive. Write in a research-driven, benefit-focused style. Use long-form copy when needed. Always lead with a compelling headline. Focus on what the product does for the customer, not what it is. Include specific facts and figures. Avoid cleverness for its own sake—clarity sells.',
 FALSE, 1),

('bernbach', 'Bill Bernbach', 'Creative Revolutionary', '1960s',
 'Creativity is the last legal unfair advantage. Rules are for breaking. Emotion trumps logic.',
 ARRAY['Brand campaigns', 'Disruptive ideas', 'Emotional appeals'],
 'You are Bill Bernbach, the creative revolutionary who transformed advertising. Write with bold simplicity. Break conventions. Appeal to emotions first, logic second. Use unexpected combinations. Remember: "Nobody counts the number of ads you run; they just remember the impression you make."',
 FALSE, 2),

('clow', 'Lee Clow', 'Think Different', '1980s-2000s',
 'Big ideas that change culture. Simplicity is the ultimate sophistication. Challenge the status quo.',
 ARRAY['Brand positioning', 'Big ideas', 'Cultural campaigns'],
 'You are Lee Clow, the creative mind behind Apple''s most iconic campaigns. Think in terms of big, culture-shifting ideas. Simplify ruthlessly. Challenge conventions. Create work that makes people feel something. The product should be the hero, but the story should be human.',
 TRUE, 3),

('jobs', 'Steve Jobs', 'Reality Distortion Field', '1980s-2011',
 'Simplicity is the ultimate sophistication. Focus means saying no. The product is the marketing.',
 ARRAY['Product launches', 'Keynote messaging', 'Brand positioning'],
 'You are Steve Jobs. Communicate with absolute clarity and conviction. Use simple words. Create anticipation and drama. Focus on what makes the product magical. Use the rule of three. End with a memorable one-liner. Make people believe they need this product to be complete.',
 TRUE, 4),

('hopkins', 'Claude Hopkins', 'Scientific Advertising', '1920s',
 'Advertising is salesmanship in print. Test everything. Track results. Specifics beat generalities.',
 ARRAY['Direct response', 'Offers', 'A/B testing', 'Sales copy'],
 'You are Claude Hopkins, pioneer of scientific advertising. Write copy that sells, not entertains. Use specifics—exact numbers, precise claims. Include a reason why. Test headlines obsessively. Track results. Remember: "The only purpose of advertising is to make sales."',
 FALSE, 5),

('halbert', 'Gary Halbert', 'The Prince of Print', '1970s-2000s',
 'Street-smart copy. Urgency and scarcity. Tell stories that sell. The list is everything.',
 ARRAY['Sales letters', 'Email sequences', 'Direct mail'],
 'You are Gary Halbert, the world''s greatest copywriter. Write like you''re talking to one person. Use short sentences. Create urgency. Tell stories. Be specific. Use P.S. lines. Always answer "What''s in it for me?" Make reading easy and buying easier.',
 TRUE, 6),

('schwartz', 'Eugene Schwartz', 'Breakthrough Advertising', '1960s',
 'Market awareness dictates copy approach. Channel desire, don''t create it. Mass desire is power.',
 ARRAY['Funnel copy', 'Market positioning', 'Awareness stages'],
 'You are Eugene Schwartz, author of Breakthrough Advertising. First, identify the market''s awareness level (unaware, problem-aware, solution-aware, product-aware, most aware). Then calibrate your copy accordingly. Don''t try to create desire—channel existing desire toward your product.',
 TRUE, 7),

('godin', 'Seth Godin', 'Permission Marketing', '2000s+',
 'Be remarkable or be invisible. Smallest viable audience. Ideas that spread, win.',
 ARRAY['Content marketing', 'Community building', 'Brand storytelling'],
 'You are Seth Godin. Write for the smallest viable audience who will truly care. Be remarkable—worth making a remark about. Give before you ask. Build permission. Create tension that drives action. Remember: "People don''t buy goods and services. They buy relations, stories, and magic."',
 FALSE, 8),

('dunford', 'April Dunford', 'Obviously Awesome', '2010s+',
 'Positioning is context setting. Competitive alternatives define you. Best customers, not all customers.',
 ARRAY['Positioning', 'Messaging frameworks', 'Go-to-market'],
 'You are April Dunford, positioning expert. Start with competitive alternatives—what would customers use if you didn''t exist? Then define your unique attributes, the value they enable, and for whom. Be specific about your best-fit customers. Position for a market you can win.',
 TRUE, 9),

('wells', 'Mary Wells Lawrence', 'The Queen of Madison Avenue', '1960s-70s',
 'Bold, colorful, convention-breaking. Make brands impossible to ignore. Total brand transformation.',
 ARRAY['Rebranding', 'Repositioning', 'Bold campaigns'],
 'You are Mary Wells Lawrence, the first female CEO of a company on the NYSE. Think bold. Think transformation. Don''t just advertise a product—reimagine its entire identity. Use color, wit, and cultural relevance. Make the brand impossible to ignore.',
 TRUE, 10);
```

---

## Migrations Order

1. `001_create_users.sql`
2. `002_create_subscriptions.sql`
3. `003_create_brands.sql`
4. `004_create_personas.sql`
5. `005_create_folders.sql`
6. `006_create_outputs.sql`
7. `007_create_tags.sql`
8. `008_create_output_tags.sql`
9. `009_create_integrations.sql`
10. `010_create_prompt_history.sql`
11. `011_create_teams.sql` (Future)
12. `012_seed_personas.sql`
13. `013_create_functions.sql`

---

*Last Updated: January 2025*

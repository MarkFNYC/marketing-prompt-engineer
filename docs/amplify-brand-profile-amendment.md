# Brand Profile Specification Amendment v1.1
## Instructions for Integration

**Purpose:** This document amends the BRAND_PROFILE_SPEC.md to add new fields (mandatories, constraints) and clarify the relationship between Brand Profile and Campaign Brief in the two-mode architecture.

**Integration Approach:**
- **[ADD FIELD]** — New fields to add to data model
- **[MODIFY SECTION]** — Updates to existing sections
- **[ADD SECTION]** — New sections to insert

---

## Amendment Summary

| Change Type | Location | Summary |
|-------------|----------|---------|
| ADD FIELD | Data Model | `persistent_mandatories`, `persistent_constraints` |
| MODIFY | Data Model | Move `value_proposition` to MVP |
| ADD SECTION | Overview | Brand Profile vs Campaign Brief relationship |
| MODIFY | System Prompt Integration | Add mandatories/constraints injection + campaign context |
| MODIFY | Onboarding Flow | Add optional mandatories step |
| MODIFY | MVP vs Full | Update field priorities |
| ADD | Database Schema | New columns for mandatories and constraints |

---

## [ADD SECTION] Brand Profile vs Campaign Brief

**Insert after "Why This Matters" section:**

```markdown
---

## Brand Profile vs Campaign Brief

The new architecture separates persistent brand context from campaign-specific context:

### Brand Profile (Persistent)
- Set once during onboarding
- Applies to ALL campaigns and outputs for this brand
- Contains: who you are, your voice, your audience, your constraints
- Rarely changes (quarterly review recommended)

### Campaign Brief (Per Campaign)
- Created fresh for each campaign
- Contains: what you're trying to achieve right now
- Includes: business problem, goals, timeline, budget, campaign-specific constraints
- Changes with every new initiative

### How They Work Together

```
┌─────────────────────────────────────────────────────────────────┐
│  BRAND PROFILE (Persistent)                                      │
│  • Name, industry, website                                       │
│  • Target audience                                               │
│  • Brand voice and tone                                          │
│  • Value proposition                                             │
│  • Persistent mandatories (legal, brand elements)                │
│  • Persistent constraints (regulatory, competitive)              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Auto-injected into every campaign
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  CAMPAIGN BRIEF (Per Campaign)                                   │
│  • Business problem / goal                                       │
│  • Success metrics                                               │
│  • Timeline and budget                                           │
│  • Campaign-specific constraints                                 │
│  • Campaign-specific mandatories                                 │
│  • Message strategy (Discovery Mode)                             │
│  • Media strategy (Discovery Mode)                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Combined context
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  AI PROMPT                                                       │
│  • Full brand context                                            │
│  • Full campaign context                                         │
│  • Persona (if selected)                                         │
│  • Mode instructions                                             │
│  • Prompt-specific instructions                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Example: How Context Layers

**Brand Profile (Acme Analytics):**
- Target Audience: "Marketing managers at B2B SaaS companies"
- Brand Voice: "Professional but warm, clear language"
- Persistent Mandatory: "Include '© 2025 Acme Analytics' on all assets"
- Persistent Constraint: "Cannot make claims about competitor products"

**Campaign Brief (Q2 Pipeline Growth):**
- Business Problem: "Need to grow pipeline by 30%"
- Timeline: "End of Q2"
- Budget: "$50K"
- Campaign Constraint: "No budget for video production"
- Campaign Mandatory: "Reference the new Analytics 2.0 launch"

**Combined Context Injected:**
```
BRAND CONTEXT:
Brand: Acme Analytics
Target Audience: Marketing managers at B2B SaaS companies
Brand Voice: Professional but warm, clear language
Persistent Mandatory: Include '© 2025 Acme Analytics' on all assets
Persistent Constraint: Cannot make claims about competitor products

CAMPAIGN CONTEXT:
Campaign: Q2 Pipeline Growth
Business Problem: Need to grow pipeline by 30%
Timeline: End of Q2
Budget: $50K
Campaign Constraint: No budget for video production
Campaign Mandatory: Reference the new Analytics 2.0 launch
Message Strategy: [Trusted Advisor positioning - selected by user]
```
```

---

## [ADD FIELD] Data Model Updates

**Add these fields to the BrandProfile interface:**

```typescript
interface BrandProfile {
  // ... existing fields ...

  // NEW: Mandatories (v1.1)
  // Elements that MUST appear in all outputs for this brand
  persistentMandatories: string[];  // ["© 2025 Acme Inc", "30-day money-back guarantee", "FDA disclaimer"]

  // NEW: Constraints (v1.1)
  // Limitations that apply to ALL campaigns for this brand
  persistentConstraints: string;    // "Regulated industry - no health claims without citation. Cannot mention competitors by name."

  // ... rest of existing fields ...
}
```

**Full Updated Interface:**

```typescript
interface BrandProfile {
  id: string;
  userId: string;

  // Basic Info
  name: string;
  website?: string;
  industry: string;
  companySize?: string;

  // Positioning
  tagline?: string;
  valueProposition: string;          // PROMOTED TO MVP
  differentiators: string[];
  competitors?: string[];

  // Audience
  targetAudience: string;
  audiencePainPoints: string[];
  audienceGoals: string[];

  // Voice & Tone
  brandVoice: string;
  toneAttributes: string[];
  avoidWords: string[];
  examplePhrases?: string[];

  // NEW: Mandatories & Constraints (v1.1)
  persistentMandatories: string[];   // NEW
  persistentConstraints: string;      // NEW

  // Visual Identity (Future)
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  logoUrl?: string;

  // Metadata
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## [MODIFY] Database Schema Addition

**Replace existing database schema section with:**

```sql
-- Extend existing brands table (v1.0 fields)
ALTER TABLE brands ADD COLUMN IF NOT EXISTS tagline VARCHAR(255);
ALTER TABLE brands ADD COLUMN IF NOT EXISTS value_proposition TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS differentiators TEXT[] DEFAULT '{}';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS competitors TEXT[] DEFAULT '{}';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS audience_pain_points TEXT[] DEFAULT '{}';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS audience_goals TEXT[] DEFAULT '{}';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS brand_voice TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS tone_attributes TEXT[] DEFAULT '{}';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS avoid_words TEXT[] DEFAULT '{}';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS example_phrases TEXT[] DEFAULT '{}';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS company_size VARCHAR(50);
ALTER TABLE brands ADD COLUMN IF NOT EXISTS primary_color VARCHAR(7);
ALTER TABLE brands ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(7);
ALTER TABLE brands ADD COLUMN IF NOT EXISTS accent_color VARCHAR(7);
ALTER TABLE brands ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- NEW: v1.1 fields for Mandatories & Constraints
ALTER TABLE brands ADD COLUMN IF NOT EXISTS persistent_mandatories TEXT[] DEFAULT '{}';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS persistent_constraints TEXT;

-- Add comments for documentation
COMMENT ON COLUMN brands.persistent_mandatories IS 'Elements that must appear in all outputs: legal disclaimers, taglines, brand elements. Array of strings.';
COMMENT ON COLUMN brands.persistent_constraints IS 'Limitations applying to all campaigns: regulatory restrictions, competitive constraints, resource limitations.';
```

---

## [MODIFY] Onboarding Flow

**Update Step 4 (VOICE) to include mandatories, or add optional Step 5:**

**Option A: Add to Step 4 (Recommended for MVP)**

```
Step 4: VOICE & RULES
┌─────────────────────────────────────────────────────────────────┐
│  How does your brand sound?                                     │
│                                                                  │
│  Describe your brand's voice and tone                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Professional but warm. We're experts who don't          │   │
│  │ talk down to people. Clear language, no jargon.         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Select tone attributes that fit your brand                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │✓ Friendly│ │✓ Expert  │ │  Playful │ │  Formal  │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Must-include elements (optional)                               │
│  Things that should appear in every piece of content            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ © 2025 Acme Inc                                    [×]  │   │
│  │ 30-day money-back guarantee                        [×]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│  [+ Add mandatory]                                              │
│                                                                  │
│  Any constraints? (optional)                                    │
│  Limitations the AI should always respect                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ We're in a regulated industry - no health claims        │   │
│  │ without proper citations.                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│                                  [← Back]   [Finish →]          │
└─────────────────────────────────────────────────────────────────┘
```

**Option B: Separate Step 5 (For more guided experience)**

```
Step 5: RULES & GUARDRAILS (Optional)
┌─────────────────────────────────────────────────────────────────┐
│  Set some ground rules                                          │
│                                                                  │
│  These help the AI stay consistent with your brand.             │
│  You can skip this and add them later.                          │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Must-include elements                                          │
│  What should appear in every piece of content?                  │
│                                                                  │
│  Examples:                                                      │
│  • Legal disclaimers ("FDA approved", "Results may vary")       │
│  • Brand taglines ("Just Do It", "Think Different")             │
│  • CTAs ("Visit acme.com", "Call 1-800-ACME")                   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Enter a must-include element...                    [Add] │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Your mandatories:                                              │
│  ┌──────────────────────────────────────┐                      │
│  │ (none added yet)                     │                      │
│  └──────────────────────────────────────┘                      │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Constraints                                                    │
│  What should the AI always avoid or respect?                    │
│                                                                  │
│  Examples:                                                      │
│  • "Regulated industry - no health claims"                      │
│  • "Cannot mention competitors by name"                         │
│  • "No pricing information in public content"                   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│                        [Skip for now]   [← Back]   [Finish →]   │
└─────────────────────────────────────────────────────────────────┘
```

---

## [MODIFY] System Prompt Integration

**Replace the `buildSystemPrompt` function with updated version:**

```typescript
interface CampaignContext {
  name: string;
  mode: 'discovery' | 'directed';
  businessProblem?: string;
  goalType?: string;
  goalDescription?: string;
  successMetric?: string;
  timeline?: string;
  budget?: string;
  campaignConstraints?: string;
  campaignMandatories?: string[];
  selectedMessageStrategy?: {
    name: string;
    coreMessage: string;
    angle: string;
  };
}

function buildSystemPrompt(
  persona: Persona | null,
  mode: 'strategy' | 'execution',
  brand: BrandProfile,
  campaign?: CampaignContext  // NEW: Optional campaign context
): string {
  const parts: string[] = [];

  // 1. Persona (if selected)
  if (persona) {
    parts.push(persona.systemPrompt);
    parts.push('---');
  }

  // 2. Mode instructions
  parts.push(getModeInstructions(mode));
  parts.push('---');

  // 3. Brand context (persistent)
  parts.push('BRAND CONTEXT:');
  parts.push(`Brand: ${brand.name}`);

  if (brand.website) {
    parts.push(`Website: ${brand.website}`);
  }

  parts.push(`Industry: ${brand.industry}`);

  if (brand.valueProposition) {
    parts.push(`Value Proposition: ${brand.valueProposition}`);
  }

  if (brand.targetAudience) {
    parts.push(`Target Audience: ${brand.targetAudience}`);
  }

  if (brand.audiencePainPoints?.length) {
    parts.push(`Audience Pain Points: ${brand.audiencePainPoints.join(', ')}`);
  }

  if (brand.brandVoice) {
    parts.push(`Brand Voice: ${brand.brandVoice}`);
  }

  if (brand.toneAttributes?.length) {
    parts.push(`Tone: ${brand.toneAttributes.join(', ')}`);
  }

  if (brand.avoidWords?.length) {
    parts.push(`Words to Avoid: ${brand.avoidWords.join(', ')}`);
  }

  // NEW: Persistent Mandatories
  if (brand.persistentMandatories?.length) {
    parts.push('');
    parts.push('BRAND MANDATORIES (Must include in all outputs):');
    brand.persistentMandatories.forEach((m, i) => {
      parts.push(`  ${i + 1}. ${m}`);
    });
  }

  // NEW: Persistent Constraints
  if (brand.persistentConstraints) {
    parts.push('');
    parts.push('BRAND CONSTRAINTS (Always respect):');
    parts.push(brand.persistentConstraints);
  }

  // 4. Campaign context (if in campaign flow)
  if (campaign) {
    parts.push('');
    parts.push('---');
    parts.push('');
    parts.push('CAMPAIGN CONTEXT:');
    parts.push(`Campaign: ${campaign.name}`);

    if (campaign.businessProblem) {
      parts.push(`Business Problem: ${campaign.businessProblem}`);
    }

    if (campaign.goalType) {
      parts.push(`Goal: ${campaign.goalType}${campaign.goalDescription ? ' - ' + campaign.goalDescription : ''}`);
    }

    if (campaign.successMetric) {
      parts.push(`Success Metric: ${campaign.successMetric}`);
    }

    if (campaign.timeline) {
      parts.push(`Timeline: ${campaign.timeline}`);
    }

    if (campaign.budget) {
      parts.push(`Budget: ${campaign.budget}`);
    }

    if (campaign.campaignConstraints) {
      parts.push(`Campaign Constraints: ${campaign.campaignConstraints}`);
    }

    // Campaign-specific mandatories (in addition to brand mandatories)
    if (campaign.campaignMandatories?.length) {
      parts.push('');
      parts.push('CAMPAIGN MANDATORIES (Must include for this campaign):');
      campaign.campaignMandatories.forEach((m, i) => {
        parts.push(`  ${i + 1}. ${m}`);
      });
    }

    // Message strategy anchor (Discovery Mode)
    if (campaign.selectedMessageStrategy) {
      parts.push('');
      parts.push('STRATEGY ANCHOR:');
      parts.push(`Strategy: ${campaign.selectedMessageStrategy.name}`);
      parts.push(`Core Message: ${campaign.selectedMessageStrategy.coreMessage}`);
      parts.push(`Angle: ${campaign.selectedMessageStrategy.angle}`);
      parts.push('');
      parts.push('IMPORTANT: All outputs must serve and reinforce this strategy.');
    }
  }

  return parts.join('\n');
}
```

---

## [MODIFY] Example Combined System Prompt

**Update the example to show full context injection:**

```
You are David Ogilvy, the legendary advertising executive...
[Full Ogilvy persona prompt]

---

EXECUTION MODE INSTRUCTIONS:
Output actual content that can be copied and used immediately.
No explanations or frameworks. Ready-to-use copy.
Use markdown formatting.

---

BRAND CONTEXT:
Brand: Acme Analytics
Website: acme.com
Industry: B2B SaaS
Value Proposition: We help marketing teams automate their reporting so they can focus on strategy, not spreadsheets.
Target Audience: Marketing managers and directors at B2B SaaS companies with 50-500 employees who are overwhelmed by manual reporting.
Audience Pain Points: Manual reporting takes hours, Can't prove ROI to leadership, Too many disconnected tools
Brand Voice: Professional but warm. We're experts who don't talk down to people. Clear language, no jargon, occasionally dry humor.
Tone: Friendly, Expert, Direct
Words to Avoid: synergy, revolutionary, disrupt, leverage, game-changing

BRAND MANDATORIES (Must include in all outputs):
  1. © 2025 Acme Analytics
  2. "Start your free trial at acme.com"

BRAND CONSTRAINTS (Always respect):
Cannot make direct claims about competitor products. All ROI statistics must include "results may vary" disclaimer.

---

CAMPAIGN CONTEXT:
Campaign: Q2 Pipeline Growth
Business Problem: Need to grow qualified pipeline by 30% in H2. Current pipeline is $2M, need to get to $2.6M.
Goal: Conversion - Generate qualified demos
Success Metric: 150 qualified demos
Timeline: End of Q2 2025
Budget: $50K
Campaign Constraints: No budget for video production. Team of 2 only.

CAMPAIGN MANDATORIES (Must include for this campaign):
  1. Reference the new Analytics 2.0 features
  2. Include case study link (acme.com/casestudy)

STRATEGY ANCHOR:
Strategy: Trusted Advisor Positioning
Core Message: Stop evaluating vendors. Start solving the problem.
Angle: Position as the expert that helps prospects think through their challenge, not just another demo.

IMPORTANT: All outputs must serve and reinforce this strategy.
```

---

## [MODIFY] MVP vs Full Implementation

**Replace the MVP table:**

```markdown
### MVP (Sprint 1-2)

| Field | Include | Priority | Notes |
|-------|---------|----------|-------|
| name | ✅ | P0 | Required |
| website | ✅ | P0 | Optional |
| industry | ✅ | P0 | Dropdown |
| challenge | ✅ | P0 | Existing field |
| targetAudience | ✅ | P0 | **Add this** |
| brandVoice | ✅ | P0 | **Add this** |
| valueProposition | ✅ | P0 | **Promoted from Post-MVP** |
| persistentMandatories | ✅ | P0 | **NEW — Array of strings** |
| persistentConstraints | ✅ | P0 | **NEW — Text field** |
| differentiators | ❌ | P1 | Post-MVP |
| toneAttributes | ❌ | P1 | Post-MVP |
| avoidWords | ❌ | P1 | Post-MVP |
| painPoints | ❌ | P1 | Post-MVP |
| colors/logo | ❌ | P2 | Premium feature |
```

---

## [MODIFY] Validation Rules

**Add validation for new fields:**

```markdown
### Field Limits

- `name` — Max 100 characters
- `website` — Valid URL format
- `tagline` — Max 150 characters
- `valueProposition` — Max 500 characters
- `targetAudience` — Max 500 characters
- `brandVoice` — Max 1000 characters
- `differentiators` — Max 10 items, 100 chars each
- `toneAttributes` — Max 5 selections
- `avoidWords` — Max 20 items

**NEW (v1.1):**
- `persistentMandatories` — Max 10 items, 200 chars each
- `persistentConstraints` — Max 1000 characters
```

---

## [MODIFY] Analytics Events

**Add events for new fields:**

```markdown
| Event | When | Properties |
|-------|------|------------|
| `brand_profile_started` | User begins onboarding | — |
| `brand_profile_step_completed` | Each step finished | `step_number`, `step_name` |
| `brand_profile_completed` | Full onboarding done | `completion_time_seconds` |
| `brand_profile_edited` | Any field updated | `field_name` |
| `brand_profile_completion_rate` | Calculated | `percent_complete` |
| **NEW:** `brand_mandatory_added` | User adds a mandatory | `mandatory_text` |
| **NEW:** `brand_mandatory_removed` | User removes a mandatory | `mandatory_text` |
| **NEW:** `brand_constraints_updated` | User updates constraints | `has_constraints` |
```

---

## [ADD SECTION] Brand Profile Settings Page Update

**Update the settings page wireframe to include mandatories and constraints:**

```
┌─────────────────────────────────────────────────────────────────┐
│  Settings > Brand Profile                                       │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ BASICS                                              [Edit] │ │
│  │                                                            │ │
│  │ Name: Acme Analytics                                       │ │
│  │ Website: acme.com                                          │ │
│  │ Industry: B2B SaaS                                         │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ POSITIONING                                         [Edit] │ │
│  │                                                            │ │
│  │ Value Proposition: We help marketing teams automate...     │ │
│  │ Current Challenge: Generating qualified leads at scale     │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ AUDIENCE                                            [Edit] │ │
│  │                                                            │ │
│  │ Target: Marketing managers at B2B SaaS companies...        │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ VOICE & TONE                                        [Edit] │ │
│  │                                                            │ │
│  │ Voice: Professional but warm. Clear language...            │ │
│  │ Tone: Friendly, Expert, Direct                             │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ MANDATORIES & CONSTRAINTS                           [Edit] │ │  ← NEW SECTION
│  │                                                            │ │
│  │ Must Include:                                              │ │
│  │ • © 2025 Acme Analytics                                    │ │
│  │ • "Start your free trial at acme.com"                      │ │
│  │                                                            │ │
│  │ Constraints:                                               │ │
│  │ Cannot make direct claims about competitor products...     │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ VISUAL IDENTITY (Coming Soon)                       [Edit] │ │
│  │                                                            │ │
│  │ 🔒 Premium Feature                                         │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Integration Checklist for Claude Code

When applying this amendment:

- [ ] Add `persistentMandatories` and `persistentConstraints` to TypeScript interface
- [ ] Add new columns to database (see Schema Amendment for SQL)
- [ ] Update `buildSystemPrompt` function to inject mandatories/constraints
- [ ] Update `buildSystemPrompt` function to accept optional campaign context
- [ ] Add mandatories/constraints section to onboarding flow (Step 4 or new Step 5)
- [ ] Add mandatories/constraints section to brand settings page
- [ ] Add validation for new fields (max 10 mandatories, 200 chars each; max 1000 chars for constraints)
- [ ] Add new analytics events for mandatory/constraint changes
- [ ] Move `valueProposition` to MVP required fields
- [ ] Update any API endpoints that create/update brand profiles

---

*Brand Profile Spec Amendment Version 1.1 — January 2025*
*Based on PRD Amendment v1.1*

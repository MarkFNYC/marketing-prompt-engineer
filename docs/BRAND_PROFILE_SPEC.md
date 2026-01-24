# Brand Profile Specification

## Overview
The Brand Profile is the foundational feature that makes Amplify outputs contextually relevant. Instead of generic AI content, every prompt is personalized to the user's specific brand, audience, and voice.

**Core Principle:** "Define your brand once, use it everywhere."

---

## Why This Matters

### Without Brand Profile
```
User prompt: "Write a LinkedIn post about our new feature"

AI output: "Excited to announce our latest feature! It's going to
change everything. Check it out! #innovation #tech"
```
*Generic, could be anyone's post.*

### With Brand Profile
```
Brand: Notion
Voice: Clear, minimal, slightly playful
Audience: Knowledge workers who value organization

AI output: "Your workspace just got smarter. The new Notion Calendar
syncs your tasks, docs, and schedule in one view. Less context-switching.
More deep work. Try it today → notion.so/calendar"
```
*Feels like Notion actually wrote this.*

---

## Data Model

### Brand Profile Fields

```typescript
interface BrandProfile {
  id: string;                    // UUID
  userId: string;                // Owner

  // Basic Info
  name: string;                  // "Acme Inc"
  website?: string;              // "https://acme.com"
  industry: string;              // "B2B SaaS"
  companySize?: string;          // "11-50 employees"

  // Positioning
  tagline?: string;              // "The future of work"
  valueProposition: string;      // "We help teams collaborate faster"
  differentiators: string[];     // ["AI-powered", "No-code", "Enterprise-ready"]
  competitors?: string[];        // ["Competitor A", "Competitor B"]

  // Audience
  targetAudience: string;        // "Marketing managers at mid-size B2B companies"
  audiencePainPoints: string[];  // ["Too many tools", "Manual reporting"]
  audienceGoals: string[];       // ["Automate workflows", "Prove ROI"]

  // Voice & Tone
  brandVoice: string;            // "Professional but approachable, clear not clever"
  toneAttributes: string[];      // ["Confident", "Helpful", "Direct"]
  avoidWords: string[];          // ["Synergy", "Revolutionary", "Disrupt"]
  examplePhrases?: string[];     // ["Here's the thing:", "Let's be real:"]

  // Visual Identity (Future)
  primaryColor?: string;         // "#6366f1"
  secondaryColor?: string;       // "#8b5cf6"
  accentColor?: string;          // "#f59e0b"
  logoUrl?: string;              // URL to logo file

  // Metadata
  isDefault: boolean;            // Is this the active brand?
  createdAt: Date;
  updatedAt: Date;
}
```

### Database Schema Addition

```sql
-- Extend existing brands table
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
```

---

## User Experience

### Onboarding Flow (New Users)

```
Step 1: BASICS
┌─────────────────────────────────────────────────────────────┐
│  Let's set up your brand                                    │
│                                                             │
│  What's your brand or company name?                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Acme Inc                                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Website (optional)                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ https://acme.com                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Industry                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ B2B SaaS                                         ▼   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                                        [Continue →]         │
└─────────────────────────────────────────────────────────────┘

Step 2: POSITIONING
┌─────────────────────────────────────────────────────────────┐
│  What makes you different?                                  │
│                                                             │
│  What's your main value proposition?                        │
│  (What do you help customers achieve?)                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ We help marketing teams automate their reporting    │   │
│  │ so they can focus on strategy, not spreadsheets.    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  What's your biggest marketing challenge right now?         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Generating qualified leads at scale                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                                [← Back]   [Continue →]      │
└─────────────────────────────────────────────────────────────┘

Step 3: AUDIENCE
┌─────────────────────────────────────────────────────────────┐
│  Who are you talking to?                                    │
│                                                             │
│  Describe your ideal customer                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Marketing managers and directors at B2B SaaS        │   │
│  │ companies with 50-500 employees who are             │   │
│  │ overwhelmed by manual reporting and want to         │   │
│  │ prove marketing ROI to leadership.                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  What keeps them up at night? (Pain points)                 │
│  ┌──────────────────┐ ┌──────────────────┐                 │
│  │ Manual reporting │ │ Proving ROI      │ [+ Add]         │
│  └──────────────────┘ └──────────────────┘                 │
│                                                             │
│                                [← Back]   [Continue →]      │
└─────────────────────────────────────────────────────────────┘

Step 4: VOICE
┌─────────────────────────────────────────────────────────────┐
│  How does your brand sound?                                 │
│                                                             │
│  Describe your brand's voice and tone                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Professional but warm. We're experts who don't      │   │
│  │ talk down to people. We use clear language, avoid   │   │
│  │ jargon, and occasionally show personality with      │   │
│  │ dry humor. We're confident, not arrogant.           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Select tone attributes that fit your brand                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │✓ Friendly│ │✓ Expert  │ │  Playful │ │  Formal  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │✓ Direct  │ │  Casual  │ │  Bold    │ │  Warm    │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
│                                [← Back]   [Finish →]        │
└─────────────────────────────────────────────────────────────┘

Step 5: COMPLETE
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                     ✓ Brand Profile Complete                │
│                                                             │
│  Your Amplify outputs will now be personalized to:          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🏢 Acme Inc                                        │   │
│  │  🎯 Marketing managers at B2B SaaS companies        │   │
│  │  🎨 Professional but warm, expert, direct           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  You can edit this anytime in Settings.                     │
│                                                             │
│            [Start Creating Content →]                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Brand Profile Settings Page

```
┌─────────────────────────────────────────────────────────────┐
│  Settings > Brand Profile                                   │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ BASICS                                            [Edit]│ │
│  │                                                         │ │
│  │ Brand Name      Acme Inc                               │ │
│  │ Website         acme.com                               │ │
│  │ Industry        B2B SaaS                               │ │
│  │ Company Size    51-200 employees                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ POSITIONING                                       [Edit]│ │
│  │                                                         │ │
│  │ Value Proposition                                       │ │
│  │ We help marketing teams automate their reporting so    │ │
│  │ they can focus on strategy, not spreadsheets.          │ │
│  │                                                         │ │
│  │ Differentiators                                         │ │
│  │ • AI-powered insights  • No-code setup  • SOC 2        │ │
│  │                                                         │ │
│  │ Main Challenge                                          │ │
│  │ Generating qualified leads at scale                    │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ AUDIENCE                                          [Edit]│ │
│  │                                                         │ │
│  │ Target Audience                                         │ │
│  │ Marketing managers and directors at B2B SaaS companies │ │
│  │ with 50-500 employees...                               │ │
│  │                                                         │ │
│  │ Pain Points                                             │ │
│  │ • Manual reporting  • Proving ROI  • Tool overload     │ │
│  │                                                         │ │
│  │ Goals                                                   │ │
│  │ • Automate workflows  • Show marketing impact          │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ VOICE & TONE                                      [Edit]│ │
│  │                                                         │ │
│  │ Brand Voice                                             │ │
│  │ Professional but warm. We're experts who don't talk    │ │
│  │ down to people. Clear language, no jargon...           │ │
│  │                                                         │ │
│  │ Tone Attributes                                         │ │
│  │ ● Friendly  ● Expert  ● Direct                         │ │
│  │                                                         │ │
│  │ Words to Avoid                                          │ │
│  │ synergy, revolutionary, disrupt, leverage              │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ VISUAL IDENTITY (Coming Soon)                    [Edit]│ │
│  │                                                         │ │
│  │ 🔒 Premium Feature                                      │ │
│  │ Upload your logo and set brand colors for future       │ │
│  │ asset generation features.                             │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## System Prompt Integration

### How Brand Profile Injects into Prompts

```typescript
function buildSystemPrompt(
  persona: Persona | null,
  mode: 'strategy' | 'execution',
  brand: BrandProfile
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

  // 3. Brand context
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

  if (brand.challenge) {
    parts.push(`Current Marketing Challenge: ${brand.challenge}`);
  }

  return parts.join('\n');
}
```

### Example Combined System Prompt

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
Current Marketing Challenge: Generating qualified leads at scale
```

---

## MVP vs Full Implementation

### MVP (Sprint 1)

| Field | Include | Notes |
|-------|---------|-------|
| name | ✅ | Required |
| website | ✅ | Optional |
| industry | ✅ | Dropdown |
| challenge | ✅ | Existing field |
| targetAudience | ✅ | **Add this** |
| brandVoice | ✅ | **Add this** |
| valueProposition | ❌ | Post-MVP |
| differentiators | ❌ | Post-MVP |
| toneAttributes | ❌ | Post-MVP |
| avoidWords | ❌ | Post-MVP |
| painPoints | ❌ | Post-MVP |
| colors/logo | ❌ | Premium feature |

### Full Implementation (Post-MVP)

All fields from data model, plus:
- Multiple brand profiles (Premium: 5, Team: 20)
- Brand profile templates (e.g., "SaaS Startup", "E-commerce")
- Import from website (AI scrapes and suggests values)
- Team-shared brands

---

## Validation Rules

### Required Fields
- `name` — Cannot be empty
- `industry` — Must select from list

### Optional but Encouraged
- `targetAudience` — Show completion indicator
- `brandVoice` — Show completion indicator

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

---

## Analytics Events

Track these events for brand profile:

| Event | When | Properties |
|-------|------|------------|
| `brand_profile_started` | User begins onboarding | — |
| `brand_profile_step_completed` | Each step finished | `step_number`, `step_name` |
| `brand_profile_completed` | Full onboarding done | `completion_time_seconds` |
| `brand_profile_edited` | Any field updated | `field_name` |
| `brand_profile_completion_rate` | Calculated | `percent_complete` |

---

## Future Enhancements

### AI-Assisted Brand Profile
```
"Paste your website URL and we'll suggest brand profile values"

1. User enters: acme.com
2. AI scrapes homepage, about page, etc.
3. AI suggests:
   - Industry: B2B SaaS
   - Value proposition: [extracted from hero]
   - Target audience: [inferred from copy]
   - Brand voice: [analyzed from content]
4. User reviews and confirms
```

### Brand Profile Templates
```
"Start with a template for your industry"

Templates:
- B2B SaaS Startup
- E-commerce Brand
- Professional Services
- Consumer App
- Agency/Consultancy
- Non-Profit
- Personal Brand
```

### Brand Health Score
```
"Your brand profile is 75% complete"

Missing:
- [ ] Add differentiators (what makes you unique?)
- [ ] Define words to avoid
- [ ] Upload logo (Premium)

Why it matters: Complete profiles generate 40% more relevant content.
```

---

*Last Updated: January 2025*

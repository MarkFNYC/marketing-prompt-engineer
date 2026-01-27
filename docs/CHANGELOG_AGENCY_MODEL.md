# Amplify Platform Evolution — Agency Model Update

**Date:** January 2026
**Version:** 2.0 (Agency Model)

---

## Executive Summary

Amplify has evolved from a "prompt library with AI generation" to a **virtual agency workflow**. The platform now guides users through a strategic process — from problem definition to creative execution — mirroring how real agencies work: Planning → Creative → Media.

---

## What Changed (High-Level)

### Before (v1.x)
```
User → Pick Discipline → Pick Prompt → Generate Content
```
- Content-first approach
- No strategic foundation
- "90 prompts across 9 disciplines" framing

### After (v2.0 Agency Model)
```
User → Define Problem → Strategy → Creative Idea → Planning Review → Select Media → Generate
```
- Strategy-first approach
- AI-guided brief development
- "Your virtual agency room" framing

---

## Major Features Added

### 1. Agency Role Navigation
**Commit:** `f2f30fa`, `31c9bc5`

| Old | New |
|-----|-----|
| Strategy Mode | Talk to Planning |
| Execution Mode | Talk to Creative |

- UI toggle renamed throughout the app
- Landing page updated with new "How It Works" flow
- Meta descriptions and keywords updated

### 2. Strategic Thread Lifecycle
**Commit:** `f2f30fa`

Campaigns now have a `threadState` that tracks progress:

```
draft → in_planning → pending_review → approved → active
```

| State | Meaning |
|-------|---------|
| `draft` | User created campaign |
| `in_planning` | User working in Planning mode |
| `pending_review` | User triggered Planning Review |
| `approved` | Brief passed review |
| `active` | User generating content |

### 3. Discovery Mode Flow
**Commits:** `c724786`, `311422d`

Full strategic discovery workflow:

1. **Discovery Brief** — User describes business problem, success metrics, constraints
2. **Message Strategy** — AI generates 3 strategic angles to choose from
3. **User Refinements** — Optional adjustments to selected strategy

### 4. Creative Ideas Exploration
**Commits:** `b8f562e`, `d1e8f47`

After selecting a strategy, users now get creative concept suggestions:

- AI generates 3 creative ideas based on the strategy
- Each idea includes: name, summary, tone/feel, visual direction
- User selects and can refine the idea
- Creative idea flows into Planning Review

### 5. Planning Review Checkpoint
**Commits:** `f2f30fa`, `6bd3789`, `82fce55`, `9e9c44e`

Critical gate before creative execution:

```
┌─────────────────────────────────────────────────────────┐
│                    PLANNING REVIEW                       │
├─────────────────────────────────────────────────────────┤
│  📋 STRATEGIC FOUNDATION                                │
│  • Problem: [from brief]                                │
│  • Audience: [from persona or brand]                    │
│  • Strategy: [selected + refinements]                   │
│  • Creative Idea: [selected concept]                    │
│  • Mandatories: [from brief]                            │
│                                                          │
│  🤖 AI ASSESSMENT (1-10 score)                          │
│  "This brief is strong because..."                      │
│                                                          │
│  [Approve & Select Media] [Refine] [Skip]               │
└─────────────────────────────────────────────────────────┘
```

**API:** `/api/planning-review`
- Accepts: problem, audience, strategy, creative idea, mandatories
- Returns: score (1-10), assessment, suggestions

### 6. Soft Gate for Creative Mode
**Commit:** `f2f30fa`

- Switching to Creative without approved brief triggers Planning Review
- Users can skip (not recommended) — shows warning banner
- Warning persists until they return to Planning

### 7. Target Personas (Audience Personas)
**Commit:** `c72be10`

- AI-generated buyer personas based on brand context
- Manual persona creation option
- Persona context injected into all AI prompts
- Personas stored per project

### 8. Upload Brief Feature
**Commit:** `6017c3d`

- Upload PDF, Word, or paste text
- AI extracts 11 brief fields
- Creates strategic thread from existing brief

---

## API Changes

| Endpoint | Status | Purpose |
|----------|--------|---------|
| `/api/planning-review` | **New** | AI brief assessment |
| `/api/campaigns/message-strategy` | Updated | Now uses GoogleGenerativeAI SDK, gemini-2.0-flash |
| `/api/remix` | Updated | Enhanced for agency model |
| `/api/personas` | **New** | Generate/manage target personas |
| `/api/briefs/parse` | **New** | Parse uploaded briefs |

---

## Data Model Changes

### Campaign Interface
```typescript
interface Campaign {
  // ... existing fields
  threadState: 'draft' | 'in_planning' | 'pending_review' | 'approved' | 'active';
}
```

### State Additions
```typescript
interface State {
  // Planning Review
  showPlanningReview: boolean;
  planningReviewLoading: boolean;
  planningReviewResult: { score: number; assessment: string; suggestions: string[] } | null;
  skippedPlanningReview: boolean;

  // Creative Ideas
  creativeIdeas: CreativeIdea[];
  creativeIdeasLoading: boolean;
  selectedCreativeIdea: CreativeIdea | null;

  // Personas
  personas: Persona[];
  selectedPersona: Persona | null;
}
```

---

## UI/UX Changes

### Landing Page
- Tagline: "Your virtual agency room. Start with strategy, not channels."
- How It Works: Planning → Review → Creative → Media
- Removed "90 prompts across 9 disciplines" framing

### Mode Toggle Labels
- "📋 Talk to Planning" (was "Strategy")
- "🎨 Talk to Creative" (was "Execution")

### New Screens
1. Discovery Brief form
2. Message Strategy selection (3 options)
3. Creative Ideas exploration
4. Planning Review modal
5. Personas Manager

### Warning States
- Skipped Planning Review → amber warning banner
- Missing brief elements → shown in Planning Review

---

## Files Modified

### Core Files
- `src/app/page.tsx` — Main app (significant changes)
- `src/app/layout.tsx` — Meta descriptions

### API Routes
- `src/app/api/planning-review/route.ts` — **New**
- `src/app/api/campaigns/message-strategy/route.ts` — Updated
- `src/app/api/personas/route.ts` — **New**
- `src/app/api/briefs/parse/route.ts` — **New**
- `src/app/api/remix/route.ts` — Updated

### Data
- `src/lib/data.ts` — Added creative idea prompts

---

## Documentation Status

| Document | Status | Action Needed |
|----------|--------|---------------|
| PRD.md | ⚠️ Outdated | Update for agency model |
| USER_STORIES.md | ✅ Updated | Epic 0 added |
| BUSINESS_RULES.md | ✅ Updated | Section 4 (Agency Roles) added |
| DATABASE_SCHEMA.md | ✅ Updated | strategic_threads table added |
| PRODUCT_ROADMAP.md | ⚠️ Outdated | Needs revision |
| PRD_AGENCY_MODEL_ADDENDUM.md | ✅ Current | Agency model spec |
| USER_JOURNEY_ANALYSIS.md | ✅ Current | Flow analysis |
| **CHANGELOG_AGENCY_MODEL.md** | ✅ **New** | This document |

---

## What's Next (Suggested)

1. **Brief Enhancement** — Add deliverables, format, media fields to brief parsing
2. **Smart Routing** — Skip discipline selection when brief specifies deliverable
3. **Media Role** — Add "Talk to Media" for distribution/channel strategy
4. **Thread Summary Sidebar** — Show strategic context during Creative
5. **Output Tracking** — Link generated content back to threads

---

## Commit History (Last 2 Days)

```
9615d0d Update remix API and page.tsx
b44b4dc Update page.tsx
0bdfb88 Update data.ts
d1e8f47 Update agency model flow and planning review
9e9c44e Include strategy refinements and creative idea in Planning Review
82fce55 Update Planning Review modal UI
b8f562e Add Creative Idea Exploration step
6bd3789 Wire Planning Review into strategy confirmation flow
311422d Fix message-strategy API to use GoogleGenerativeAI SDK
1ffa2cb Add error handling for strategy generation
91b457f Fix React.useState to useState import
80b8b64 Add API settings to mode-select screen
31c9bc5 Update landing page for agency model
f2f30fa Add Agency Model Phase 0 - Planning Review checkpoint
```

---

*Last Updated: January 26, 2026*

# User Journey Analysis

## Overview

This document analyzes the three entry points in Amplify and identifies UX friction that needs architectural changes.

---

## The Three Entry Points

### Current Architecture

```
                            MODE SELECT
                     "What would you like to do?"
                               |
          +--------------------+--------------------+
          |                    |                    |
          v                    v                    v
    "I have a problem"   "I know what I need"   "I have a brief"
      (discovery)           (directed)            (upload)
          |                    |                    |
          v                    v                    v
    discovery-brief      discipline-select      upload-brief
          |                    |                    |
          v                    v                    v
    message-strategy     directed-brief         brief-review
          |                    |                    |
          v                    v                    |
    discipline-select    strategy-check         |
          |                    |                    |
          +--------->  discipline-select  <--------+
                               |
                               v
                         library-view
                         (prompt selection)
                               |
                               v
                          llm-output
```

---

## Journey 1: "I have a problem" (Discovery Mode)

### User Intent
User doesn't know what they need. They have a business problem and want guidance on the right strategy.

### Current Flow
```
1. Select "I have a problem"
2. Fill out Discovery Brief:
   - Campaign name
   - Business problem (what's not working?)
   - Success metric (what does success look like?)
   - Success metric value (target number)
   - Timeline
   - Budget
   - Constraints
   - What's been tried before
3. AI generates 3 message strategies
4. User selects a strategy
5. User selects a discipline (SEO, Paid, Email, etc.)
6. User browses prompts in that discipline
7. User runs a prompt
8. User gets output
```

### Assessment
**Flow is appropriate.** User doesn't know what they need, so the guided journey makes sense. The AI recommends strategies, and the user learns along the way.

### Potential Improvements
- After selecting a message strategy, could AI recommend which disciplines are most relevant?
- Could skip discipline selection if strategy strongly implies a single discipline?

---

## Journey 2: "I know what I need" (Directed Mode)

### User Intent
User knows exactly what they want. They have clear objectives and want to execute quickly.

### Current Flow
```
1. Select "I know what I need"
2. Select a discipline (SEO, Paid, Email, etc.)
3. Fill out Directed Brief:
   - Campaign name
   - Goal type (dropdown)
   - Goal description
   - Campaign mandatories
4. AI runs strategy check (is goal aligned with discipline?)
5. If misaligned, show warning/suggestion
6. User browses prompts in that discipline
7. User runs a prompt
8. User gets output
```

### Assessment
**Flow is mostly appropriate.** User knows what they want, selects discipline first, then provides details. Strategy check adds value by catching misalignment.

### Potential Improvements
- Goal type dropdown could auto-suggest discipline if not yet selected
- "Fast mode" option to skip strategy check for repeat users

---

## Journey 3: "I have a brief" (Upload Mode)

### User Intent
User has an existing creative brief (from a client, internal team, etc.) that already specifies what needs to be created.

### Current Flow
```
1. Select "I have a brief"
2. Upload brief (PDF, Word, text, or paste)
3. AI parses brief and extracts:
   - Campaign name
   - Objective
   - Target audience
   - Proposition / key message
   - Support / proof points
   - Mandatories
   - Tone of voice
   - Constraints
   - Budget
   - Timeline
   - Success metrics
4. User reviews/edits extracted fields
5. User selects a discipline (SEO, Paid, Email, etc.)  ← PROBLEM
6. User browses prompts in that discipline
7. User runs a prompt
8. User gets output
```

### THE PROBLEM

**If the brief already says "we need a 15-second video script," the user should NOT have to:**
1. Select a discipline (it's implied: Social or Content)
2. Browse prompts (the deliverable is already defined)
3. Find a matching prompt (there may not be an exact match)

**What the app currently extracts from briefs:**
- Campaign name, objective, audience, proposition, etc.
- **Does NOT extract: deliverable type, format, or media**

**What's missing:**
- `deliverable`: "15-second video script"
- `format`: "video"
- `media`: "TikTok, Instagram Reels"
- `discipline`: (inferred or explicit)

---

## Proposed Architecture Change

### New Brief Parsing Fields

Add to the `ParsedBrief` interface:

```typescript
interface ParsedBrief {
  // ... existing fields ...

  // NEW: Deliverable extraction
  deliverables: {
    type: string;        // "video script", "email sequence", "landing page", etc.
    format: string;      // "15-second video", "3-email sequence", "long-form", etc.
    media: string[];     // ["TikTok", "Instagram Reels"], ["LinkedIn"], etc.
    quantity: number;    // 1 video, 5 emails, etc.
  }[] | null;

  // NEW: Inferred discipline
  suggestedDiscipline: string | null;  // "Social", "Email", "Content", etc.

  // NEW: Direct generation flag
  canGenerateDirectly: boolean;  // true if deliverable is specific enough
}
```

### New User Journey (Upload Mode)

```
1. Select "I have a brief"
2. Upload brief
3. AI parses brief and extracts:
   - All existing fields
   - NEW: Deliverables (type, format, media, quantity)
   - NEW: Suggested discipline
   - NEW: Can generate directly flag

4. BRANCHING LOGIC:

   IF deliverable is specific (e.g., "15-second video script"):
   ┌─────────────────────────────────────────────────────────┐
   │ "Your brief specifies: 15-second video script"          │
   │                                                         │
   │ We'll generate this for TikTok/Instagram Reels.        │
   │                                                         │
   │ [Generate Script] [Change deliverable] [Browse prompts] │
   └─────────────────────────────────────────────────────────┘

   IF deliverable is unclear:
   ┌─────────────────────────────────────────────────────────┐
   │ "What would you like to create?"                        │
   │                                                         │
   │ Based on your brief, we suggest: [Social Media]         │
   │                                                         │
   │ [Use suggestion] [Choose different discipline]          │
   └─────────────────────────────────────────────────────────┘

   IF no deliverable detected:
   → Current flow (discipline-select)
```

### Decision Matrix

| Brief Contains | Action |
|----------------|--------|
| Specific deliverable (e.g., "15-sec video script") | Skip to generation |
| General deliverable (e.g., "video content") | Show discipline with pre-selection |
| Objective only (e.g., "increase awareness") | Show discipline selection |
| Nothing usable | Show discipline selection |

---

## Implementation Plan

### Phase 1: Enhanced Brief Parsing

1. Update `/api/briefs/parse/route.ts` to extract:
   - Deliverable type
   - Format specifications
   - Media channels
   - Suggested discipline

2. Update parsing prompt to look for:
   - "Deliverables" section
   - Format specifications (dimensions, duration, word count)
   - Channel mentions (TikTok, LinkedIn, email, etc.)

### Phase 2: Smart Routing

1. Add `canGenerateDirectly` logic based on:
   - Deliverable specificity
   - Format clarity
   - All required fields present

2. Update `brief-review` step to show:
   - Detected deliverables
   - Suggested discipline
   - Option to generate directly or browse

### Phase 3: Direct Generation

1. Create new step `direct-generate`:
   - Shows detected deliverable
   - Confirms brief context
   - Generates output without prompt selection

2. Build system prompt dynamically from:
   - Brief context (proposition, audience, tone)
   - Deliverable specifications
   - Brand profile

---

## Summary of Changes Needed

### Brief Parsing API

```diff
// /api/briefs/parse/route.ts

interface ParsedBrief {
   campaignName: string | null;
   objective: string | null;
   targetAudience: string | null;
   proposition: string | null;
   support: string[] | null;
   mandatories: string[] | null;
   tone: string | null;
   constraints: string | null;
   budget: string | null;
   timeline: string | null;
   successMetrics: string | null;
+  deliverables: Deliverable[] | null;
+  suggestedDiscipline: string | null;
+  canGenerateDirectly: boolean;
}

+ interface Deliverable {
+   type: string;
+   format: string;
+   media: string[];
+   quantity: number;
+ }
```

### Page.tsx State

```diff
type Step =
   'landing' | 'projects' | 'brand-input' |
   'discipline-select' | 'library-view' | 'llm-output' |
   'my-library' | 'mode-select' | 'discovery-brief' |
   'message-strategy' | 'directed-brief' | 'strategy-check' |
-  'campaigns' | 'upload-brief' | 'brief-review';
+  'campaigns' | 'upload-brief' | 'brief-review' | 'direct-generate';
```

### Routing Logic

```diff
// After brief-review completion
- onComplete={() => {
-   updateState({ step: 'discipline-select' });
- }}
+ onComplete={() => {
+   if (state.uploadedBrief.canGenerateDirectly) {
+     updateState({ step: 'direct-generate' });
+   } else if (state.uploadedBrief.suggestedDiscipline) {
+     updateState({
+       discipline: state.uploadedBrief.suggestedDiscipline,
+       step: 'discipline-select' // with pre-selection
+     });
+   } else {
+     updateState({ step: 'discipline-select' });
+   }
+ }}
```

---

## Questions to Resolve

1. **What if the brief specifies multiple deliverables?**
   - Show a list and let user pick which to generate first?
   - Generate all in sequence?

2. **How specific must the deliverable be to skip prompt selection?**
   - "Video" → too vague
   - "15-second video" → specific enough?
   - "15-second TikTok video script for product launch" → definitely specific

3. **Should we still show the prompt library as an option?**
   - "Generate directly" vs "Browse related prompts"

4. **What about personas in direct generation?**
   - Apply default persona?
   - Ask user to select?
   - Skip personas entirely?

---

*Document created: January 2025*

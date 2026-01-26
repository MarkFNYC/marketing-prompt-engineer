# Amplify PRD Amendment v1.1
## Instructions for Integration

**Purpose:** This document amends the existing Amplify PRD (v1.0, January 2025). It introduces a two-mode architecture (Discovery Mode + Directed Mode) and refines several features based on strategic review.

**Integration Approach:**
- Sections marked **[UNCHANGED]** require no modification
- Sections marked **[MODIFY]** include before/after text for specific updates
- Sections marked **[ADD]** are new sections to insert at the specified location

---

## Amendment Summary

| Area | Change Type | Summary |
|------|-------------|---------|
| Executive Summary | MODIFY | Update one-liner, tagline, and core value proposition |
| Problem Statement | UNCHANGED | No changes needed |
| Product Vision | MODIFY | Update positioning statement |
| Target Users | UNCHANGED | Personas remain the same |
| Product Overview | MODIFY | Add two-mode architecture, restructure Brand Profile vs. Campaign Brief |
| Feature Requirements | MODIFY + ADD | Add Brief Builder, Strategy Check, Media Strategy features |
| User Experience | MODIFY | Replace MVP User Journey with two-flow architecture |
| Technical Architecture | UNCHANGED | No changes needed |
| Business Model | UNCHANGED | No changes needed |
| Success Metrics | MODIFY | Update North Star and KPIs |
| Competitive Analysis | UNCHANGED | No changes needed |
| Roadmap | MODIFY | Adjust sprint priorities |
| Risks | ADD | Add new risks related to two-mode architecture |
| Open Questions | MODIFY | Update with resolved and new questions |

---

## Section 1: Executive Summary

### [MODIFY] One-Liner

**BEFORE:**
```
"Your AI marketing team in a browser — from strategy to send."
```

**AFTER:**
```
"Strategic frameworks from elite marketers. Applied to your brief."
```

---

### [MODIFY] Tagline

**BEFORE:**
```
"The marketing team you can't afford to hire."
```

**AFTER:**
```
"The strategic discipline your marketing is missing."
```

---

### [MODIFY] Core Value Proposition

**BEFORE:**
```
- **90 expert prompts** across 9 marketing disciplines
- **26 creative personas** based on legendary marketers and strategists
- **Strategy + Execution modes** — think first, then produce
- **Brand personalization** — every output is contextually relevant
- **Learn while you create** — understand the "why" behind the output
```

**AFTER:**
```
- **Two modes for two mindsets** — Discovery Mode guides strategy; Directed Mode enables fast execution
- **Strategic Workflow** — Forces Brief → Strategy → Message → Execution sequence (you can't skip thinking)
- **Constraint Intelligence** — AI accounts for real-world limitations, mandatories, and business context
- **Framework Application** — 26 personas apply actual strategic methodologies, not just writing styles
- **Strategic Audit** — AI critiques your approach before you execute, flags goal/strategy misalignment
- **90 expert prompts** across 9 marketing disciplines, personalized to your brief
```

---

## Section 3: Product Vision & Strategy

### [MODIFY] Positioning Statement

**BEFORE:**
```
> **For** solo marketers and small teams **who** can't afford an agency,
> **Amplify** is a **strategic AI marketing platform** that **gives you a
> team of legendary creative minds** — unlike **generic AI tools** that
> just generate copy, **we help you think like Ogilvy, Jobs, and Godin**.
```

**AFTER:**
```
> **For** solo marketers and small teams **who** can't afford an agency,
> **Amplify** is a **strategic AI marketing platform** that **applies 
> elite marketing frameworks to your specific business challenges** — 
> unlike **generic AI tools** that just generate copy, **we help you 
> build strategy first, then execute with creative excellence**.
```

---

### [ADD] Strategic Pillars (Replace Existing)

**INSERT after "Mission" statement, replacing existing Strategic Pillars:**

```markdown
### Strategic Pillars

1. **Two Modes, Two Mindsets**
   - Discovery Mode: For users who have a problem but don't know the solution
   - Directed Mode: For users who know what they need and want speed
   - Both modes share Brand Profile; differ in Brief depth

2. **Strategy Before Execution**
   - Discovery Mode enforces Brief → Message Strategy → Media Strategy → Execution
   - Directed Mode includes Strategy Check as guardrail (skippable but visible)
   - Personas apply frameworks at strategy stage, creative styles at execution stage

3. **Constraint Intelligence**
   - Brand Profile captures persistent context (who you are, voice, mandatories)
   - Campaign Brief captures situational context (goal, budget, timeline, constraints)
   - Both layers auto-inject into every prompt for relevance

4. **Learning Through Challenge**
   - Strategic Audit flags misalignment between goals and tactics
   - "Why this works" explanations accompany every output
   - Performance Memory tracks results to inform future campaigns (Phase 2)
```

---

## Section 5: Product Overview

### [MODIFY] Section 5.4 — Brand Profile

**BEFORE:**
```markdown
#### 5.4 Brand Profile
- Brand name, website, industry
- Target audience description
- Brand voice and tone
- Value proposition
- Current marketing challenge
```

**AFTER:**
```markdown
#### 5.4 Brand Profile (Persistent)

The Brand Profile is set once during onboarding and reused across all campaigns. It captures "who you are" context that rarely changes.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Brand name | Text | Yes | — |
| Website | URL | No | Encouraged for AI context |
| Industry | Dropdown + text | Yes | Dropdown with "Other" option |
| Target audience | Text area | Yes | Prompt: "Who are you trying to reach? Be specific about roles, company size, pain points." |
| Brand voice | Text area or tags | No | Presets available (Professional, Playful, Bold, Minimal, Technical) or custom text |
| Value proposition | Text area | No | One-liner on what makes you different |
| Persistent mandatories | Repeatable text fields | No | "What must always be included? (Legal disclaimers, taglines, brand elements)" |
| Persistent constraints | Text area | No | "Any constraints that apply to all campaigns? (Regulated industry, no competitor mentions, etc.)" |

**Freelancer Feature:** Premium users can save up to 5 Brand Profiles and switch between them. Agency tier (future) allows unlimited.
```

---

### [ADD] Section 5.5 — Campaign Brief (New Section)

**INSERT after Section 5.4, renumber subsequent sections:**

```markdown
#### 5.5 Campaign Brief (Per Campaign)

The Campaign Brief is entered fresh for each campaign. It captures "what you're trying to achieve right now." Brief depth varies by mode.

##### Discovery Mode Brief (Rich)

Used when the user selects "I have a problem." AI needs full context to recommend message and media strategy.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Business problem | Text area | Yes | "What challenge are you trying to solve?" |
| Success metric | Text + number | Encouraged | "What does success look like? e.g., 'Increase demos by 25%'" |
| Timeline | Date picker or dropdown | Encouraged | "When do you need results?" |
| Budget | Dropdown ranges | No | Ranges: <$5K, $5-25K, $25-100K, $100K+ |
| Campaign constraints | Text area | No | "Any limitations? (Resources, compliance, market conditions)" |
| What's been tried | Text area | No | "What have you already attempted? What worked or didn't?" |

##### Directed Mode Brief (Light)

Used when the user selects "I know what I need." User already has strategy; AI needs minimal context.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Campaign name | Text | Yes | For organization and library |
| Goal | Dropdown + text | Yes | Dropdown: Awareness / Consideration / Conversion / Retention. Text for specifics. |
| Campaign-specific mandatories | Text area | No | "Any must-includes for this campaign only?" |

**Context Injection:** Brand Profile fields are auto-attached to both brief types. User does not re-enter persistent information.
```

---

### [MODIFY] Section 5.3 — Creative Personas

**BEFORE:**
```markdown
#### 5.3 Creative Personas

26 personas across three categories:

| Category | Count | Examples |
|----------|-------|----------|
| Pure Creatives | 10 | Bill Bernbach, Dan Wieden, Lee Clow, George Lois |
| Pure Strategists | 9 | Byron Sharp, Michael Porter, Clayton Christensen, Les Binet |
| Hybrids | 7 | David Ogilvy, Leo Burnett, Rory Sutherland, Seth Godin |

**Creative Remix (Execution Mode):** Pure Creatives (10) + Hybrids (7) = 17 personas
**Strategy Remix (Strategy Mode):** Pure Strategists (9) + Hybrids (7) = 16 personas
```

**AFTER:**
```markdown
#### 5.3 Creative Personas (Framework + Style Application)

26 personas across three categories. Personas function differently depending on where they're applied in the workflow.

| Category | Count | Examples |
|----------|-------|----------|
| Pure Creatives | 10 | Bill Bernbach, Dan Wieden, Lee Clow, George Lois, Paula Scher, Dave Trott |
| Pure Strategists | 9 | Byron Sharp, Michael Porter, Clayton Christensen, Les Binet, Mark Ritson |
| Hybrids | 7 | David Ogilvy, Leo Burnett, Rory Sutherland, Seth Godin |

##### Persona Application by Stage

| Stage | Available Personas | What They Do |
|-------|-------------------|--------------|
| **Strategy Stage** | Pure Strategists (9) + Hybrids (7) = 16 | Apply their strategic *framework* to diagnose the user's challenge. E.g., Clayton Christensen applies Jobs-to-be-Done analysis before any recommendations. |
| **Execution Stage (Remix)** | Pure Creatives (10) + Hybrids (7) = 17 | Apply their creative *philosophy and style* to the output. E.g., Dan Wieden makes copy punchy and irreverent. |

##### Persona Constraint Rule

When a persona is applied at the Execution/Remix stage, the output must remain anchored to the strategy defined earlier. The AI receives this instruction:

```
Strategy anchor: {the strategic recommendation from strategy stage}
Constraint: Creative variations must serve this strategy, not override it.
Persona: Apply {persona's} creative philosophy while maintaining strategic alignment.
```

This prevents persona remixes from undermining the strategic direction.
```

---

### [MODIFY] Section 5.5 — Personal Library (Renumber to 5.6)

**BEFORE:**
```markdown
#### 5.5 Personal Library
- Save outputs with one click
- View, search, and delete saved content
- Metadata preserved (prompt, persona, mode, date)
```

**AFTER:**
```markdown
#### 5.6 Campaign Library

The library is organized by **campaign**, not individual outputs. This supports institutional memory and performance tracking.

##### MVP Features
- Save outputs with one click
- Outputs are grouped under their parent Campaign Brief
- View, search, and delete saved content
- Metadata preserved: prompt, persona, mode, date, campaign name, brand profile

##### Phase 2 Enhancement: Performance Memory

| Field | Type | When Entered |
|-------|------|--------------|
| Campaign outcome | Dropdown | Post-campaign: Worked / Didn't Work / Mixed |
| Results notes | Text area | Post-campaign: What actually happened? |
| Key learning | AI-generated | System generates insight based on brief + outcome |

**AI Reference:** When user starts a new brief, AI can surface relevant past campaigns:

```
"I notice this goal is similar to your Q3 campaign for [Client]. 
That campaign achieved [outcome]. Key learning: [insight].
Would you like to build on that approach or try something different?"
```

Performance Memory is a Phase 2 feature. MVP supports campaign organization and manual notes only.
```

---

## Section 6: Feature Requirements

### [ADD] Section 6.2 — New Features (Insert after 6.1 MVP Features)

```markdown
### 6.2 New Features (v1.1)

#### 6.2.1 Two-Mode Entry Point

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Mode selection screen | To Build | P0 | "I have a problem" vs. "I know what I need" |
| Discovery Mode flow | To Build | P0 | Full Brief → Message Strategy → Media Strategy → Execution → Remix |
| Directed Mode flow | To Build | P0 | Discipline → Light Brief → Strategy Check → Execution → Remix |
| Mode switching mid-session | Cut | — | Users must complete or abandon current flow |

#### 6.2.2 Brief Builder

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Discovery Mode brief form | To Build | P0 | Rich form: problem, metric, timeline, budget, constraints, history |
| Directed Mode brief form | To Build | P0 | Light form: campaign name, goal, campaign mandatories |
| Brand Profile auto-injection | To Build | P0 | Brief inherits Brand Profile context automatically |
| Brief summary confirmation | To Build | P1 | User sees compiled context before generation |

#### 6.2.3 Message Strategy (Discovery Mode Only)

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Strategic angle generation | To Build | P0 | AI proposes 2-3 message strategies based on brief |
| Angle selection | To Build | P0 | User selects, refines, or requests alternatives |
| Strategy rationale | To Build | P1 | "Why this fits" explanation for each angle |

#### 6.2.4 Media Strategy (Discovery Mode Only)

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Channel recommendation | To Build | P1 | AI recommends channel mix based on message + constraints |
| Budget allocation suggestion | To Build | P2 | Suggested spend distribution (if budget provided) |
| "Not recommended" explanation | To Build | P1 | AI explains why certain channels don't fit |
| Channel adjustment | To Build | P1 | User can add/remove channels before execution |

#### 6.2.5 Strategy Check (Directed Mode Only)

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Alignment detection | To Build | P0 | AI evaluates if discipline matches goal |
| Light-touch prompt | To Build | P0 | Non-blocking suggestion: "Consider pairing with X" |
| Strong misalignment warning | To Build | P1 | Blocking prompt if severe mismatch detected |
| Override option | To Build | P0 | User can always proceed despite warning |

#### 6.2.6 Strategic Audit (Both Modes)

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Pre-execution audit | To Build | P1 | Before generating execution content, AI checks strategy alignment |
| Misalignment flag | To Build | P1 | "Your goal is X, but this tactic typically serves Y" |
| Proceed/Revise options | To Build | P1 | User chooses to continue, revise strategy, or get explanation |
```

---

## Section 7: User Experience

### [MODIFY] Section 7.1 — MVP User Journey

**BEFORE:**
```markdown
### 7.1 MVP User Journey

1. **Sign Up** → Email verification
2. **Onboarding** → Set up brand profile
3. **Dashboard** → See prompt categories
4. **Select Prompt** → Choose discipline and prompt
5. **Generate** → Run prompt with brand context
6. **Remix** → Apply persona for variation
7. **Save** → Store in personal library
8. **Upgrade** → Hit limit, convert to Premium
```

**AFTER:**
```markdown
### 7.1 User Journey (Two Modes)

#### Common Entry (Both Modes)

1. **Sign Up** → Email verification
2. **Onboarding** → Set up Brand Profile (persistent context)
3. **Mode Selection** → "I have a problem" (Discovery) or "I know what I need" (Directed)

#### Discovery Mode Journey

4. **Campaign Brief (Rich)** → Business problem, success metric, constraints, history
5. **Message Strategy** → AI proposes 2-3 strategic angles; user selects
6. **Media Strategy** → AI recommends channel mix; user confirms or adjusts
7. **Discipline Selection** → Based on media strategy, select first discipline to execute
8. **Execution** → Generate content anchored to message strategy
9. **Remix** → Apply creative persona for variation (constrained to strategy)
10. **Save** → Store under campaign in library
11. **Repeat** → Generate for additional disciplines in the media mix

#### Directed Mode Journey

4. **Brand Selection** → (Freelancers) Select which Brand Profile to use
5. **Discipline Selection** → Pick discipline: SEO, Paid, Social, etc.
6. **Campaign Brief (Light)** → Campaign name, goal, campaign-specific mandatories
7. **Strategy Check** → AI flags potential misalignment (skippable)
8. **Execution** → Generate content with brand context
9. **Remix** → Apply creative persona for variation
10. **Save** → Store under campaign in library

#### Upgrade Trigger (Both Modes)

- Free tier limit reached → Prompt to upgrade
- Premium unlocks: unlimited prompts, all disciplines, all personas, additional Brand Profiles
```

---

### [ADD] Section 7.3 — User Flow Diagrams

**INSERT after Section 7.2:**

```markdown
### 7.3 User Flow Diagrams

#### Mode Selection Screen

```
┌─────────────────────────────────────────────────────────────────┐
│                         AMPLIFY                                  │
│                                                                  │
│            What would you like to do?                           │
│                                                                  │
│   ┌─────────────────────────┐   ┌─────────────────────────┐    │
│   │                         │   │                         │    │
│   │   "I have a problem"    │   │   "I know what I need"  │    │
│   │                         │   │                         │    │
│   │   Guide me to the       │   │   Let me execute        │    │
│   │   right strategy        │   │   quickly               │    │
│   │                         │   │                         │    │
│   │   Best for:             │   │   Best for:             │    │
│   │   • New campaigns       │   │   • Repeat tasks        │    │
│   │   • Uncertain goals     │   │   • Clear objectives    │    │
│   │   • Strategic planning  │   │   • Fast turnaround     │    │
│   │                         │   │                         │    │
│   └─────────────────────────┘   └─────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Discovery Mode Flow

```
BRIEF (Rich)
    ↓
MESSAGE STRATEGY
AI proposes 2-3 angles → User selects
    ↓
MEDIA STRATEGY  
AI recommends channels → User confirms/adjusts
    ↓
EXECUTION
Select discipline → Generate → Remix → Save
    ↓
REPEAT for additional disciplines
```

#### Directed Mode Flow

```
DISCIPLINE SELECTION
    ↓
BRIEF (Light)
    ↓
STRATEGY CHECK
AI flags misalignment (skippable)
    ↓
EXECUTION
Generate → Remix → Save
```
```

---

## Section 10: Success Metrics

### [MODIFY] Section 10.1 — North Star Metric

**BEFORE:**
```markdown
### 10.1 North Star Metric
**Monthly Active Users (MAU)** generating and publishing content
```

**AFTER:**
```markdown
### 10.1 North Star Metric
**Monthly Active Users completing Campaign Briefs** (either mode)

This measures strategic engagement, not just content generation. A user who completes a brief has engaged with the core value proposition.
```

---

### [MODIFY] Section 10.2 — KPIs

**BEFORE:**
```markdown
| Category | Metric | Target |
|----------|--------|--------|
| Acquisition | Weekly signups | 100+ |
| Activation | % running 1+ prompt | 50% |
| Engagement | Prompts per user/month | 20+ |
| Retention | 30-day retention | 40% |
| Revenue | Free-to-paid conversion | 5% |
| Revenue | Monthly Recurring Revenue | $5K (6 months) |
| Satisfaction | Net Promoter Score | 50+ |
```

**AFTER:**
```markdown
| Category | Metric | Target | Notes |
|----------|--------|--------|-------|
| Acquisition | Weekly signups | 100+ | Unchanged |
| Activation | % completing first Campaign Brief | 50% | Changed from "running 1+ prompt" |
| Engagement | Campaigns completed per user/month | 4+ | Changed from prompts; quality over quantity |
| Engagement | % using Discovery Mode | 30%+ | Tracks strategic feature adoption |
| Engagement | % using Strategy Check (Directed) | 60%+ | Tracks guardrail visibility |
| Retention | 30-day retention | 40% | Unchanged |
| Retention | 90-day retention (3+ campaigns) | 25% | New: longer-term qualified cohort |
| Revenue | Free-to-paid conversion | 8% | Increased from 5%; higher value prop |
| Revenue | Monthly Recurring Revenue | $5K (6 months) | Unchanged |
| Satisfaction | Net Promoter Score | 50+ | Unchanged |
```

---

### [ADD] Section 10.4 — New Analytics Events

**INSERT after Section 10.3:**

```markdown
### 10.4 New Analytics Events (v1.1)

| Event | When | Mode |
|-------|------|------|
| `mode_selected_discovery` | User chooses "I have a problem" | Discovery |
| `mode_selected_directed` | User chooses "I know what I need" | Directed |
| `brief_started` | User begins Campaign Brief | Both |
| `brief_completed` | User submits Campaign Brief | Both |
| `message_strategy_generated` | AI returns strategic angles | Discovery |
| `message_strategy_selected` | User selects an angle | Discovery |
| `media_strategy_generated` | AI returns channel recommendations | Discovery |
| `media_strategy_confirmed` | User confirms channel mix | Discovery |
| `strategy_check_shown` | Strategy Check displayed | Directed |
| `strategy_check_overridden` | User proceeds despite warning | Directed |
| `strategy_check_accepted` | User adjusts based on suggestion | Directed |
| `strategic_audit_triggered` | Pre-execution audit shown | Both |
| `strategic_audit_revised` | User revises based on audit | Both |
```

---

## Section 12: Roadmap & Milestones

### [MODIFY] Section 12.1 — Sprint Timeline

**BEFORE:**
```markdown
| Sprint | Duration | Focus | Milestone |
|--------|----------|-------|-----------|
| Sprint 1 | Week 1 | Brand Profile Enhancement | Complete brand fields |
| Sprint 2 | Week 2 | Usage Tracking & Limits | Free tier limits working |
| Sprint 3 | Week 3 | Stripe Integration | Payments live |
| Sprint 4 | Week 4 | Library Search & Polish | Search + mobile fixes |
| Sprint 5 | Week 5 | Launch Preparation | Marketing page, SEO |
| Sprint 6 | Week 6 | Launch & Iterate | Public launch |
```

**AFTER:**
```markdown
| Sprint | Duration | Focus | Milestone |
|--------|----------|-------|-----------|
| Sprint 1 | Week 1 | Two-Mode Architecture | Mode selection, routing logic |
| Sprint 2 | Week 2 | Brief Builder | Discovery + Directed brief forms, Brand Profile updates |
| Sprint 3 | Week 3 | Strategy Check + Message Strategy | Core Discovery flow, Directed guardrail |
| Sprint 4 | Week 4 | Stripe Integration + Usage Limits | Payments live, free tier limits |
| Sprint 5 | Week 5 | Library Restructure + Polish | Campaign-based organization, mobile fixes |
| Sprint 6 | Week 6 | Launch Preparation | Marketing page, updated positioning |
| Sprint 7 | Week 7 | Launch & Iterate | Public launch |

**Note:** Media Strategy recommendation (Discovery Mode) moved to Sprint 8-9 as Phase 1.5 enhancement. MVP launches with Message Strategy; Media Strategy is a fast-follow.
```

---

## Section 13: Risks & Mitigations

### [ADD] New Risks

**INSERT into existing risk table:**

```markdown
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Discovery Mode too slow for some users | Medium | Medium | Directed Mode provides fast path; clear labeling of mode benefits |
| Strategy Check ignored by most users | Medium | Low | Track override rate; adjust prominence if needed |
| Message Strategy outputs feel generic | Medium | High | Rich brief inputs required; extensive prompt testing |
| Two modes confuse new users | Low | Medium | Clear mode selection UI with "best for" guidance |
| Persona remixes undermine strategy | Medium | Medium | Implement strategy constraint injection in remix prompts |
```

---

## Section 14: Open Questions

### [MODIFY] Open Questions

**RESOLVED:**
- ~~Custom personas: Should we allow users to create their own personas?~~ → **Deferred to Phase 3**
- ~~Watermarking: Should free users see a watermark on outputs?~~ → **No. Reduces perceived quality.**

**NEW QUESTIONS:**
1. **Media Strategy depth:** Should Media Strategy recommend channels beyond the 9 disciplines (e.g., events, PR, partnerships)?
2. **Brief templates:** Should we offer pre-filled brief templates for common scenarios (product launch, rebrand, demand gen)?
3. **Mode memory:** Should the system remember user's preferred mode, or always prompt?
4. **Collaborative briefs:** Should multiple team members be able to contribute to a single Campaign Brief? (Team tier consideration)

---

## Appendices

### [ADD] Appendix E: User Stories (Two Modes)

```markdown
### Appendix E: User Stories

#### Discovery Mode User Story

**User:** Rachel, Head of Marketing at a 40-person B2B SaaS company

**Situation:** Rachel's CEO mandates 30% pipeline growth in H2 with no additional headcount. She has $75K and a coordinator. Last quarter's paid search failed. She's overwhelmed and doesn't know where to focus.

**Journey:**
1. Rachel opens Amplify and selects "I have a problem"
2. She fills in a rich brief: business problem, constraints, what's been tried
3. Amplify returns three Message Strategy options with rationale
4. She selects "Trusted Advisor" positioning
5. Amplify recommends a Media Strategy: LinkedIn organic, virtual roundtable, email nurture, retargeting
6. She adjusts the mix (skips roundtable, adds content piece)
7. She generates LinkedIn content anchored to the strategy
8. She remixes through Dave Trott's persona for sharper copy
9. She saves both versions to her campaign library

**Outcome:** Rachel got strategy she can present to her CEO, a channel mix that fits her constraints, and execution that ladders to the strategy. She returns to build the email sequence.

---

#### Directed Mode User Story

**User:** Marcus, freelance marketing consultant with 5 clients

**Situation:** Marcus needs 10 Instagram posts for a client's product launch in 8 days. He knows exactly what he needs and has done this dozens of times. He doesn't need strategy. He needs speed.

**Journey:**
1. Marcus opens Amplify and selects "I know what I need"
2. He selects his client's Brand Profile (GlowLab Skincare)
3. He picks Social discipline
4. He fills in a light brief: campaign name, goal, campaign-specific mandatories
5. Strategy Check suggests pairing with Email; he skips it (handling separately)
6. Amplify generates 10 Instagram post concepts
7. He remixes through Paula Scher's persona for a bolder version
8. He saves both versions tagged to the client and campaign

**Outcome:** Marcus was in and out in 12 minutes. He got content that meets the brief, respects mandatories, and gives him two creative directions. No friction.
```

---

## Integration Checklist for Claude Code

When applying this amendment:

- [ ] Update Executive Summary (one-liner, tagline, value prop)
- [ ] Update Positioning Statement in Section 3
- [ ] Replace Strategic Pillars in Section 3
- [ ] Update Section 5.4 (Brand Profile) with new fields
- [ ] Insert new Section 5.5 (Campaign Brief)
- [ ] Update Section 5.3 (Personas) with framework vs. style distinction
- [ ] Update Section 5.5 → 5.6 (Library) with campaign organization
- [ ] Insert Section 6.2 (New Features)
- [ ] Replace Section 7.1 (User Journey) with two-mode architecture
- [ ] Insert Section 7.3 (Flow Diagrams)
- [ ] Update Section 10.1 (North Star)
- [ ] Update Section 10.2 (KPIs)
- [ ] Insert Section 10.4 (New Analytics Events)
- [ ] Update Section 12.1 (Sprint Timeline)
- [ ] Add new risks to Section 13
- [ ] Update Section 14 (Open Questions)
- [ ] Insert Appendix E (User Stories)

---

*Amendment Version 1.1 — January 2025*
*Based on strategic review by Fabrica Collective*

# PRD Addendum: Agency Operating Model

## Overview

This document extends the existing PRD to reframe Amplify as a **virtual agency room** rather than a content generation tool. The key insight from strategic review: what differentiates us is capturing the **strategic thinking process** of real agencies (DDB, Grey, McCann), not just their outputs.

---

## Strategic Reframe

### Current State: Content-First
Users navigate by discipline/channel (SEO, Social, Email) and get AI-generated content.

### Target State: Decision-First
Users navigate by **role** (Planning, Creative, Media) and engage in strategic dialogue before execution.

### The Core Differentiator
> "Every other AI tool starts with 'what channel?' Amplify starts with 'what's the real problem?'"

---

## The Agency Room Model

### Three Roles (Three Entry Points)

| Role | Authority | Entry Point | Current Feature Mapping |
|------|-----------|-------------|------------------------|
| **Planning** | Sets strategy, defines the brief, approves messaging | "Talk to Planning" / "Sanity-check this brief" | Strategy Mode → Evolves to Planning dialogue |
| **Creative** | Executes within approved strategy | "Talk to Creative" | Execution Mode → Becomes Creative dialogue |
| **Media** | Optimizes placement and distribution | (Phase 2) | Future: Channel/distribution recommendations |

### Authority Model

```
Planning reviews and approves → Creative executes within bounds → Media optimizes delivery
```

- **Planning has veto power**: Creative execution cannot proceed without approved strategic direction
- **Creative respects constraints**: Works within Planning's defined message strategy
- **Media serves both**: Distribution decisions informed by strategy AND creative

---

## Feature Mapping: Existing → Agency Model

### What We Keep (Core Assets)

| Existing Feature | Agency Model Role | Notes |
|------------------|-------------------|-------|
| Strategy/Execution Toggle | Planning/Creative authority | Rename to "Ask Planning" / "Ask Creative" |
| Brand Context | Shared context for all roles | Persists across conversations |
| Campaigns | Strategic Threads | Evolve to be the "north star object" |
| Personas (AI-generated) | Target audience for Planning & Creative | Enhances both roles |
| Creative Remix (26 legends) | Creative role toolbox | "How would Ogilvy execute this brief?" |
| Prompt Library by Discipline | Organized by role + discipline | Group prompts by who uses them |

### What We Add

| New Feature | Role | Priority | Description |
|-------------|------|----------|-------------|
| **Planning Review** | Planning | P0 | Gate before Creative execution - validates strategy |
| **Strategic Thread** | All | P0 | North star object linking all conversations |
| **Brief Validator** | Planning | P0 | "Sanity-check this brief" entry point |
| **Discovery Mode** | Planning | P1 | Find the real problem before solving |
| **Creative Execution Log** | Creative | P1 | Track what's been generated against the thread |
| **Media Recommendations** | Media | P2 | Channel/timing suggestions (future) |

---

## The Strategic Thread (North Star Object)

### Definition
A Strategic Thread is the connective tissue linking:
- Initial problem statement
- Planning decisions and rationale
- Approved messaging strategy
- All Creative executions
- Performance data (future)

### Lifecycle

```
1. INITIATION
   User describes challenge → Planning explores → Problem clarified

2. STRATEGY
   Planning proposes strategies → User selects/refines → Strategy locked

3. REVIEW
   Brief validated → Planning Review checkpoint → Approved for execution

4. EXECUTION
   Creative generates content → Always referencing approved strategy

5. OPTIMIZATION (Future)
   Media recommends channels → Performance feeds back to Planning
```

### Thread States

| State | Description | Allowed Actions |
|-------|-------------|-----------------|
| `draft` | Problem being explored | Edit, delete |
| `in_planning` | Strategy being developed | Planning conversations |
| `pending_review` | Ready for Planning Review | Review, approve, reject |
| `approved` | Strategy locked, ready for Creative | Creative execution only |
| `active` | Content being generated | Generate, track |
| `completed` | Campaign finished | Archive, report |

---

## Planning Review Flow (P0 Feature)

### What It Is
A mandatory checkpoint before Creative execution that validates the strategic foundation.

### When It Triggers
1. User switches from Planning to Creative mode
2. User tries to generate execution content without approved strategy
3. User explicitly requests "sanity check"

### The Review Process

```
┌─────────────────────────────────────────────────────────┐
│                    PLANNING REVIEW                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📋 STRATEGIC FOUNDATION                                │
│  ├─ Problem Statement: [captured]                       │
│  ├─ Target Audience: [from personas or brand]           │
│  ├─ Core Message Strategy: [from Discovery]             │
│  └─ Key Mandatories: [campaign + brand]                 │
│                                                          │
│  ⚠️  CHECKLIST                                          │
│  □ Clear single-minded proposition?                     │
│  □ Distinctive vs. competition?                         │
│  □ Relevant to target audience?                         │
│  □ Aligned with brand guidelines?                       │
│  □ Achievable within constraints?                       │
│                                                          │
│  🤖 AI ASSESSMENT                                        │
│  "This brief is [strong/needs work] because..."         │
│  Suggested improvements: [if any]                       │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Approve    │  │   Refine     │  │    Back      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Review Outcomes

| Outcome | Next Step |
|---------|-----------|
| **Approved** | Creative execution unlocked, thread state → `approved` |
| **Refine** | Returns to Planning with specific feedback |
| **Back** | Cancels review, stays in current state |

---

## Updated Navigation Structure

### Current Navigation
```
Disciplines → [SEO, Content, Social, Email, etc.] → Select Prompt → Generate
```

### Agency Model Navigation
```
┌─────────────────────────────────────────────────────────┐
│                     AMPLIFY                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  🏠 Dashboard                                            │
│     └─ Active Strategic Threads                         │
│     └─ Recent Activity                                   │
│                                                          │
│  📋 TALK TO PLANNING                                     │
│     └─ Start New Thread (Discovery)                     │
│     └─ Sanity-Check a Brief                             │
│     └─ Strategic Framework Tools                        │
│                                                          │
│  🎨 TALK TO CREATIVE                                     │
│     └─ [Requires Approved Thread]                       │
│     └─ Execute by Discipline                            │
│     └─ Creative Remix (Legends)                         │
│                                                          │
│  📊 MEDIA (Future)                                       │
│     └─ Channel Recommendations                          │
│     └─ Distribution Planning                            │
│                                                          │
│  📁 MY WORK                                              │
│     └─ Strategic Threads                                │
│     └─ Saved Outputs                                     │
│     └─ Library                                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## User Journeys

### Journey 1: New Problem → Full Solution

```
1. User: "Talk to Planning"
2. System: "What's the challenge you're facing?"
3. User: Describes business problem
4. Planning: Explores, asks clarifying questions
5. Planning: Proposes 3 strategic angles
6. User: Selects preferred strategy
7. System: "Ready for Creative execution. Review strategy first?"
8. User: Reviews → Approves
9. User: "Talk to Creative"
10. Creative: Generates content aligned to approved strategy
11. User: Remixes with different legend perspectives
12. User: Saves and exports
```

### Journey 2: Existing Brief → Validation

```
1. User: "Sanity-check this brief"
2. System: "Paste your brief or describe your current direction"
3. User: Uploads/pastes brief
4. Planning: Analyzes against best practices
5. Planning: "Your brief is strong on X, but weak on Y"
6. Planning: Suggests improvements
7. User: Refines or approves
8. System: Thread created with validated brief
9. User: Proceeds to Creative
```

### Journey 3: Quick Execution (Power Users)

```
1. User: Selects existing approved thread
2. User: "Talk to Creative"
3. User: Selects discipline/prompt
4. Creative: Generates within thread strategy
5. User: Exports
```

---

## Implementation Phases

### Phase 0: Foundational (Current Sprint)
- [x] Brand context system
- [x] Campaign context system
- [x] Persona generation and selection
- [x] Discovery mode (strategy exploration)
- [x] Strategy/Execution toggle
- [x] Creative Remix with 26 legends
- [ ] **Add: Planning Review checkpoint**
- [ ] **Add: Strategic Thread as data object**

### Phase 1: Agency UX (Next Sprint)
- [ ] Rename "Strategy Mode" → "Talk to Planning"
- [ ] Rename "Execution Mode" → "Talk to Creative"
- [ ] Add navigation entry points
- [ ] Implement thread state machine
- [ ] Gate Creative behind Planning approval
- [ ] "Sanity-check this brief" entry point

### Phase 2: Enhanced Planning
- [ ] Brief upload and parsing
- [ ] Competitive analysis tools
- [ ] Message testing frameworks
- [ ] Planning templates (for different challenge types)

### Phase 3: Media Role
- [ ] Channel recommendations
- [ ] Distribution timing
- [ ] Performance feedback loop

---

## Success Metrics (Updated)

### North Star (Changed)
- **Strategic Threads Completed** (from Discovery → Approved → Executed)

### Supporting Metrics
| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Threads with Planning Review | 80%+ | Shows users value the process |
| Planning → Creative conversion | 60%+ | Strategy leads to execution |
| Brief sanity-check usage | 30%+ of new users | Entry point works |
| Creative outputs per thread | 5+ | Strategy enables multiple executions |
| Remix usage per execution | 2+ | Users exploring perspectives |

---

## Open Questions Resolved

| Question | Decision |
|----------|----------|
| Do we hide Creative until Planning approves? | Soft gate: show but prompt for review |
| What if user has no strategy? | Discovery mode helps them find one |
| What about quick one-off generations? | Allow with warning, but encourage thread creation |
| How do existing campaigns become threads? | Auto-migrate: campaign → thread with `approved` state |

---

## Appendix: Terminology Mapping

| Old Term | New Term | Notes |
|----------|----------|-------|
| Campaign | Strategic Thread | More comprehensive |
| Strategy Mode | Planning Role | Role-based framing |
| Execution Mode | Creative Role | Role-based framing |
| Prompt Library | Role Toolbox | Organized by who uses them |
| Generate | "Ask Planning" / "Ask Creative" | Conversational framing |

---

*Created: January 2025*
*Status: Addendum to Main PRD*
*Next Review: After Phase 1 implementation*

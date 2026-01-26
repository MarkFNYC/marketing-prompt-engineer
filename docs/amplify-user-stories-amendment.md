# User Stories Amendment v1.1
## Instructions for Integration

**Purpose:** This document amends the existing USER_STORIES.md to support the two-mode architecture (Discovery Mode + Directed Mode) and campaign-centric organization.

**Integration Approach:**
- **[NEW EPIC]** — Insert as new epic (Epic 0 becomes the new foundational epic)
- **[MODIFY STORY]** — Update existing story with new/changed acceptance criteria
- **[NEW STORY]** — Add to existing epic
- **[DEPRECATE]** — Mark as lower priority or remove (noted but not deleted)

**Priority Key (unchanged):**
- **P0** — Must have for MVP
- **P1** — Important, next after MVP
- **P2** — Nice to have
- **P3** — Future consideration

---

## Amendment Summary

| Change Type | Location | Summary |
|-------------|----------|---------|
| NEW EPIC | Epic 0 | Campaign Flow (two-mode architecture, briefs, strategy) |
| MODIFY | Epic 1 | Personas apply as frameworks (strategy) or styles (execution) |
| MODIFY | Epic 2 | Brand Profile gets new fields |
| MODIFY | Epic 4 | Library becomes campaign-centric |
| DEPRECATE | Epic 5 | Publishing integrations deprioritized (P2) |
| NEW STORIES | Various | 18 new user stories added |

---

## [NEW EPIC] Epic 0: Campaign Flow

This epic covers the core two-mode architecture. Insert before Epic 1 (renumber existing epics if needed, or keep as "Epic 0").

---

### US-0.1: Choose Entry Mode
**As a** user starting a new project
**I want to** choose between "I have a problem" and "I know what I need"
**So that** I get the right workflow for my situation

**Acceptance Criteria:**
- [ ] Mode selection screen appears after clicking "New Campaign" or "Create"
- [ ] Two clear options with descriptions:
  - "I have a problem" → Discovery Mode (guide me to the right strategy)
  - "I know what I need" → Directed Mode (let me execute quickly)
- [ ] Each option shows "Best for" examples
- [ ] Selection routes to appropriate flow
- [ ] User can return to mode selection if they abandon mid-flow

**Priority:** P0

---

### US-0.2: Create Campaign (Discovery Mode)
**As a** user who selected "I have a problem"
**I want to** create a campaign with a detailed brief
**So that** the AI can recommend the right strategy

**Acceptance Criteria:**
- [ ] Campaign creation form with fields:
  - Campaign name (required)
  - Business problem (required, text area)
  - Success metric (encouraged, text + value)
  - Timeline (encouraged, date picker)
  - Budget (optional, dropdown ranges)
  - Constraints (optional, text area)
  - What's been tried (optional, text area)
- [ ] Brand Profile auto-selected (or prompt to choose if multiple)
- [ ] "Continue to Strategy" button enabled when required fields complete
- [ ] Campaign saved to database on creation

**Priority:** P0

---

### US-0.3: Create Campaign (Directed Mode)
**As a** user who selected "I know what I need"
**I want to** quickly create a campaign and pick my discipline
**So that** I can get to execution fast

**Acceptance Criteria:**
- [ ] Discipline selector appears first (9 disciplines)
- [ ] Light brief form with fields:
  - Campaign name (required)
  - Goal type (required, dropdown: Awareness/Consideration/Conversion/Retention)
  - Goal description (optional, text)
  - Campaign-specific mandatories (optional, text area)
- [ ] Brand Profile auto-selected (or prompt to choose if multiple)
- [ ] "Continue to Execution" button routes to prompt library
- [ ] Campaign saved to database on creation

**Priority:** P0

---

### US-0.4: Select Brand for Campaign
**As a** user with multiple brand profiles
**I want to** select which brand this campaign is for
**So that** all outputs use the correct brand context

**Acceptance Criteria:**
- [ ] Brand selector appears in campaign creation flow
- [ ] Shows all user's brands with name and industry
- [ ] Default brand pre-selected
- [ ] Selected brand's context injected into all prompts
- [ ] Brand can be changed before first output is generated

**Priority:** P0

---

### US-0.5: View Message Strategy Options (Discovery Mode)
**As a** user in Discovery Mode
**I want to** see AI-recommended strategic angles
**So that** I can choose the right positioning for my campaign

**Acceptance Criteria:**
- [ ] After submitting brief, AI generates 2-3 message strategy options
- [ ] Each option shows:
  - Strategy name (e.g., "Trusted Advisor Positioning")
  - Core message (one-liner)
  - Angle explanation
  - Rationale ("Why this fits your situation")
- [ ] Loading state while AI generates
- [ ] User can request "Show me different options" (regenerate)

**Priority:** P0

---

### US-0.6: Select Message Strategy (Discovery Mode)
**As a** user viewing message strategy options
**I want to** select and optionally refine my chosen strategy
**So that** it anchors all my campaign executions

**Acceptance Criteria:**
- [ ] Click to select a strategy option
- [ ] Optional refinement field: "Any adjustments to this strategy?"
- [ ] "Confirm Strategy" button saves selection
- [ ] Selected strategy stored in campaign record
- [ ] Strategy displayed as reference throughout execution phase

**Priority:** P0

---

### US-0.7: View Media Strategy Recommendations (Discovery Mode)
**As a** user who selected a message strategy
**I want to** see AI-recommended channels and tactics
**So that** I know where to focus my execution

**Acceptance Criteria:**
- [ ] AI generates channel recommendations based on:
  - Message strategy selected
  - Budget constraints (if provided)
  - Timeline (if provided)
  - What's been tried (if provided)
- [ ] Recommendations show:
  - Channel name
  - Role in campaign
  - Budget allocation (if budget provided)
  - Rationale
- [ ] "Not recommended" section with reasons
- [ ] User can add/remove channels from the mix

**Priority:** P1 (MVP can launch with Message Strategy; Media Strategy fast-follow)

---

### US-0.8: Confirm Media Strategy (Discovery Mode)
**As a** user viewing media recommendations
**I want to** confirm or adjust the channel mix
**So that** I can proceed to execution

**Acceptance Criteria:**
- [ ] Editable list of selected channels
- [ ] Add channel from "not recommended" with override acknowledgment
- [ ] Remove channel with one click
- [ ] "Confirm & Start Executing" button
- [ ] Confirmed mix saved to campaign record
- [ ] Routes to execution with first channel pre-selected

**Priority:** P1

---

### US-0.9: Strategy Check (Directed Mode)
**As a** user in Directed Mode
**I want to** see a quick alignment check before executing
**So that** I don't waste effort on misaligned tactics

**Acceptance Criteria:**
- [ ] After submitting light brief, AI evaluates discipline + goal alignment
- [ ] Three possible states:
  - **Aligned:** No interruption, proceed to execution
  - **Mild misalignment:** Suggestion shown: "Consider also adding X" with [Add] [Continue] buttons
  - **Strong misalignment:** Warning shown: "Your goal is X but this discipline typically serves Y" with [Explore Alternatives] [Continue Anyway] buttons
- [ ] User can always override and proceed
- [ ] Interaction logged for analytics (strategy_checks table)

**Priority:** P0

---

### US-0.10: View Campaign Context During Execution
**As a** user generating content
**I want to** see my brief and strategy as reference
**So that** I stay aligned while creating

**Acceptance Criteria:**
- [ ] Collapsible "Campaign Context" panel on execution page
- [ ] Shows:
  - Campaign name
  - Business problem or goal
  - Selected message strategy (if Discovery)
  - Key constraints and mandatories
- [ ] Panel collapsed by default, expandable on click
- [ ] Always visible as subtle indicator (e.g., campaign name in breadcrumb)

**Priority:** P1

---

### US-0.11: Strategic Audit Before Generation
**As a** user about to generate content
**I want to** see a warning if my execution doesn't serve my strategy
**So that** I don't produce off-strategy content

**Acceptance Criteria:**
- [ ] Before generating, AI checks if prompt + discipline serves the campaign goal/strategy
- [ ] If misaligned, show warning:
  - "Your goal is [X], but [prompt/discipline] typically serves [Y]"
  - [Proceed Anyway] [Choose Different Prompt] buttons
- [ ] If aligned, no interruption
- [ ] Can be disabled in user preferences (power users)

**Priority:** P1

---

### US-0.12: Complete Campaign
**As a** user who has generated outputs
**I want to** mark my campaign as complete
**So that** I can track it and reference it later

**Acceptance Criteria:**
- [ ] "Mark Complete" button on campaign page
- [ ] Completion sets `completed_at` timestamp
- [ ] Completed campaigns appear in "Past Campaigns" section
- [ ] Can reopen campaign to add more outputs

**Priority:** P1

---

### US-0.13: Record Campaign Outcome (Phase 2)
**As a** user with a completed campaign
**I want to** record how it performed
**So that** I can learn from results and inform future campaigns

**Acceptance Criteria:**
- [ ] "Record Results" prompt appears 7 days after completion (or manual trigger)
- [ ] Outcome selector: Worked / Didn't Work / Mixed
- [ ] Notes field for qualitative feedback
- [ ] Optional metrics fields (flexible, user-defined)
- [ ] AI generates learning insight based on brief + outcome
- [ ] Outcome saved to campaign record

**Priority:** P2 (Phase 2 - Performance Memory)

---

### US-0.14: View Past Campaign Insights (Phase 2)
**As a** user starting a new campaign
**I want to** see relevant past campaigns and what I learned
**So that** I don't repeat mistakes

**Acceptance Criteria:**
- [ ] When creating new campaign, AI surfaces similar past campaigns
- [ ] Shows: campaign name, goal, outcome, key learning
- [ ] "This goal is similar to your Q3 campaign which [worked/didn't work]"
- [ ] User can dismiss or explore details
- [ ] Only shows campaigns with recorded outcomes

**Priority:** P2 (Phase 2 - Performance Memory)

---

## [MODIFY EPIC] Epic 1: Creative Personas

Personas now function differently at strategy vs execution stages.

---

### [MODIFY] US-1.1: Select a Creative Persona

**BEFORE:**
> **I want to** select a creative persona before running a prompt

**AFTER:**
> **I want to** select a creative persona to style my execution output
> **So that** the content reflects that legend's creative philosophy

**Updated Acceptance Criteria:**
- [ ] Persona selector appears on execution/output page (not during strategy phase)
- [ ] Personas labeled as "Creative Voice" or "Style"
- [ ] Selecting a persona updates the AI system prompt for execution
- [ ] Persona constrained by campaign strategy (output must still serve the strategy)
- [ ] User can run without a persona (default AI voice)

**Priority:** P0

---

### [NEW STORY] US-1.7: Apply Strategist Framework (Discovery Mode)
**As a** user in Discovery Mode
**I want to** optionally apply a strategist's framework to my brief analysis
**So that** I get strategy recommendations through a specific lens

**Acceptance Criteria:**
- [ ] Optional "Strategic Lens" selector on brief submission
- [ ] Shows strategist personas (Byron Sharp, Clayton Christensen, etc.)
- [ ] Selecting applies their framework to strategy generation:
  - Clayton Christensen → Jobs to be Done analysis
  - Byron Sharp → Mental/Physical Availability lens
  - April Dunford → Positioning framework
- [ ] Framework application explained in strategy output
- [ ] Default: No specific framework (general best practices)

**Priority:** P1

---

### [MODIFY] US-1.3: Switch Persona and Regenerate

**Updated Acceptance Criteria:**
- [ ] Persona switcher appears on output page
- [ ] Switching persona reruns with new creative voice
- [ ] **NEW:** Output still anchored to campaign strategy (strategy constraint injected)
- [ ] **NEW:** Tooltip explains: "Changing voice, keeping strategy"
- [ ] Previous output replaced with new generation

**Priority:** P0

---

### [NEW STORY] US-1.8: Persona Category Filter
**As a** user selecting a persona
**I want to** filter personas by category (Creative / Strategist / Hybrid)
**So that** I can quickly find the right type

**Acceptance Criteria:**
- [ ] Filter tabs or dropdown: All / Creatives / Strategists / Hybrids
- [ ] Creative personas (10): Available for execution remix
- [ ] Strategist personas (9): Available for strategy framework
- [ ] Hybrid personas (7): Available for both
- [ ] Current context determines which personas shown by default

**Priority:** P1

---

## [MODIFY EPIC] Epic 2: User Authentication

Add stories for expanded Brand Profile.

---

### [MODIFY] US-2.6: Manage Multiple Brand Contexts

**Add to Acceptance Criteria:**
- [ ] Brand profile includes new fields:
  - Value proposition (one-liner differentiator)
  - Persistent mandatories (elements that must appear in all outputs)
  - Persistent constraints (limitations for all campaigns)
- [ ] Mandatories shown as checklist (add/remove items)
- [ ] Constraints shown as text area
- [ ] These fields auto-inject into all campaign prompts

**Priority:** P1

---

### [NEW STORY] US-2.7: Set Brand Mandatories
**As a** user setting up a brand profile
**I want to** define elements that must appear in all outputs
**So that** I maintain brand/legal consistency

**Acceptance Criteria:**
- [ ] "Mandatories" section in brand profile
- [ ] Add mandatory as text item (e.g., "30-day money-back guarantee")
- [ ] Remove with one click
- [ ] Mandatories injected into every prompt for this brand
- [ ] AI instructed to include these elements in output
- [ ] Visible in Campaign Context panel during execution

**Priority:** P0

---

### [NEW STORY] US-2.8: Set Brand Constraints
**As a** user setting up a brand profile
**I want to** define persistent constraints
**So that** the AI accounts for my limitations

**Acceptance Criteria:**
- [ ] "Constraints" section in brand profile
- [ ] Text area for describing limitations
- [ ] Examples shown: "Regulated industry - no health claims", "Cannot mention competitors"
- [ ] Constraints injected into every prompt for this brand
- [ ] AI instructed to respect these constraints
- [ ] Visible in Campaign Context panel during execution

**Priority:** P0

---

## [MODIFY EPIC] Epic 4: Content Library

Library becomes campaign-centric. Folders remain for legacy organization.

---

### [NEW STORY] US-4.7: View Campaigns List
**As a** user
**I want to** see all my campaigns in one place
**So that** I can find and continue my work

**Acceptance Criteria:**
- [ ] "Campaigns" tab in library (alongside Outputs, Folders)
- [ ] Campaign cards show: name, brand, mode, date, status (active/complete)
- [ ] Click to open campaign detail
- [ ] Sort by: date created, date updated, name
- [ ] Filter by: brand, mode, status

**Priority:** P0

---

### [NEW STORY] US-4.8: View Campaign Detail
**As a** user
**I want to** see a campaign's brief, strategy, and outputs together
**So that** I understand the full context

**Acceptance Criteria:**
- [ ] Campaign detail page shows:
  - Brief summary (problem, goal, constraints)
  - Message strategy (if Discovery)
  - Media strategy (if Discovery)
  - All outputs generated for this campaign
- [ ] "Add Output" button to continue generating
- [ ] "Edit Brief" option (limited after outputs exist)
- [ ] "Mark Complete" / "Reopen" toggle

**Priority:** P0

---

### [NEW STORY] US-4.9: Filter Outputs by Campaign
**As a** user viewing my library
**I want to** filter outputs by campaign
**So that** I can see all content for a specific project

**Acceptance Criteria:**
- [ ] Campaign filter dropdown in library
- [ ] Shows all campaigns + "No Campaign" option (legacy outputs)
- [ ] Selecting filters output list
- [ ] Can combine with other filters (discipline, tag, date)

**Priority:** P1

---

### [MODIFY] US-4.1: Save an Output

**Add to Acceptance Criteria:**
- [ ] **NEW:** Output automatically linked to active campaign (if in campaign flow)
- [ ] **NEW:** If saving outside campaign flow, output has no campaign link
- [ ] **NEW:** Can manually assign output to campaign later

**Priority:** P0

---

### [MODIFY] US-4.3: Create Folders

**Update Priority and Add Note:**

**Priority:** P2 (was P1)

**Note:** Folders are retained for users who prefer this organization method, but campaigns are the primary organization unit. Folders become secondary.

---

## [MODIFY EPIC] Epic 5: Publishing Integrations

Deprioritize publishing. Focus remains on strategy and content generation.

---

### [MODIFY] US-5.1 through US-5.6

**Update Priority for all stories:**

| Story | Previous Priority | New Priority | Rationale |
|-------|------------------|--------------|-----------|
| US-5.1: Connect LinkedIn | P0 | P2 | Publishing not core to strategy value prop |
| US-5.2: Publish to LinkedIn | P0 | P2 | Focus on generation, not distribution |
| US-5.3: Schedule a Post | P1 | P3 | Future consideration |
| US-5.4: Connect Twitter/X | P0 | P2 | Deprioritized with LinkedIn |
| US-5.5: Connect Email Platform | P1 | P2 | Deprioritized |
| US-5.6: View Connected Accounts | P1 | P2 | Deprioritized |

**Rationale:** Per PRD amendment, publishing integrations are "Don't Build" for MVP. Amplify differentiates on strategic thinking, not distribution. Users can copy/paste to their publishing tools.

---

## Reference User Journeys

These are not user stories but narrative journeys for team reference. Include as appendix or separate document.

---

### Journey A: Rachel — Discovery Mode

**User:** Rachel, Head of Marketing at a 40-person B2B SaaS company

**Situation:** CEO mandates 30% pipeline growth in H2 with no additional headcount. $75K budget, team of 2. Last quarter's paid search failed. She's overwhelmed and doesn't know where to focus.

**Journey:**

1. **Mode Selection:** Rachel opens Amplify and clicks "New Campaign." She selects **"I have a problem"** because she needs guidance.

2. **Brand Selection:** Her company brand (TechFlow SaaS) is pre-selected as default.

3. **Brief Creation:** She fills in:
   - Campaign name: "H2 Pipeline Growth"
   - Business problem: "We need to grow qualified pipeline by 30% in H2. Current pipeline is $2M, need to get to $2.6M."
   - Success metric: "Pipeline value" / "$2.6M"
   - Timeline: December 31
   - Budget: "$25K-$100K" (she selects the range)
   - Constraints: "Team of 2, no dev resources, long enterprise sales cycle"
   - What's been tried: "Paid search last quarter. High CPC, low conversion. Most leads were too small."

4. **Message Strategy:** Amplify generates three options:
   - "Trusted Advisor" positioning
   - "Risk Reversal" positioning  
   - "Peer Proof" positioning
   
   Rachel selects **Trusted Advisor** because her best customers say "You helped us think through the problem."

5. **Media Strategy:** Amplify recommends:
   - LinkedIn Organic (thought leadership)
   - Email Nurture (convert warm leads)
   - LinkedIn Paid (retargeting only)
   - Long-form Content (SEO + gated)
   
   Not recommended: Paid search (already failed), TikTok (audience mismatch)
   
   Rachel confirms the mix, removing LinkedIn Paid for now (budget concern).

6. **Execution:** She selects LinkedIn discipline first. She picks a prompt: "Thought leadership post series." The AI generates 10 post concepts anchored to "Trusted Advisor" messaging.

7. **Remix:** She likes the posts but wants more edge. She remixes through **Dave Trott's** persona. Posts get sharper.

8. **Save:** She saves both versions to the campaign. She'll return tomorrow to generate the email nurture sequence.

**Outcome:** Rachel has a strategy she can present to her CEO, a channel mix that fits her constraints, and content that ladders to the strategy.

---

### Journey B: Marcus — Directed Mode

**User:** Marcus, freelance marketing consultant with 5 clients

**Situation:** His client GlowLab Skincare needs 10 Instagram posts for a product launch in 8 days. He knows exactly what he needs. He doesn't need strategy. He needs speed.

**Journey:**

1. **Mode Selection:** Marcus opens Amplify and clicks "New Campaign." He selects **"I know what I need"** because he's done this dozens of times.

2. **Brand Selection:** He has 5 client brands saved. He selects **GlowLab Skincare**.

3. **Discipline Selection:** He picks **Social** from the grid.

4. **Brief Creation:** Light form:
   - Campaign name: "Vitamin C Serum Launch"
   - Goal type: Awareness (dropdown)
   - Goal description: "Drive awareness and pre-orders. Launch in 8 days."
   - Campaign mandatories: "Must include 'Dermatologist-tested', no before/after photos (compliance)"

5. **Strategy Check:** Amplify shows a mild suggestion:
   > "Consider pairing with Email for pre-order conversions."
   > [Add Email] [Continue with Social only]
   
   Marcus clicks **Continue** — he's handling email separately.

6. **Execution:** He's routed to Social prompts. He picks "Instagram product launch series." AI generates 10 post concepts with captions, respecting the "Dermatologist-tested" mandatory and avoiding before/after claims.

7. **Remix:** He wants two versions. He saves the default, then remixes through **Paula Scher's** persona for a bolder version.

8. **Save:** Both versions saved to campaign, tagged to GlowLab.

**Outcome:** Marcus was in and out in 12 minutes. He has content that meets the brief, respects mandatories, and gives him two creative directions to present.

---

## Integration Checklist for Claude Code

When applying this amendment:

- [ ] Insert Epic 0 (Campaign Flow) with all 14 new stories
- [ ] Modify US-1.1 acceptance criteria (persona for execution)
- [ ] Add US-1.7 (Strategist Framework) and US-1.8 (Persona Category Filter)
- [ ] Modify US-1.3 acceptance criteria (strategy constraint)
- [ ] Modify US-2.6 acceptance criteria (new brand fields)
- [ ] Add US-2.7 (Brand Mandatories) and US-2.8 (Brand Constraints)
- [ ] Add US-4.7 (Campaigns List), US-4.8 (Campaign Detail), US-4.9 (Filter by Campaign)
- [ ] Modify US-4.1 acceptance criteria (campaign linking)
- [ ] Update US-4.3 priority to P2
- [ ] Update Epic 5 priorities (all to P2/P3)
- [ ] Add Rachel and Marcus journeys as appendix

**New Story Count:** 18 new stories
**Modified Stories:** 6 stories
**Total Stories After Amendment:** 58 (was 40)

---

## Priority Summary After Amendment

| Priority | Count | Key Stories |
|----------|-------|-------------|
| **P0** | 22 | Mode selection, briefs, message strategy, strategy check, campaign list, brand mandatories |
| **P1** | 18 | Media strategy, strategic audit, campaign context, persona frameworks, search, analytics |
| **P2** | 12 | Folders, publishing integrations, export, performance memory |
| **P3** | 6 | Team features, AI insights, scheduling |

---

*User Stories Amendment Version 1.1 — January 2025*
*Based on PRD Amendment v1.1*

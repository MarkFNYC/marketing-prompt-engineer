# User Stories

## Overview
This document contains all user stories organized by epic, with acceptance criteria and priority levels.

**Priority Key:**
- **P0** — Must have for MVP
- **P1** — Important, next after MVP
- **P2** — Nice to have
- **P3** — Future consideration

---

## Epic 0: Agency Operating Model (Strategic Foundation)

### US-0.1: Navigate by Agency Role
**As a** user
**I want to** navigate the app by role (Planning, Creative, Media) instead of by channel
**So that** I follow a strategic process rather than jumping straight to content generation

**Acceptance Criteria:**
- [ ] Main navigation shows "Talk to Planning" and "Talk to Creative" entry points
- [ ] "Talk to Media" shown as "Coming Soon"
- [ ] Role-based framing feels like consulting an agency team
- [ ] Clear visual distinction between Planning and Creative modes

**Priority:** P0

---

### US-0.2: Start a Strategic Thread
**As a** user
**I want to** start a new strategic thread by describing my challenge
**So that** Planning can help me find the right approach before I create content

**Acceptance Criteria:**
- [ ] "Talk to Planning" opens conversational interface
- [ ] User describes business challenge
- [ ] Planning AI explores the problem, asks clarifying questions
- [ ] Thread is created and saved automatically
- [ ] Thread appears in "My Strategic Threads" list

**Priority:** P0

---

### US-0.3: Sanity-Check an Existing Brief
**As a** user
**I want to** upload or paste an existing brief for validation
**So that** I can get expert feedback before executing on it

**Acceptance Criteria:**
- [ ] "Sanity-check this brief" entry point available
- [ ] User can paste text or upload a document
- [ ] AI parses brief and extracts key elements
- [ ] AI provides strength assessment (1-10 score)
- [ ] AI suggests specific improvements
- [ ] User can accept suggestions or proceed as-is
- [ ] Creates a strategic thread from the brief

**Priority:** P0

---

### US-0.4: Planning Review Checkpoint
**As a** user
**I want to** review and approve my strategy before Creative execution
**So that** all my content stays aligned to a clear strategic foundation

**Acceptance Criteria:**
- [ ] Planning Review screen shows strategic summary
- [ ] Checklist validates key brief elements
- [ ] AI assessment provides feedback
- [ ] User can Approve, Refine, or go Back
- [ ] Approval unlocks Creative execution
- [ ] Review is logged for audit trail

**Priority:** P0

---

### US-0.5: Gate Creative Behind Approved Strategy
**As a** user attempting to generate content
**I want to** be prompted to complete Planning Review first
**So that** I don't create off-strategy content by accident

**Acceptance Criteria:**
- [ ] Clicking "Talk to Creative" without approved thread shows soft gate
- [ ] User sees what strategy elements are missing
- [ ] Option to "Quick approve" or "Complete Planning Review"
- [ ] Power users can override (with warning)
- [ ] Thread state tracks whether review is passed

**Priority:** P0

---

### US-0.6: View Strategic Thread Summary
**As a** user
**I want to** see a summary of my strategic thread at any time
**So that** I can remember the strategic foundation when creating content

**Acceptance Criteria:**
- [ ] Thread summary visible in sidebar during Creative mode
- [ ] Shows: problem statement, target audience, core message, mandatories
- [ ] Collapsible to save space
- [ ] Quick link to full thread details
- [ ] Editable only through Planning (not Creative)

**Priority:** P1

---

### US-0.7: Track Creative Outputs Against Thread
**As a** user
**I want to** see all content generated within a strategic thread
**So that** I can track what I've created and ensure consistency

**Acceptance Criteria:**
- [ ] Thread detail page shows all linked outputs
- [ ] Outputs grouped by discipline
- [ ] Shows which creative persona was used (if any)
- [ ] Export thread summary + all outputs
- [ ] Mark thread as complete when campaign ends

**Priority:** P1

---

### US-0.8: Discovery Mode for Problem Exploration
**As a** user
**I want to** explore my business problem with AI before committing to a strategy
**So that** I can find the right approach rather than jumping to solutions

**Acceptance Criteria:**
- [ ] Discovery mode available within "Talk to Planning"
- [ ] AI asks probing questions about the challenge
- [ ] Generates 3-5 potential strategic angles
- [ ] User selects preferred direction
- [ ] Selection becomes the "strategy anchor" for the thread

**Priority:** P1

---

### US-0.9: Select Target Persona for Thread
**As a** user
**I want to** associate a target persona with my strategic thread
**So that** all Planning and Creative work is tailored to that audience

**Acceptance Criteria:**
- [ ] Persona selector available during Planning
- [ ] Can select from AI-generated or manually created personas
- [ ] Persona context injected into all AI conversations
- [ ] Persona summary visible in thread sidebar
- [ ] Can change persona (triggers suggestion to re-review strategy)

**Priority:** P0

---

## Epic 1: Creative Personas

### US-1.1: Select a Creative Persona
**As a** user
**I want to** select a creative persona (like David Ogilvy or Steve Jobs) before running a prompt
**So that** the AI output reflects that legend's style, philosophy, and approach

**Acceptance Criteria:**
- [ ] Persona selector appears on the library view page
- [ ] Selecting a persona updates the AI system prompt
- [ ] Selected persona is shown on the output page
- [ ] User can run without a persona (default AI voice)

**Priority:** P0

---

### US-1.2: View Persona Details
**As a** user
**I want to** see a brief bio and philosophy of each persona
**So that** I understand their approach before selecting one

**Acceptance Criteria:**
- [ ] Each persona card shows: name, photo, era, one-line philosophy
- [ ] Clicking expands to show: full bio, best uses, sample phrases
- [ ] "Best for" tags help users choose appropriate persona

**Priority:** P0

---

### US-1.3: Switch Persona and Regenerate
**As a** user
**I want to** change the persona on the output page and regenerate
**So that** I can compare how different legends would approach the same prompt

**Acceptance Criteria:**
- [ ] Persona switcher appears on output page (similar to mode toggle)
- [ ] Switching persona automatically reruns the prompt
- [ ] Loading state shows which persona is generating
- [ ] Previous output is replaced with new generation

**Priority:** P0

---

### US-1.4: Favorite Personas
**As a** user
**I want to** mark personas as favorites
**So that** my preferred personas appear first in the selection list

**Acceptance Criteria:**
- [ ] Heart/star icon on each persona card
- [ ] Favorited personas appear in "Favorites" section at top
- [ ] Favorites persist across sessions (localStorage / database)
- [ ] Max 5 favorites allowed

**Priority:** P1

---

### US-1.5: Preview Persona Output Style
**As a** user
**I want to** see example outputs from each persona
**So that** I can understand the difference in writing style

**Acceptance Criteria:**
- [ ] "See example" link on each persona card
- [ ] Modal shows 2-3 sample outputs in that persona's voice
- [ ] Examples cover different prompt types (headline, email, strategy)
- [ ] Examples are static (pre-generated, not live API calls)

**Priority:** P2

---

### US-1.6: Premium Persona Gating
**As a** free user
**I want to** see premium personas with a lock icon
**So that** I know what I'm missing and can decide to upgrade

**Acceptance Criteria:**
- [ ] Premium personas marked with lock icon
- [ ] Clicking locked persona shows upgrade modal
- [ ] Modal explains persona value and shows pricing
- [ ] 2 personas available free (Ogilvy, Bernbach)

**Priority:** P1

---

## Epic 2: User Authentication

### US-2.1: Sign Up with Email
**As a** visitor
**I want to** create an account with email and password
**So that** I can save my work and access it later

**Acceptance Criteria:**
- [ ] Sign up form with email, password, confirm password
- [ ] Password strength indicator
- [ ] Email validation (format + uniqueness)
- [ ] Verification email sent immediately
- [ ] Account created but limited until email verified

**Priority:** P0

---

### US-2.2: Sign Up with Google
**As a** visitor
**I want to** sign up with my Google account
**So that** I can get started quickly without creating another password

**Acceptance Criteria:**
- [ ] "Continue with Google" button on sign up page
- [ ] OAuth flow completes and redirects to app
- [ ] Account created with Google email (auto-verified)
- [ ] Profile picture pulled from Google if available

**Priority:** P0

---

### US-2.3: Log In
**As a** registered user
**I want to** log in to my account
**So that** I can access my saved content and settings

**Acceptance Criteria:**
- [ ] Login form with email and password
- [ ] "Remember me" checkbox for extended session
- [ ] "Forgot password" link
- [ ] Error message for invalid credentials
- [ ] Redirect to last page or dashboard after login

**Priority:** P0

---

### US-2.4: Reset Password
**As a** user who forgot my password
**I want to** reset it via email
**So that** I can regain access to my account

**Acceptance Criteria:**
- [ ] "Forgot password" page with email input
- [ ] Reset email sent within 1 minute
- [ ] Link valid for 1 hour
- [ ] Password reset page with strength requirements
- [ ] Confirmation and redirect to login

**Priority:** P0

---

### US-2.5: Edit Profile
**As a** logged-in user
**I want to** edit my profile information
**So that** the AI can better personalize outputs

**Acceptance Criteria:**
- [ ] Profile page with editable fields: name, company, role
- [ ] Avatar upload (or Gravatar fallback)
- [ ] Changes saved immediately with confirmation
- [ ] Profile data used in onboarding prompts

**Priority:** P1

---

### US-2.6: Manage Multiple Brand Contexts
**As a** premium user
**I want to** save multiple brand contexts
**So that** I can switch between clients or projects easily

**Acceptance Criteria:**
- [ ] "Brands" section in settings
- [ ] Add new brand: name, website, industry, challenge
- [ ] Set one brand as default
- [ ] Quick switcher in header to change active brand
- [ ] Limit: 1 (free), 5 (premium), 20 (team)

**Priority:** P1

---

## Epic 3: Subscription & Payments

### US-3.1: View Pricing Plans
**As a** visitor or free user
**I want to** see available pricing plans
**So that** I can choose the right tier for my needs

**Acceptance Criteria:**
- [ ] Pricing page shows all tiers in comparison table
- [ ] Current plan highlighted if logged in
- [ ] Monthly/annual toggle with annual savings shown
- [ ] Clear feature differences between tiers
- [ ] CTA buttons for each tier

**Priority:** P0

---

### US-3.2: Subscribe to Premium
**As a** free user
**I want to** upgrade to Premium with my credit card
**So that** I can unlock all features

**Acceptance Criteria:**
- [ ] Upgrade button leads to Stripe checkout
- [ ] Monthly or annual selection
- [ ] Successful payment activates premium immediately
- [ ] Confirmation email sent
- [ ] Redirect to success page with confetti 🎉

**Priority:** P0

---

### US-3.3: See Usage Limits
**As a** free user
**I want to** see how many prompts I have left this month
**So that** I can decide whether to upgrade

**Acceptance Criteria:**
- [ ] Usage indicator in header: "7/10 prompts used"
- [ ] Progress bar fills as limit approaches
- [ ] Warning at 80% usage
- [ ] Upgrade prompt when limit reached

**Priority:** P0

---

### US-3.4: Manage Subscription
**As a** premium user
**I want to** view and manage my subscription
**So that** I can upgrade, downgrade, or cancel

**Acceptance Criteria:**
- [ ] Billing page shows current plan and renewal date
- [ ] "Change plan" option with proration preview
- [ ] "Cancel subscription" with confirmation
- [ ] "Update payment method" link to Stripe portal

**Priority:** P0

---

### US-3.5: View Billing History
**As a** premium user
**I want to** see my past invoices and download receipts
**So that** I can track expenses and get reimbursed

**Acceptance Criteria:**
- [ ] Billing history table with date, amount, status
- [ ] Download PDF invoice for each payment
- [ ] Filter by date range
- [ ] Link to Stripe customer portal for details

**Priority:** P1

---

## Epic 4: Content Library

### US-4.1: Save an Output
**As a** user
**I want to** save an AI output with one click
**So that** I can access it later

**Acceptance Criteria:**
- [ ] "Save" button on output page
- [ ] Saved confirmation with option to name
- [ ] Output appears in library immediately
- [ ] Metadata saved: prompt, persona, mode, brand, timestamp

**Priority:** P0

---

### US-4.2: View Saved Outputs
**As a** user
**I want to** see all my saved outputs in one place
**So that** I can find and reuse content

**Acceptance Criteria:**
- [ ] Library page with card grid or list view
- [ ] Each card shows: title, discipline, date, preview
- [ ] Click to open full output
- [ ] Sort by: date, name, discipline

**Priority:** P0

---

### US-4.3: Create Folders
**As a** user
**I want to** create folders to organize my content
**So that** I can find things by project or client

**Acceptance Criteria:**
- [ ] "New folder" button in library
- [ ] Folder name and optional color
- [ ] Drag-and-drop outputs into folders
- [ ] Nested folders up to 3 levels

**Priority:** P1

---

### US-4.4: Tag Outputs
**As a** user
**I want to** add tags to my saved outputs
**So that** I can organize content across folders

**Acceptance Criteria:**
- [ ] Tag input on output detail page
- [ ] Autocomplete existing tags
- [ ] Create new tag inline
- [ ] Filter library by tag

**Priority:** P1

---

### US-4.5: Search Saved Outputs
**As a** user
**I want to** search my saved content by keyword
**So that** I can quickly find what I need

**Acceptance Criteria:**
- [ ] Search bar at top of library
- [ ] Searches: title, content, tags, notes
- [ ] Results highlighted with match context
- [ ] Filters can combine with search

**Priority:** P1

---

### US-4.6: Export Outputs
**As a** user
**I want to** export my saved content
**So that** I can use it in other tools or share with team

**Acceptance Criteria:**
- [ ] Export single output as: Markdown, DOCX, PDF
- [ ] Export folder as ZIP
- [ ] Preserve formatting in exports
- [ ] Include metadata (prompt, date, persona)

**Priority:** P2

---

## Epic 5: Publishing Integrations

### US-5.1: Connect LinkedIn
**As a** premium user
**I want to** connect my LinkedIn account
**So that** I can publish content directly

**Acceptance Criteria:**
- [ ] "Connect LinkedIn" button in integrations settings
- [ ] OAuth flow with LinkedIn
- [ ] Show connected account name/photo
- [ ] Disconnect option with confirmation

**Priority:** P0

---

### US-5.2: Publish to LinkedIn
**As a** user with connected LinkedIn
**I want to** publish a generated post directly
**So that** I don't have to copy-paste

**Acceptance Criteria:**
- [ ] "Publish to LinkedIn" button on output page
- [ ] Preview how post will look
- [ ] Edit before publishing if needed
- [ ] Confirmation after successful publish
- [ ] Link to view live post

**Priority:** P0

---

### US-5.3: Schedule a Post
**As a** premium user
**I want to** schedule a post for a future date/time
**So that** I can plan my content calendar

**Acceptance Criteria:**
- [ ] "Schedule" option alongside "Publish now"
- [ ] Date/time picker with timezone
- [ ] Scheduled posts appear in queue
- [ ] Edit or cancel scheduled posts
- [ ] Email notification when post goes live

**Priority:** P1

---

### US-5.4: Connect Twitter/X
**As a** premium user
**I want to** connect my Twitter account
**So that** I can publish tweets and threads

**Acceptance Criteria:**
- [ ] OAuth flow with Twitter
- [ ] Publish single tweets or threads
- [ ] Thread auto-numbered with /n format
- [ ] Character count validation

**Priority:** P0

---

### US-5.5: Connect Email Platform
**As a** premium user
**I want to** connect Mailchimp, Klaviyo, or ConvertKit
**So that** I can push email content to my campaigns

**Acceptance Criteria:**
- [ ] API key input for email platforms
- [ ] List/audience selection
- [ ] Push as draft (not send directly)
- [ ] Subject line and preview text included

**Priority:** P1

---

### US-5.6: View Connected Accounts
**As a** user
**I want to** see all my connected integrations
**So that** I can manage them in one place

**Acceptance Criteria:**
- [ ] Integrations page shows all connected accounts
- [ ] Status indicator (connected, error, expired)
- [ ] Last used timestamp
- [ ] Reconnect button if token expired

**Priority:** P1

---

## Epic 6: Analytics

### US-6.1: View Prompt Usage
**As a** user
**I want to** see how many prompts I've run
**So that** I understand my usage patterns

**Acceptance Criteria:**
- [ ] Dashboard shows prompts run this month
- [ ] Breakdown by discipline
- [ ] Trend over last 6 months
- [ ] Most-used prompts list

**Priority:** P1

---

### US-6.2: Track Published Content
**As a** premium user
**I want to** see performance of my published content
**So that** I know what's working

**Acceptance Criteria:**
- [ ] LinkedIn metrics: views, reactions, comments
- [ ] Twitter metrics: impressions, engagements
- [ ] Metrics update every 24 hours
- [ ] Comparison across posts

**Priority:** P2

---

### US-6.3: AI Performance Insights
**As a** user
**I want to** get AI-generated insights on my content
**So that** I can improve my marketing

**Acceptance Criteria:**
- [ ] Weekly digest email (opt-in)
- [ ] "Your best-performing post used X persona"
- [ ] "Try running more prompts in Execution mode"
- [ ] Recommendations based on usage data

**Priority:** P3

---

## Epic 7: Team Collaboration

### US-7.1: Create a Team
**As a** team tier subscriber
**I want to** create a team and invite members
**So that** we can collaborate on content

**Acceptance Criteria:**
- [ ] Team creation with name
- [ ] Invite via email
- [ ] Invite expires after 7 days
- [ ] Max 5 members per team

**Priority:** P2

---

### US-7.2: Share Brand Contexts
**As a** team admin
**I want to** share brand contexts with my team
**So that** everyone uses consistent brand info

**Acceptance Criteria:**
- [ ] Mark brand as "shared with team"
- [ ] Team members see shared brands in their list
- [ ] Only admins can edit shared brands
- [ ] Members can't delete shared brands

**Priority:** P2

---

### US-7.3: Team Content Library
**As a** team member
**I want to** share outputs to a team library
**So that** others can see and use my content

**Acceptance Criteria:**
- [ ] "Share to team" option on saved outputs
- [ ] Team library tab alongside personal library
- [ ] Original author shown on shared content
- [ ] Team members can copy but not edit

**Priority:** P2

---

### US-7.4: Team Usage Analytics
**As a** team admin
**I want to** see usage across my team
**So that** I can track ROI and adoption

**Acceptance Criteria:**
- [ ] Admin dashboard with team stats
- [ ] Prompts run per member
- [ ] Most popular disciplines
- [ ] Content published via integrations

**Priority:** P3

---

---

## Epic 8: Target Personas (Audience Personas)

### US-8.1: Generate Target Personas from Context
**As a** user
**I want to** generate target personas based on my industry and audience
**So that** I can create content tailored to specific buyer profiles

**Acceptance Criteria:**
- [ ] "Generate Personas" button in Personas Manager
- [ ] AI generates 3 distinct personas from brand context
- [ ] Each persona includes: name, role, pain points, goals, behaviors
- [ ] Personas saved to project/thread
- [ ] Can regenerate if not satisfied

**Priority:** P0 ✅ (Implemented)

---

### US-8.2: Manually Create Target Persona
**As a** user
**I want to** manually create a target persona
**So that** I can define specific audience segments I already know

**Acceptance Criteria:**
- [ ] Form to create persona with all fields
- [ ] Required: name, role
- [ ] Optional: description, pain points, goals, behaviors, channels
- [ ] Avatar emoji selector
- [ ] Save to project/thread

**Priority:** P0 ✅ (Implemented)

---

### US-8.3: Select Persona for Content Generation
**As a** user
**I want to** select a target persona before generating content
**So that** the AI tailors outputs to that specific audience

**Acceptance Criteria:**
- [ ] Persona selector in Library View
- [ ] Selected persona context sent to AI
- [ ] AI references persona pain points and goals
- [ ] Output reflects persona's preferred tone/channels
- [ ] Clear indicator of which persona content was generated for

**Priority:** P0 ✅ (Implemented)

---

### US-8.4: Edit and Delete Personas
**As a** user
**I want to** edit or delete personas I've created
**So that** I can keep my audience definitions current

**Acceptance Criteria:**
- [ ] Edit button on persona cards
- [ ] Delete with confirmation
- [ ] Warning if persona is linked to saved outputs
- [ ] Deleted personas removed from all selections

**Priority:** P1

---

*Last Updated: January 2025*
*Total User Stories: 53*

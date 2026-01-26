# Business Rules

## Overview
This document defines the business logic and rules governing the Marketing Prompt Engineer Pro platform.

---

## 1. User Tiers & Limits

### 1.1 Free Tier
| Rule | Limit |
|------|-------|
| Monthly prompt runs | 10 |
| Available disciplines | 3 (SEO, Content, Social) |
| Available personas | 2 (Ogilvy, Bernbach) |
| Saved outputs | 5 total |
| Brand contexts | 1 |
| Output modes | Strategy only |
| Publishing integrations | None |
| Prompt history | 7 days |

### 1.2 Premium Tier ($29/month)
| Rule | Limit |
|------|-------|
| Monthly prompt runs | Unlimited |
| Available disciplines | All 9 |
| Available personas | All (10+) |
| Saved outputs | Unlimited |
| Brand contexts | 5 |
| Output modes | Strategy + Execution |
| Publishing integrations | All |
| Prompt history | 90 days |

### 1.3 Team Tier ($99/month)
| Rule | Limit |
|------|-------|
| All Premium features | Yes |
| Team members | Up to 5 |
| Shared brand contexts | 20 |
| Team analytics | Yes |
| Priority support | Yes |

### 1.4 Limit Enforcement
- **Prompt limits**: Checked before each prompt run. If exceeded, show upgrade modal.
- **Save limits**: Checked when saving. If at limit, prompt to delete or upgrade.
- **Monthly reset**: Prompt count resets on the 1st of each month at 00:00 UTC.
- **Grace period**: If payment fails, 7-day grace period before downgrade to free.

---

## 2. Authentication Rules

### 2.1 Sign Up
- Email must be unique and valid format
- Password minimum: 8 characters, 1 number, 1 special character
- Email verification required within 24 hours (or account deactivated)
- OAuth (Google) creates account automatically with verified email

### 2.2 Login
- Rate limit: 5 failed attempts, then 15-minute lockout
- Session duration: 30 days (with "remember me")
- Session duration: 24 hours (without "remember me")
- Multiple sessions allowed (max 5 devices)

### 2.3 Password Reset
- Reset link valid for 1 hour
- Rate limit: 3 reset requests per hour
- Previous password cannot be reused (last 5)

---

## 3. Content & Output Rules

### 3.1 Prompt Execution
- User must have brand context set (or use defaults)
- Prompt text is personalized with brand variables before sending to LLM
- System prompt includes persona (if selected) + mode (strategy/execution)
- Maximum prompt length: 10,000 characters
- Maximum output length: 8,000 tokens

### 3.2 Saving Outputs
- Title auto-generated from prompt goal if not provided
- Outputs soft-deleted (recoverable for 30 days)
- Duplicate outputs allowed (same prompt can be saved multiple times)
- Output ownership cannot be transferred

### 3.3 Folders & Tags
- Maximum folder depth: 3 levels
- Maximum folders per user: 50 (free), 200 (premium)
- Maximum tags per user: 20 (free), 100 (premium)
- Maximum tags per output: 10
- Folder names: max 100 characters
- Tag names: max 50 characters

### 3.4 Search
- Full-text search on: title, output_content, notes
- Filters: folder, tags, discipline, persona, mode, date range
- Results paginated: 20 per page
- Search history: last 10 searches stored per user

---

## 4. Agency Role Rules

### 4.1 Role Authority Model
The app operates as a virtual agency with three roles, each with defined authority.

| Role | Authority | Can Do | Cannot Do |
|------|-----------|--------|-----------|
| **Planning** | Sets strategy, defines briefs, approves messaging | Create threads, explore problems, validate briefs, approve for execution | Generate final content, publish |
| **Creative** | Executes within approved strategy | Generate content, remix with legends, adapt to channels | Change strategy, override mandatories |
| **Media** | Optimizes distribution (future) | Recommend channels, timing | Change creative, change strategy |

### 4.2 Strategic Thread States
Threads follow a defined lifecycle with specific rules per state.

| State | Allowed Actions | Blocked Actions |
|-------|-----------------|-----------------|
| `draft` | Edit, delete, Planning conversations | Creative execution |
| `in_planning` | Planning conversations, select strategy | Creative execution |
| `pending_review` | Planning Review (approve/reject/refine) | Creative execution, edit strategy |
| `approved` | Creative execution, view strategy | Edit strategy (requires new review) |
| `active` | Generate content, track outputs | Edit strategy |
| `completed` | Archive, export, report | Generate new content |

### 4.3 Planning Review Requirements
- **Mandatory before Creative**: First creative execution requires approved thread
- **Soft gate**: Users can override with warning for quick one-offs
- **Re-review trigger**: Changing strategy after approval requires new review
- **Review expiry**: None (approval doesn't expire)

### 4.4 Creative Execution Rules
- Creative outputs **must** reference the approved strategy
- Mandatories from thread **must** appear in all outputs
- Constraints from thread **must** be respected
- Target persona (if selected) **must** influence tone and content
- Creative can **suggest** strategy changes but cannot implement them

---

## 5. Creative Persona Rules (Advertising Legends)

### 5.1 Creative Persona Selection
- Default persona: None (uses standard AI voice)
- Persona affects system prompt only, not user prompt
- User can change persona and regenerate on output page
- Persona preference saved per user (not per brand)
- **26 advertising legends** available for Creative Remix

### 5.2 Premium Creative Personas
- Free users: Access to 2 personas (Ogilvy, Bernbach)
- Premium users: Access to all personas
- Premium persona selected by free user: Show preview + upgrade prompt

### 5.3 Creative Persona Behavior
- Persona system prompt prepended to mode system prompt
- Persona should influence tone, not override content accuracy
- If persona conflicts with mode, mode takes precedence
- Creative persona works **within** the approved strategic thread

---

## 6. Target Persona Rules (Audience Personas)

### 6.1 Target Persona Generation
- AI generates 3 distinct personas based on industry/audience context
- Generated personas include: name, role, pain points, goals, behaviors
- Users can regenerate if not satisfied
- Maximum 10 target personas per project (free), unlimited (premium)

### 6.2 Target Persona Selection
- One target persona can be active per thread/session
- Selected persona context injected into all AI conversations
- Both Planning and Creative roles respect target persona
- Changing persona mid-thread triggers suggestion to re-review strategy

### 6.3 Target Persona Data
- Stored per project (localStorage for now, database future)
- Includes: name, role, description, demographics, psychographics
- Behavioral data: pain points, goals, behaviors, preferred channels
- Quote field captures representative mindset

---

## 7. Integration Rules

### 5.1 OAuth Connections
- Tokens encrypted at rest (AES-256)
- Refresh tokens rotated on each use
- If token refresh fails 3x, mark integration as inactive
- User notified via email when integration disconnects

### 5.2 Publishing Rules
- User must confirm before publishing (no auto-publish)
- Character limits enforced per platform:
  - LinkedIn: 3,000 characters
  - Twitter: 280 characters (thread support for longer)
  - Instagram: 2,200 characters
- Images/media not supported in v1 (text only)
- Published content logged with timestamp and URL

### 5.3 Rate Limits (Platform-Specific)
- LinkedIn: 100 posts/day per user
- Twitter: 300 tweets/day per user
- Respect platform rate limits; queue if exceeded

### 5.4 Scheduling
- Premium feature only
- Maximum scheduled posts: 50 (premium), 100 (team)
- Minimum schedule time: 5 minutes from now
- Maximum schedule time: 90 days from now

---

## 8. Billing Rules

### 6.1 Subscription Lifecycle
- Trial: None (free tier serves as trial)
- Billing cycle: Monthly or Annual
- Annual discount: 2 months free (pay for 10, get 12)
- Proration: Upgrades prorated, downgrades credited

### 6.2 Payment Failures
- Retry schedule: Day 1, Day 3, Day 7
- After 3 failures: Downgrade to free tier
- User notified via email at each retry
- Grace period: 7 days after first failure

### 6.3 Cancellation
- Cancellation effective at end of billing period
- No refunds for partial months
- Data retained for 30 days after cancellation
- User can reactivate within 30 days and restore data

### 6.4 Refunds
- Refund requests handled manually via support
- Full refund within 14 days of first payment
- No refunds after 14 days (except at discretion)

---

## 9. Team Rules

### 7.1 Team Structure
- One owner per team (cannot be changed without support)
- Roles: Owner, Admin, Member
- Owner: All permissions + billing management
- Admin: Invite/remove members, manage shared brands
- Member: Use shared brands, view team library

### 7.2 Shared Resources
- Brand contexts can be marked "shared with team"
- Shared brands visible to all team members
- Outputs are personal by default (not shared)
- Team library: Outputs can be shared to team explicitly

### 7.3 Member Management
- Invite via email (link valid 7 days)
- Pending invites count against member limit
- Removing member: Their personal content remains with them
- Removing member: Shared content stays with team

---

## 10. API Usage Rules (Future)

### 8.1 API Access
- API access: Team tier only (initially)
- API key generated per user, rotatable
- Rate limit: 100 requests/minute

### 8.2 API Endpoints
- All endpoints require authentication
- Responses in JSON format
- Pagination via cursor-based pagination
- Errors return standard error format with codes

---

## 11. Content Policies

### 9.1 Prohibited Content
Users may not generate content that is:
- Illegal or promotes illegal activity
- Hateful, harassing, or discriminatory
- Sexually explicit or exploitative
- Promoting violence or self-harm
- Spam or deceptive marketing
- Impersonating individuals without consent

### 9.2 Enforcement
- AI outputs are not pre-screened
- Users responsible for content they publish
- Abuse reports reviewed within 24 hours
- Violations may result in account suspension

### 9.3 Copyright
- Users own outputs generated with their prompts
- Platform has license to store and display outputs
- User must have rights to brand information they input

---

## 12. Data Retention

### 10.1 Active Accounts
| Data Type | Retention |
|-----------|-----------|
| User profile | Indefinite |
| Saved outputs | Indefinite |
| Deleted outputs | 30 days |
| Prompt history (free) | 7 days |
| Prompt history (premium) | 90 days |
| API logs | 30 days |

### 10.2 Deleted Accounts
| Data Type | Retention |
|-----------|-----------|
| All user data | 30 days |
| Anonymized analytics | Indefinite |
| Billing records | 7 years (legal requirement) |

### 10.3 Data Export
- Users can request full data export
- Export delivered within 72 hours
- Format: JSON + Markdown files in ZIP

---

## 13. Feature Flags

| Flag | Description | Default |
|------|-------------|---------|
| `enable_personas` | Show persona selection | true |
| `enable_agency_model` | Show role-based navigation (Planning/Creative) | true |
| `enable_planning_review` | Require Planning Review before Creative | true |
| `enable_target_personas` | Show AI-generated target personas | true |
| `enable_integrations` | Show publishing integrations | false (Phase 5) |
| `enable_teams` | Show team features | false (Phase 5) |
| `enable_api` | Show API documentation | false (Future) |
| `enable_analytics` | Show performance analytics | false (Phase 6) |
| `enable_media_role` | Show Media role features | false (Phase 2) |
| `maintenance_mode` | Show maintenance page | false |

---

*Last Updated: January 2025*
*Updated for Agency Model: January 2025*

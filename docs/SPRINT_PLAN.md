# Sprint Plan

## Overview
This document breaks down the MVP into actionable sprints. Each sprint is 1 week, with specific tasks, story points, and acceptance criteria.

**Story Point Scale:**
- 1 pt = Few hours, straightforward
- 2 pts = Half day, some complexity
- 3 pts = Full day, moderate complexity
- 5 pts = 2-3 days, significant work
- 8 pts = Full week, complex feature

**Velocity Target:** 15-20 points per sprint (solo developer)

---

## Sprint 0: Current State Assessment
*Already completed — documenting what exists*

### Completed Features ✅
- [x] Next.js 14 app with App Router
- [x] Supabase authentication (email/password)
- [x] Email verification flow
- [x] Password reset flow
- [x] 90 prompts across 9 disciplines
- [x] Strategy and Execution modes
- [x] 26 creative personas for remix
- [x] Personal library (save/view/delete)
- [x] Google Gemini API integration
- [x] Vercel deployment
- [x] Vercel Analytics

### Technical Debt to Address
- [ ] TypeScript strict mode cleanup
- [ ] Error boundary implementation
- [ ] Loading state improvements
- [ ] Mobile responsiveness gaps

---

## Sprint 1: Brand Profile Enhancement
*Week of: [DATE]*

**Goal:** Complete the brand profile feature so all outputs are contextually relevant.

### Tasks

| ID | Task | Points | Status |
|----|------|--------|--------|
| S1-1 | Add `target_audience` field to brand profile UI | 2 | 🔲 |
| S1-2 | Add `brand_voice` textarea to brand profile UI | 2 | 🔲 |
| S1-3 | Update database schema for new brand fields | 1 | 🔲 |
| S1-4 | Update API routes to save/retrieve new fields | 2 | 🔲 |
| S1-5 | Inject brand voice into system prompts | 3 | 🔲 |
| S1-6 | Add brand profile completion indicator | 2 | 🔲 |
| S1-7 | Create onboarding flow for new users | 5 | 🔲 |
| S1-8 | Add "Edit Brand" access from header | 1 | 🔲 |

**Total Points:** 18

### Acceptance Criteria
- [ ] User can enter target audience description
- [ ] User can describe their brand voice/tone
- [ ] New fields are saved to database
- [ ] Brand voice is included in AI prompts
- [ ] New users see onboarding wizard
- [ ] Existing users can edit brand from any page

### Dependencies
- Supabase database access
- Current brand profile implementation

---

## Sprint 2: Usage Tracking & Limits
*Week of: [DATE]*

**Goal:** Implement free tier limits and display usage to drive upgrades.

### Tasks

| ID | Task | Points | Status |
|----|------|--------|--------|
| S2-1 | Create usage tracking table/column | 2 | 🔲 |
| S2-2 | Increment usage on each prompt run | 2 | 🔲 |
| S2-3 | Reset usage monthly (cron or on-demand) | 3 | 🔲 |
| S2-4 | Display usage in header (X/10 prompts) | 2 | 🔲 |
| S2-5 | Create "Limit Reached" modal component | 3 | 🔲 |
| S2-6 | Block generation when limit reached | 2 | 🔲 |
| S2-7 | Add upgrade CTA to limit modal | 1 | 🔲 |
| S2-8 | Show usage warning at 80% (8/10) | 2 | 🔲 |

**Total Points:** 17

### Acceptance Criteria
- [ ] Each prompt run increments user's usage count
- [ ] Usage resets on 1st of each month
- [ ] Header shows "7/10 prompts used" style indicator
- [ ] Warning appears when 8+ prompts used
- [ ] Generation blocked at 10 prompts with modal
- [ ] Modal has clear upgrade CTA

### Dependencies
- Sprint 1 (brand profile) should be complete
- Supabase database

---

## Sprint 3: Stripe Integration
*Week of: [DATE]*

**Goal:** Enable users to upgrade to Premium via Stripe.

### Tasks

| ID | Task | Points | Status |
|----|------|--------|--------|
| S3-1 | Create Stripe account and products | 1 | 🔲 |
| S3-2 | Set up Premium product ($29/mo, $290/yr) | 1 | 🔲 |
| S3-3 | Create checkout API route | 3 | 🔲 |
| S3-4 | Implement Stripe webhook handler | 5 | 🔲 |
| S3-5 | Update user tier on successful payment | 2 | 🔲 |
| S3-6 | Create success/cancel redirect pages | 2 | 🔲 |
| S3-7 | Add tier check to usage enforcement | 2 | 🔲 |
| S3-8 | Display "Premium" badge for paid users | 1 | 🔲 |

**Total Points:** 17

### Acceptance Criteria
- [ ] User can click "Upgrade" and reach Stripe checkout
- [ ] Successful payment redirects to success page
- [ ] Webhook updates user's subscription tier
- [ ] Premium users see "Premium" badge
- [ ] Premium users have unlimited prompts
- [ ] Cancelled checkout returns to app gracefully

### Dependencies
- Sprint 2 (usage limits) complete
- Stripe account credentials
- Webhook endpoint accessible (Vercel)

---

## Sprint 4: Library Search & Polish
*Week of: [DATE]*

**Goal:** Add search to library and polish the overall experience.

### Tasks

| ID | Task | Points | Status |
|----|------|--------|--------|
| S4-1 | Add search input to library page | 2 | 🔲 |
| S4-2 | Implement client-side search filtering | 3 | 🔲 |
| S4-3 | Add discipline filter dropdown | 2 | 🔲 |
| S4-4 | Add persona filter dropdown | 2 | 🔲 |
| S4-5 | Mobile responsiveness audit & fixes | 5 | 🔲 |
| S4-6 | Loading states and skeleton screens | 3 | 🔲 |
| S4-7 | Error handling improvements | 3 | 🔲 |
| S4-8 | Empty states with helpful CTAs | 2 | 🔲 |

**Total Points:** 22

### Acceptance Criteria
- [ ] User can search library by keyword
- [ ] User can filter by discipline
- [ ] User can filter by persona used
- [ ] All pages work well on mobile
- [ ] Loading states are clear and consistent
- [ ] Errors show helpful messages
- [ ] Empty library shows "Generate your first prompt"

### Dependencies
- Core features from Sprints 1-3

---

## Sprint 5: Launch Preparation
*Week of: [DATE]*

**Goal:** Prepare for public launch with marketing page, SEO, and beta testing.

### Tasks

| ID | Task | Points | Status |
|----|------|--------|--------|
| S5-1 | Create marketing landing page | 5 | 🔲 |
| S5-2 | Write landing page copy | 3 | 🔲 |
| S5-3 | Add meta tags and OG images | 2 | 🔲 |
| S5-4 | Set up custom domain | 1 | 🔲 |
| S5-5 | Add analytics event tracking | 3 | 🔲 |
| S5-6 | Beta user invites (10-20 users) | 2 | 🔲 |
| S5-7 | Collect and prioritize feedback | 2 | 🔲 |
| S5-8 | Fix critical bugs from beta | 5 | 🔲 |

**Total Points:** 23

### Acceptance Criteria
- [ ] Landing page clearly explains value prop
- [ ] SEO meta tags on all pages
- [ ] Custom domain working (amplify.yourdomain.com)
- [ ] Key events tracked (signup, prompt_run, upgrade)
- [ ] 10+ beta users have tested the app
- [ ] No critical bugs in core user journey

### Dependencies
- Sprints 1-4 complete
- Domain DNS access
- Beta user list

---

## Sprint 6: Launch & Iterate
*Week of: [DATE]*

**Goal:** Public launch and rapid response to user feedback.

### Tasks

| ID | Task | Points | Status |
|----|------|--------|--------|
| S6-1 | Announce launch (Twitter, LinkedIn, etc.) | 2 | 🔲 |
| S6-2 | Submit to Product Hunt (optional) | 3 | 🔲 |
| S6-3 | Monitor error logs and fix issues | 5 | 🔲 |
| S6-4 | Respond to user feedback | 3 | 🔲 |
| S6-5 | Quick wins from feedback | 5 | 🔲 |
| S6-6 | Write "What's Next" blog post | 2 | 🔲 |

**Total Points:** 20

### Success Criteria
- [ ] Public launch announced
- [ ] 100+ signups in first week
- [ ] <1% error rate in logs
- [ ] 5+ pieces of user feedback collected
- [ ] At least 2 quick wins shipped

---

## Post-MVP Sprints (Backlog)

### Sprint 7-8: Folders & Tags
- Folder creation and management
- Drag-and-drop organization
- Tag system with autocomplete
- Filter by folder/tag

### Sprint 9-10: Multiple Brand Profiles
- Add/edit/delete multiple brands
- Brand switcher in header
- Brand-specific library views
- Premium limit: 5 brands

### Sprint 11-12: Publishing Integrations
- LinkedIn OAuth
- Direct publish to LinkedIn
- Twitter/X integration
- Scheduling (future)

### Sprint 13-14: Analytics Dashboard
- Usage analytics
- Most-used prompts
- Persona effectiveness
- Export reports

---

## Sprint Ceremonies

### Daily (Async)
- Update task status in this doc
- Note any blockers

### Weekly
- Sprint review: What shipped?
- Sprint retro: What to improve?
- Sprint planning: What's next?

### Bi-Weekly
- User feedback review
- Metrics check (signups, conversions)
- Roadmap adjustment if needed

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Stripe webhook issues | Medium | High | Test thoroughly in Stripe test mode |
| Mobile responsiveness gaps | High | Medium | Dedicate time in Sprint 4 |
| Low conversion rate | Medium | High | A/B test pricing and upgrade prompts |
| API rate limits | Low | High | Implement queuing and caching |
| Scope creep | High | Medium | Stick to MVP definition strictly |

---

## Definition of Done (Per Sprint)

A sprint is **done** when:
1. All tasks marked complete
2. Code reviewed and merged
3. Deployed to production
4. No new critical bugs introduced
5. Acceptance criteria verified
6. Sprint documented

---

*Last Updated: January 2025*

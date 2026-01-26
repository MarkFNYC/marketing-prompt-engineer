# Product Requirements Document (PRD)
# Amplify — AI-Powered Marketing Platform

**Document Version:** 1.0
**Last Updated:** January 2025
**Product Owner:** Fabrica Collective
**Status:** Active Development

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Product Vision & Strategy](#3-product-vision--strategy)
4. [Target Users](#4-target-users)
5. [Product Overview](#5-product-overview)
6. [Feature Requirements](#6-feature-requirements)
7. [User Experience](#7-user-experience)
8. [Technical Architecture](#8-technical-architecture)
9. [Business Model](#9-business-model)
10. [Success Metrics](#10-success-metrics)
11. [Competitive Analysis](#11-competitive-analysis)
12. [Roadmap & Milestones](#12-roadmap--milestones)
13. [Risks & Mitigations](#13-risks--mitigations)
14. [Open Questions](#14-open-questions)
15. [Appendices](#15-appendices)

---

## 1. Executive Summary

### Product Name
**Amplify** by Fabrica Collective

### One-Liner
> "Your AI marketing team in a browser — from strategy to send."

### Tagline
> "The marketing team you can't afford to hire."

### What It Is
Amplify is an AI-powered marketing platform that gives solo marketers and small teams access to strategic thinking from legendary marketing minds. Unlike generic AI tools that just generate copy, Amplify helps users think like David Ogilvy, Steve Jobs, and Seth Godin — for $29/month.

### Core Value Proposition
- **90 expert prompts** across 9 marketing disciplines
- **26 creative personas** based on legendary marketers and strategists
- **Strategy + Execution modes** — think first, then produce
- **Brand personalization** — every output is contextually relevant
- **Learn while you create** — understand the "why" behind the output

### Current Status
- **v1.0 (HTML prototype):** Shipped
- **v2.0 (SaaS platform):** In development
- Authentication, prompt library, personas, and personal library are built
- Monetization and enhanced features in progress

---

## 2. Problem Statement

### The Gap in the Market

**The Problem:**
- **ChatGPT/Jasper** generate content but don't think strategically
- **Agencies** provide strategy but cost $5,000-20,000/month
- **Solo marketers** are stuck between "do it yourself" and "can't afford help"

### User Pain Points

| User Type | Pain Point |
|-----------|------------|
| Solo Marketer | "I know I should be doing more strategic thinking, but I'm drowning in execution" |
| Freelancer | "I need to produce more without sacrificing quality" |
| Founder | "I don't know marketing, but I can't afford to hire someone" |

### Why Current Solutions Fail

| Solution | Problem |
|----------|---------|
| ChatGPT | No marketing focus, no brand context, same generic voice |
| Jasper | Expensive ($49+/mo), complex, shallow strategic depth |
| Copy.ai | Quick generations but no strategy, low quality |
| Agencies | Cost-prohibitive for small teams, slow turnaround |
| DIY | Time-intensive, lacks expert-level insight |

### The Opportunity
There's a significant market of solo marketers, freelancers, and small teams who need agency-level strategic thinking but can't afford agency prices. They want to learn and improve, not just outsource.

---

## 3. Product Vision & Strategy

### Vision Statement
Transform how small teams approach marketing by democratizing access to world-class strategic thinking through AI.

### Mission
Help every marketer think strategically and produce excellent content — regardless of budget or experience level.

### Strategic Pillars

1. **Expert Personas**
   - 26 legendary marketing minds
   - Not just tone of voice — strategic thinking frameworks
   - Learn while you create

2. **Strategy-First Approach**
   - Strategy mode explains the thinking
   - Execution mode produces the output
   - Both modes, one workflow

3. **Brand Intelligence**
   - Define once, use everywhere
   - Every output is contextually relevant
   - Builds institutional knowledge

### Positioning Statement

> **For** solo marketers and small teams **who** can't afford an agency,
> **Amplify** is a **strategic AI marketing platform** that **gives you a
> team of legendary creative minds** — unlike **generic AI tools** that
> just generate copy, **we help you think like Ogilvy, Jobs, and Godin**.

---

## 4. Target Users

### Primary Persona: The Solo Marketer

**Who they are:**
- Marketing manager or director at a startup/SMB
- Team of 1-3 people
- Responsible for everything: strategy, content, social, email, ads
- Budget: <$500/mo for tools

**Their needs:**
- Strategic thinking on demand
- Feels like having a creative director on call
- Learn from the best while getting work done

### Secondary Persona: The Freelancer/Consultant

**Who they are:**
- Independent marketing consultant
- Serves 3-10 clients
- Needs to deliver quality at scale
- Budget: Passes cost to clients

**Their needs:**
- Multiple brand profiles for different clients
- Personas let them offer different creative approaches
- Library builds up reusable assets

### Tertiary Persona: The Marketing-Curious Founder

**Who they are:**
- Startup founder wearing the marketing hat
- Technical background, not a natural marketer
- Knows marketing matters but doesn't know where to start
- Budget: Minimal, ROI-focused

**Their needs:**
- Strategy mode explains the thinking
- Personas teach different approaches
- Builds marketing intuition over time

---

## 5. Product Overview

### Core Features

#### 5.1 Prompt Library
- **9 marketing disciplines:** SEO, Paid Media, Lifecycle, Content, CRO, LinkedIn, Blog, Email, Social
- **90 expert prompts:** 10 per discipline
- **50+ mental models:** Strategic frameworks from Reforge, CXL, Demand Curve, and more

#### 5.2 Output Modes

| Mode | Purpose | Output Type |
|------|---------|-------------|
| **Strategy Mode** | Get frameworks, analysis, and recommendations | Planning documents, audits, strategies |
| **Execution Mode** | Get ready-to-use content you can copy and publish | Posts, emails, ad copy, headlines |

#### 5.3 Creative Personas

26 personas across three categories:

| Category | Count | Examples |
|----------|-------|----------|
| Pure Creatives | 10 | Bill Bernbach, Dan Wieden, Lee Clow, George Lois |
| Pure Strategists | 9 | Byron Sharp, Michael Porter, Clayton Christensen, Les Binet |
| Hybrids | 7 | David Ogilvy, Leo Burnett, Rory Sutherland, Seth Godin |

**Creative Remix (Execution Mode):** Pure Creatives (10) + Hybrids (7) = 17 personas
**Strategy Remix (Strategy Mode):** Pure Strategists (9) + Hybrids (7) = 16 personas

#### 5.4 Brand Profile
- Brand name, website, industry
- Target audience description
- Brand voice and tone
- Value proposition
- Current marketing challenge

#### 5.5 Personal Library
- Save outputs with one click
- View, search, and delete saved content
- Metadata preserved (prompt, persona, mode, date)

---

## 6. Feature Requirements

### 6.1 MVP Features (P0)

#### Authentication
| Feature | Status | Notes |
|---------|--------|-------|
| Email/password signup | Built | Supabase Auth |
| Email verification | Built | Required within 24 hours |
| Password reset | Built | Link valid 1 hour |
| Login persistence | Built | 30-day sessions |
| Google OAuth | Cut | Post-MVP |

#### Brand Profile
| Feature | Status | Notes |
|---------|--------|-------|
| Brand name, website, industry | Built | Required |
| Challenge/goal field | Built | Current focus |
| Target audience | Add to MVP | Text field |
| Brand voice description | Add to MVP | Text field |
| Multiple brands | Cut | Premium feature |

#### Prompt Library
| Feature | Status | Notes |
|---------|--------|-------|
| 9 disciplines | Built | All available |
| 90 prompts | Built | 10 per discipline |
| Strategy mode | Built | Framework outputs |
| Execution mode | Built | Ready-to-use content |

#### Creative Personas
| Feature | Status | Notes |
|---------|--------|-------|
| 26 personas available | Built | Full taxonomy |
| Persona selection on remix | Built | After generation |
| Persona bio/philosophy | Enhance | Add detail modal |

#### Content Library
| Feature | Status | Notes |
|---------|--------|-------|
| Save output with one click | Built | — |
| View saved outputs | Built | List view |
| Delete saved outputs | Built | Soft delete |
| Copy to clipboard | Built | — |
| Search library | Add to MVP | Keyword search |

#### Usage & Billing
| Feature | Status | Notes |
|---------|--------|-------|
| Track prompts used | Built | Per user |
| Display usage (X/10) | Add to MVP | Header indicator |
| Block at limit | Add to MVP | Show upgrade modal |
| Stripe checkout | Add to MVP | Payment links OK |

### 6.2 Post-MVP Features (P1-P3)

#### Phase 2: Enhanced Library
- Folders and nested organization
- Tags and cross-folder filtering
- Export to Markdown/PDF
- Prompt history (unsaved outputs)

#### Phase 3: Brand Profile Pro
- Multiple brand profiles (Premium: 5)
- Brand colors, fonts, visual identity
- Logo upload
- Team-shared brands

#### Phase 4: Publishing Integrations
- LinkedIn OAuth + direct publish
- Twitter/X posting
- Scheduling posts
- Email platform integrations (Mailchimp, Klaviyo)

#### Phase 5: Analytics
- Usage dashboard
- Performance tracking (if published)
- AI-powered insights

#### Phase 6: Teams
- Team workspaces
- Shared libraries
- Role-based permissions

---

## 7. User Experience

### 7.1 MVP User Journey

```
1. LAND → Marketing page explains value prop
         "AI-powered marketing team in your browser"

2. SIGN UP → Email/password, verify email

3. ONBOARD → Define brand context
             - Brand name
             - Website
             - Industry
             - Main challenge
             - Target audience
             - Brand voice

4. EXPLORE → Browse 9 disciplines, 90 prompts
             See what's possible

5. GENERATE → Pick a prompt, run it
              Get strategic output

6. REMIX → Apply a creative persona lens
           See how Ogilvy/Jobs/Godin would approach it

7. SAVE → Save best outputs to library
          Build a content bank

8. HIT LIMIT → "You've used 10/10 free prompts"
               Upgrade to Premium for unlimited

9. CONVERT → Stripe checkout → Premium unlocked
```

### 7.2 Key UX Principles

1. **Progressive disclosure** — Don't overwhelm; reveal complexity gradually
2. **One-click actions** — Save, copy, remix should be instant
3. **Context preservation** — Brand info persists across all prompts
4. **Learning moments** — Strategy mode explains the thinking
5. **Mobile-first** — Works well on all devices

### 7.3 Brand Profile Onboarding

**Step 1: Basics** — Name, website, industry
**Step 2: Positioning** — Value proposition, main challenge
**Step 3: Audience** — Target customer, pain points
**Step 4: Voice** — Brand voice description, tone attributes
**Step 5: Complete** — Confirmation and start using

---

## 8. Technical Architecture

### 8.1 Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), React, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | PostgreSQL (Supabase) |
| Authentication | Supabase Auth |
| AI/LLM | Google Gemini API |
| Payments | Stripe |
| File Storage | Supabase Storage |
| Hosting | Vercel |
| Analytics | Vercel Analytics |

### 8.2 Database Schema (Key Tables)

| Table | Purpose |
|-------|---------|
| `users` | User accounts, profile info |
| `subscriptions` | Tier, usage tracking, Stripe IDs |
| `brands` | Brand profiles per user |
| `personas` | 26 creative personas (read-only) |
| `outputs` | Saved AI-generated content |
| `folders` | Organization for outputs |
| `tags` | User-defined tags |
| `integrations` | Connected platforms (future) |
| `prompt_history` | All prompt runs for analytics |

### 8.3 System Prompt Architecture

```
1. Persona prompt (if selected)
   "You are David Ogilvy, the legendary advertising executive..."

2. Mode instructions
   "EXECUTION MODE: Output actual content that can be copied..."

3. Brand context
   "BRAND CONTEXT:
    Brand: Acme Inc
    Industry: B2B SaaS
    Target Audience: Marketing managers at mid-size companies
    Brand Voice: Professional but approachable..."

4. User's selected prompt
   "Write a LinkedIn post announcing our new feature..."
```

### 8.4 Security Requirements

- [x] API keys server-side only
- [x] Origin checking on API routes
- [x] Row Level Security on all tables
- [ ] Rate limiting on auth endpoints
- [ ] Input sanitization
- [ ] Token encryption at rest (integrations)

### 8.5 Performance Targets

| Metric | Target |
|--------|--------|
| Time to First Byte | < 200ms |
| Prompt generation | < 10s |
| Page transitions | < 100ms |
| Lighthouse score | > 90 |

---

## 9. Business Model

### 9.1 Pricing Tiers

| Feature | Free | Premium ($29/mo) | Team ($99/mo) |
|---------|------|------------------|---------------|
| Disciplines | 3 | 9 | 9 |
| Prompts/month | 10 | Unlimited | Unlimited |
| Creative Personas | 2 | All 26 | All 26 |
| Strategy Mode | Yes | Yes | Yes |
| Execution Mode | No | Yes | Yes |
| Saved Outputs | 5 | Unlimited | Unlimited |
| Brand Contexts | 1 | 5 | 20 |
| Publishing Integrations | No | Yes | Yes |
| Team Members | 1 | 1 | 5 |
| Priority Support | No | Yes | Yes |

### 9.2 Pricing Rationale

- **Above ChatGPT ($20):** More specialized value
- **Below Jasper ($49+):** Accessible to bootstrappers
- **Monthly ROI:** One good campaign idea = 10x the cost
- **Psychological:** Under $30 feels "try-able"

### 9.3 Revenue Targets (First 30 Days)

| Metric | Target |
|--------|--------|
| Signups | 500 |
| Active users (1+ prompt) | 250 (50%) |
| Power users (5+ prompts) | 100 (20%) |
| Paid conversions | 25 (5%) |
| MRR | $725 (25 x $29) |

### 9.4 Future Pricing Considerations

- **Annual discount:** 2 months free ($290/year)
- **Startup discount:** 50% off for <10 employees
- **Agency tier:** $299/mo for white-label, unlimited brands

---

## 10. Success Metrics

### 10.1 North Star Metric
**Monthly Active Users (MAU)** generating and publishing content

### 10.2 Key Performance Indicators (KPIs)

| Category | Metric | Target |
|----------|--------|--------|
| Acquisition | Weekly signups | 100+ |
| Activation | % running 1+ prompt | 50% |
| Engagement | Prompts per user/month | 20+ |
| Retention | 30-day retention | 40% |
| Revenue | Free-to-paid conversion | 5% |
| Revenue | Monthly Recurring Revenue | $5K (6 months) |
| Satisfaction | Net Promoter Score | 50+ |

### 10.3 Analytics Events to Track

| Event | When |
|-------|------|
| `signup_started` | User begins signup |
| `signup_completed` | Account created |
| `onboarding_completed` | Brand profile finished |
| `prompt_run` | User generates output |
| `persona_selected` | User applies persona remix |
| `output_saved` | User saves to library |
| `limit_reached` | User hits free tier limit |
| `upgrade_started` | User clicks upgrade |
| `upgrade_completed` | Payment successful |

---

## 11. Competitive Analysis

### 11.1 Competitive Landscape

```
                    STRATEGIC THINKING
                           ^
                           |
        Consultants/       |        <- AMPLIFY
        Agencies           |           (Strategic AI +
        ($$$$$)            |            Expert Personas)
                           |
    -------------------+--------------------> AI-POWERED
                           |
        DIY Marketing      |        Jasper, Copy.ai
        (Free but slow)    |        (Fast but shallow)
                           |
                           v
                    TACTICAL EXECUTION
```

### 11.2 Competitive Comparison

#### vs. ChatGPT
| Dimension | ChatGPT | Amplify | Winner |
|-----------|---------|---------|--------|
| Raw AI capability | 5/5 | 4/5 | ChatGPT |
| Marketing expertise | 2/5 | 5/5 | **Amplify** |
| Brand consistency | 1/5 | 5/5 | **Amplify** |
| Persona variety | 1/5 | 5/5 | **Amplify** |
| Learning experience | 2/5 | 5/5 | **Amplify** |
| Price | $20/mo | $29/mo | ChatGPT |

#### vs. Jasper
| Dimension | Jasper | Amplify | Winner |
|-----------|--------|---------|--------|
| Template variety | 5/5 | 4/5 | Jasper |
| Strategic depth | 2/5 | 5/5 | **Amplify** |
| Persona/voice options | 2/5 | 5/5 | **Amplify** |
| Ease of use | 3/5 | 5/5 | **Amplify** |
| Price | $49+/mo | $29/mo | **Amplify** |

### 11.3 What We Build vs. Don't Build

**BUILD (Differentiating):**
- Creative Personas (26)
- Strategy + Execution modes
- Brand Profile
- Learning component
- Remix feature

**DON'T BUILD (Commoditized):**
- Social publishing → Buffer/Hootsuite
- Image generation → Canva/Midjourney
- SEO analysis → Ahrefs/Semrush
- Email sending → Mailchimp/Klaviyo

---

## 12. Roadmap & Milestones

### 12.1 Sprint Timeline

| Sprint | Duration | Focus | Milestone |
|--------|----------|-------|-----------|
| Sprint 1 | Week 1 | Brand Profile Enhancement | Complete brand fields |
| Sprint 2 | Week 2 | Usage Tracking & Limits | Free tier limits working |
| Sprint 3 | Week 3 | Stripe Integration | Payments live |
| Sprint 4 | Week 4 | Library Search & Polish | Search + mobile fixes |
| Sprint 5 | Week 5 | Launch Preparation | Marketing page, SEO |
| Sprint 6 | Week 6 | Launch & Iterate | Public launch |

### 12.2 Phase Timeline (Post-MVP)

| Phase | Sprints | Duration | Deliverable |
|-------|---------|----------|-------------|
| Phase 2 | 7-8 | 4 weeks | Enhanced Library (folders, tags) |
| Phase 3 | 9-10 | 4 weeks | Multiple Brand Profiles |
| Phase 4 | 11-12 | 4 weeks | LinkedIn + Twitter Publishing |
| Phase 5 | 13-14 | 4 weeks | Analytics Dashboard |
| Phase 6 | 15-16 | 4 weeks | Team Features |

**Total Post-MVP Timeline:** ~6 months

### 12.3 MVP Definition of Done

MVP is **done** when:

1. A new user can sign up with email
2. They can set up their brand profile (with target audience + voice)
3. They can run prompts and see outputs
4. They can remix through personas
5. They can save and view library items
6. They hit the 10-prompt limit
7. They can upgrade to Premium via Stripe
8. Premium unlocks unlimited prompts
9. All the above works on mobile
10. No critical bugs in core flow

---

## 13. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Stripe webhook issues | Medium | High | Test thoroughly in Stripe test mode |
| Mobile responsiveness gaps | High | Medium | Dedicate Sprint 4 to mobile |
| Low conversion rate | Medium | High | A/B test pricing and upgrade prompts |
| API rate limits | Low | High | Implement queuing and caching |
| Scope creep | High | Medium | Stick to MVP definition strictly |
| Persona quality inconsistent | Medium | Medium | Extensive prompt testing per persona |
| Competition copies features | Medium | Low | Speed to market, community building |

---

## 14. Open Questions

1. **Custom personas:** Should we allow users to create their own personas?
2. **Watermarking:** Should free users see a watermark on outputs?
3. **Compliance:** Do we need GDPR/CCPA compliance from day 1?
4. **Mobile app:** Is mobile web sufficient, or do we need a native app?
5. **API access:** Should we offer an API for power users/agencies?
6. **White-label:** Is there demand for agencies to white-label Amplify?

---

## 15. Appendices

### Appendix A: 9 Marketing Disciplines

| Discipline | Prompts | Focus Areas |
|------------|---------|-------------|
| SEO | 10 | Technical SEO, content optimization, link building |
| Paid Media | 10 | Ad creative, audience strategy, measurement |
| Lifecycle | 10 | Email flows, retention, automation |
| Content | 10 | Strategy, distribution, repurposing |
| CRO | 10 | Testing, friction audits, optimization |
| LinkedIn | 10 | Posts, carousels, engagement |
| Blog | 10 | Long-form content, SEO articles |
| Email | 10 | Campaigns, sequences, newsletters |
| Social | 10 | Twitter, Instagram, TikTok |

### Appendix B: 26 Creative Personas

**Pure Creatives (10):**
Bill Bernbach, Dan Wieden, Lee Clow, George Lois, Howard Gossage, Jay Chiat, Paula Scher, Alex Bogusky, John Hegarty, Graham Fink

**Pure Strategists (9):**
Byron Sharp, Michael Porter, Clayton Christensen, Les Binet, Peter Field, Mark Ritson, Paul Feldwick, Stanley Pollitt, Rosser Reeves

**Hybrids (7):**
David Ogilvy, Leo Burnett, Mary Wells Lawrence, Rory Sutherland, Helen Lansdowne Resor, Shirley Polykoff, David Abbott

### Appendix C: Business Rules Summary

| Area | Free Tier | Premium Tier |
|------|-----------|--------------|
| Monthly prompts | 10 | Unlimited |
| Disciplines | 3 | All 9 |
| Personas | 2 | All 26 |
| Saved outputs | 5 | Unlimited |
| Brand profiles | 1 | 5 |
| Output modes | Strategy only | Both |
| History retention | 7 days | 90 days |
| Max folders | 50 | 200 |
| Max tags | 20 | 100 |

### Appendix D: Glossary

| Term | Definition |
|------|------------|
| **Prompt** | A pre-written template that generates marketing content |
| **Persona** | An AI persona modeled after a legendary marketer |
| **Remix** | Regenerating output through a different persona's lens |
| **Strategy Mode** | Output mode focused on frameworks and planning |
| **Execution Mode** | Output mode focused on ready-to-use content |
| **Brand Profile** | User's stored brand context for personalization |
| **Output** | AI-generated content from running a prompt |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2025 | Product Team | Initial PRD compilation |

---

*This PRD is a living document and will be updated as the product evolves.*

**Built with care by [Fabrica Collective](https://fabricacollective.com)**

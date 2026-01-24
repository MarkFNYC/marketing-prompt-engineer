# MVP Definition

## Overview
This document defines the Minimum Viable Product for Amplify — the smallest version we can launch to validate the core value proposition and start generating revenue.

---

## Core Value Proposition
**"The marketing team you can't afford to hire."**

Amplify gives solopreneurs and small teams access to strategic thinking from legendary marketing minds — not just AI-generated content, but expert-level approaches to marketing problems.

---

## MVP Success Criteria

### Launch Readiness Checklist
- [ ] User can sign up, log in, and reset password
- [ ] User can define their brand context (saved to account)
- [ ] User can browse 90 prompts across 9 disciplines
- [ ] User can generate content in Strategy or Execution mode
- [ ] User can remix output through creative personas (26 available)
- [ ] User can save outputs to personal library
- [ ] User can view, search, and delete saved outputs
- [ ] Usage tracking enforces free tier limits (10 prompts/month)
- [ ] Upgrade path to Premium exists (Stripe integration)
- [ ] Production deployment on Vercel with custom domain

### Success Metrics (First 30 Days)
| Metric | Target |
|--------|--------|
| Signups | 500 |
| Active users (ran 1+ prompt) | 250 (50%) |
| Power users (ran 5+ prompts) | 100 (20%) |
| Paid conversions | 25 (5% of signups) |
| MRR | $725 (25 × $29) |

---

## What's IN the MVP

### Authentication (P0)
| Feature | Status |
|---------|--------|
| Email/password signup | ✅ Built |
| Email verification | ✅ Built |
| Password reset | ✅ Built |
| Login persistence | ✅ Built |
| Google OAuth | ❌ Cut from MVP |

### Brand Profile (P0)
| Feature | Status |
|---------|--------|
| Single brand context per user | ✅ Built |
| Brand name, website, industry | ✅ Built |
| Challenge/goal field | ✅ Built |
| Target audience | 🔲 Add to MVP |
| Brand voice description | 🔲 Add to MVP |
| Multiple brands | ❌ Premium feature |

### Prompt Library (P0)
| Feature | Status |
|---------|--------|
| 9 disciplines | ✅ Built |
| 90 prompts (10 per discipline) | ✅ Built |
| Strategy mode | ✅ Built |
| Execution mode | ✅ Built |
| Prompt search/filter | ❌ Post-MVP |

### Creative Personas (P0)
| Feature | Status |
|---------|--------|
| 26 personas available | ✅ Built |
| Persona selection on remix | ✅ Built |
| Persona bio/philosophy display | 🔲 Enhance |
| Favorite personas | ❌ Post-MVP |

### Content Library (P0)
| Feature | Status |
|---------|--------|
| Save output with one click | ✅ Built |
| View saved outputs | ✅ Built |
| Delete saved outputs | ✅ Built |
| Copy output to clipboard | ✅ Built |
| Search library | 🔲 Add to MVP |
| Folders/tags | ❌ Post-MVP |

### Usage & Billing (P0)
| Feature | Status |
|---------|--------|
| Track prompts used | ✅ Built |
| Display usage (X/10 used) | 🔲 Add to MVP |
| Block at limit with upgrade prompt | 🔲 Add to MVP |
| Stripe checkout for Premium | 🔲 Add to MVP |
| Manage subscription | ❌ Post-MVP |

---

## What's OUT of MVP (Post-Launch)

### Phase 2: Enhanced Library
- Folders and nested organization
- Tags and cross-folder filtering
- Export to Markdown/PDF
- Prompt history (unsaved outputs)

### Phase 3: Brand Profile Pro
- Multiple brand profiles (Premium)
- Brand colors, fonts, visual identity
- Logo upload
- Team-shared brands

### Phase 4: Publishing Integrations
- LinkedIn OAuth + direct publish
- Twitter/X posting
- Scheduling posts
- Email platform integrations

### Phase 5: Analytics
- Usage dashboard
- Performance tracking (if published)
- AI-powered insights

### Phase 6: Teams
- Team workspaces
- Shared libraries
- Role-based permissions

---

## MVP User Journey

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

---

## MVP Tech Requirements

### Must Work
- [x] Next.js 14 App Router
- [x] Supabase Auth (email/password)
- [x] Supabase Database (PostgreSQL)
- [x] Google Gemini API for generation
- [x] Vercel deployment
- [x] Vercel Analytics
- [ ] Stripe Checkout (payment links acceptable for MVP)

### Performance Targets
| Metric | Target |
|--------|--------|
| Time to First Byte | < 200ms |
| Prompt generation | < 10s |
| Page transitions | < 100ms |
| Lighthouse score | > 90 |

### Security Requirements
- [x] API keys server-side only
- [x] Origin checking on API routes
- [x] Row Level Security on all tables
- [ ] Rate limiting on auth endpoints
- [ ] Input sanitization

---

## MVP Timeline

### Week 1: Foundation
- [ ] Complete brand profile fields (target audience, voice)
- [ ] Add usage display in header
- [ ] Add limit enforcement with upgrade modal

### Week 2: Monetization
- [ ] Stripe product/price setup
- [ ] Checkout flow (can use Stripe payment links)
- [ ] Webhook for subscription activation
- [ ] Premium tier unlocks unlimited prompts

### Week 3: Polish
- [ ] Library search functionality
- [ ] Persona detail improvements
- [ ] Error handling and edge cases
- [ ] Mobile responsiveness audit

### Week 4: Launch Prep
- [ ] Marketing page copy
- [ ] SEO optimization
- [ ] Analytics event tracking
- [ ] Soft launch to beta users
- [ ] Collect feedback, fix critical bugs

---

## Cut List (If Behind Schedule)

If we need to ship faster, cut in this order:

1. **Library search** — Users can scroll for now
2. **Persona detail modal** — Keep simple cards
3. **Usage display in header** — Show on limit hit only
4. **Brand voice field** — Add post-launch
5. **Email verification requirement** — Allow unverified for 7 days

**Never cut:**
- Authentication
- Brand context (basic)
- Prompt generation
- Save to library
- Stripe checkout

---

## Definition of Done

MVP is **done** when:

1. A new user can sign up with email
2. They can set up their brand profile
3. They can run prompts and see outputs
4. They can remix through personas
5. They can save and view library items
6. They hit the 10-prompt limit
7. They can upgrade to Premium via Stripe
8. Premium unlocks unlimited prompts
9. All the above works on mobile
10. No critical bugs in core flow

---

*Last Updated: January 2025*

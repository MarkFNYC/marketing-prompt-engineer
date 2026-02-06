# Amplify MarketingOS — Security & Compliance Audit
**Date:** 2026-02-06
**Scope:** Full application security, data protection, and CCPA compliance

---

## Executive Summary

The application has solid foundational architecture — Supabase auth with bearer tokens, user-scoped queries, Stripe webhook signature verification, and Turnstile bot protection. However, there are **critical gaps** that must be addressed before promoting the site to a wider audience, particularly around CCPA compliance and a few security hardening items.

**Findings:** 5 Critical | 6 High | 8 Medium | 3 Low

---

## CRITICAL — Fix Before Promoting

### 1. No Account Deletion Endpoint (CCPA Violation)
**CCPA §1798.105 — Right to Delete**

Users have no way to delete their account or personal data. This is a legal requirement under CCPA.

**What's needed:**
- `POST /api/user/delete` — verifies identity, cancels Stripe subscription, cascade-deletes all user data (campaigns, projects, saved_content, strategy_checks, profile), then deletes auth user
- UI: "Delete Account" button in account settings with confirmation flow
- Note: campaigns currently use soft delete (`archived_at`) — true deletion needed for compliance

### 2. No Data Export Endpoint (CCPA Violation)
**CCPA §1798.100(d) — Right to Know / Access**

Users cannot download their personal data in a portable format.

**What's needed:**
- `GET /api/user/export` — returns JSON of all user data (profile, projects, campaigns, saved content, strategy checks, usage stats)
- UI: "Download My Data" button

### 3. No Privacy Policy or Terms of Service
No legal pages exist in the codebase. These are required before collecting any user data.

**Privacy Policy must disclose:**
- Data collected: email, passwords, brand/project details, campaign briefs, AI prompts, saved outputs, usage metrics, billing info
- Third-party data sharing: Google Gemini (receives all prompts + brand context), Stripe, Google Analytics, Vercel Analytics, Cloudflare Turnstile
- CCPA rights: right to know, delete, opt-out
- Data retention periods
- Contact information for privacy requests

**Terms of Service must cover:**
- Service description and AI content disclaimers
- Tiered usage limits (10 anonymous / 25 free / unlimited premium)
- Payment terms via Stripe
- IP ownership of AI-generated content (subject to Google/OpenAI/Anthropic terms)
- Limitation of liability, termination, governing law

### 4. No Cookie Consent Banner
Google Analytics (`G-CF80X5DDSG`) and Vercel Analytics load unconditionally in `layout.tsx`. Under CCPA, users need notice at collection and the ability to opt out.

**What's needed:**
- Cookie consent banner that loads before analytics scripts
- Defer GA/Vercel Analytics until consent given
- "Do Not Sell My Personal Information" link (CCPA §1798.120)

### 5. Undisclosed AI Data Sharing
All prompts, brand context, campaign strategies, and business details are sent to Google Gemini API for processing. Users are not informed of this. Under CCPA this constitutes "sharing" of personal information and requires disclosure + opt-out.

**What's needed:**
- Disclosure during signup or first use
- Privacy Policy section explaining AI data flows
- Consider offering users their own API key as an alternative (partially exists for OpenAI/Anthropic)

---

## HIGH — Fix Within 1–2 Weeks

### 6. No Rate Limiting on Any Endpoint
Every API route — including expensive AI generation endpoints (`/api/generate`, `/api/creative-ideas`, `/api/remix`, `/api/planning-review`) — can be called unlimited times. An attacker could exhaust your Gemini API quota and run up costs.

**Recommendation:** Add rate-limiting middleware. Suggested limits:
- Unauthenticated: 5 req/min (IP-based)
- Free tier: 10 req/min
- Premium: 50 req/min

### 7. Turnstile Fails Open
`src/app/api/auth/signup/route.ts` — if `TURNSTILE_SECRET_KEY` is not set, `verifyTurnstile()` returns `true` and skips verification entirely. Should fail closed.

```typescript
// Current (insecure):
if (!secretKey) { return true; }

// Should be:
if (!secretKey) { return false; } // Or return 500 error
```

### 8. AI Routes Allow Unauthenticated Access
`/api/generate`, `/api/creative-ideas`, `/api/remix`, `/api/planning-review`, `/api/briefs/parse` only check origin/referer headers — not authentication. Origin headers are trivially spoofable.

**Recommendation:** Require bearer token auth on all AI generation endpoints, or at minimum implement proper rate limiting by IP.

### 9. No CSRF Protection
No CSRF tokens on any POST endpoint. The origin/referer checks on generation routes are insufficient.

**Recommendation:** Implement CSRF tokens or use `SameSite=Strict` cookies for session management.

### 10. Incomplete Row Level Security (RLS)
- `campaigns` table: RLS enabled with user-scoped policy ✓
- `strategy_checks` table: RLS enabled but missing UPDATE/DELETE policies
- `profiles`, `projects`, `saved_content` tables: **No RLS policies visible in migrations**

The API layer enforces `eq('user_id', userId)` on all queries, which is good, but defense-in-depth requires database-level RLS too. All API routes use `getSupabaseAdmin()` (service role key), which bypasses RLS entirely.

**Recommendation:** Enable RLS on all user-data tables and add policies. Even with admin client usage, this protects against accidental code bugs.

### 11. Exposed Error Details in Production
All API routes return `error.message` directly to clients. In production this could leak internal details (database URLs, stack traces, etc.).

**Recommendation:** Return generic error messages in production; log full details server-side.

---

## MEDIUM

### 12. Hardcoded Origins in Multiple Files
Allowed origins list (`amplify.fabricacollective.com`, `localhost:3000`, `marketing-prompter.vercel.app`) is duplicated across `generate/route.ts`, `planning-review/route.ts`, and `remix/route.ts`. Should be centralized and environment-driven.

### 13. No Field-Level Encryption for Stripe IDs
`stripe_customer_id` and `stripe_subscription_id` stored as plain VARCHAR. Consider encrypting at the application level.

### 14. Password Reset Allows Account Enumeration
`/api/auth/reset-password` returns different responses for existing vs non-existing emails. Should return a generic "If an account exists, a reset link has been sent" message.

### 15. No MFA Option
No multi-factor authentication available, especially for premium/billing users.

### 16. Prompt Injection Vulnerability
User input is concatenated directly into LLM prompts in `/api/generate` (line ~224: `${systemPrompt}\n\n---\n\nUser request:\n${prompt}`). Malicious users could attempt to override system instructions.

### 17. User API Keys Transmitted in Plaintext
When users provide their own OpenAI/Anthropic keys, these are sent in the request body as plaintext. If logs capture request bodies, keys are exposed.

### 18. Indefinite Data Retention
No data retention schedule. Archived campaigns (`archived_at`) are never truly deleted. Define retention periods (e.g., 3 years inactive → purge).

### 19. Missing `.env.example`
No documentation of required environment variables. Create a `.env.example` with placeholder values.

---

## LOW

### 20. GA Measurement ID Hardcoded
`G-CF80X5DDSG` is hardcoded in `layout.tsx`. Move to environment variable.

### 21. Turnstile Site Key Hardcoded
`0x4AAAAAACYSY9iyDUHa3N6Y` hardcoded in `page.tsx`. Move to `NEXT_PUBLIC_` env var.

### 22. No Input Schema Validation
No Zod/Joi validation on request bodies. Supabase parameterizes queries (safe from SQL injection), but malformed inputs could cause unexpected behavior.

---

## CCPA Compliance Checklist

| Requirement | Status | Action Needed |
|---|---|---|
| Right to Know (data access/export) | **Missing** | Build `/api/user/export` endpoint |
| Right to Delete | **Missing** | Build `/api/user/delete` endpoint |
| Right to Opt-Out of Sale/Sharing | **Missing** | Add "Do Not Sell" link + opt-out for Gemini/analytics |
| Notice at Collection | **Missing** | Privacy Policy + cookie banner |
| Non-Discrimination | **OK** | No discrimination mechanisms found |
| Data Minimization | **Partial** | Campaigns collect extensive business data; consider retention limits |
| Privacy Policy | **Missing** | Create `/privacy` page |
| Service Provider Agreements | **Unknown** | Verify DPAs with Google, Stripe, Supabase, Cloudflare, Vercel |

---

## Third-Party Data Flow Summary

| Service | Data Sent | Purpose | Disclosed? |
|---|---|---|---|
| Google Gemini | All prompts, brand context, campaign details | AI content generation | No |
| Google Analytics | Page views, events, user behavior | Analytics | No |
| Vercel Analytics | Page views, performance | Analytics | No |
| Stripe | Email, billing info, subscription data | Payments | No |
| Cloudflare Turnstile | CAPTCHA token | Bot prevention | No |
| Supabase | All user data | Database & auth | No |

---

## Recommended Action Plan

### This Week (Before Promoting)
1. Create Privacy Policy page (`/privacy`)
2. Create Terms of Service page (`/terms`)
3. Add cookie consent banner — defer GA until consent
4. Add footer links to privacy/terms
5. Add "I agree to Terms" checkbox on signup

### Next 2 Weeks
6. Build account deletion endpoint + UI
7. Build data export endpoint + UI
8. Add rate limiting to all API routes
9. Fix Turnstile fail-open → fail-closed
10. Add RLS policies to all user-data tables
11. Sanitize error responses for production

### Within 1 Month
12. Add "Do Not Sell My Personal Information" link
13. Add privacy settings page (analytics opt-out)
14. Centralize origin allowlist
15. Add CSRF protection
16. Require auth on AI generation routes
17. Define and implement data retention policy

---

## Environment Variables Required

For reference, the application needs these configured in production:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI
GEMINI_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_MONTHLY=
STRIPE_PRICE_ID_YEARLY=

# Security
TURNSTILE_SECRET_KEY=

# Analytics (should move from hardcoded)
# GA_MEASUREMENT_ID=
# NEXT_PUBLIC_TURNSTILE_SITE_KEY=
```

**Important:** Rotate any secrets that have been committed to git history. Run `git log -p -- .env*` to check.

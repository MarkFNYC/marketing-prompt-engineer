# Amplify — Backlog

Prioritized list of work items, grouped by urgency. See `ROADMAP.md` for feature-level planning and `SECURITY_AUDIT_2026-02-06.md` for full audit details.

*Last updated: 2026-02-06*

---

## Completed

- [x] Privacy Policy page (`/privacy`) — CCPA-compliant, 12 sections
- [x] Terms of Service page (`/terms`) — 12 sections, California jurisdiction
- [x] Cookie consent banner — defers GA until user accepts
- [x] Footer links to Privacy/Terms on landing page
- [x] "I agree to Terms" checkbox on signup form
- [x] Security audit and compliance assessment

---

## P0 — Critical (next 1–2 weeks)

### Account Deletion Endpoint
Users must be able to delete their account and all associated data (CCPA Right to Delete).
- [x] Create `POST /api/user/delete` endpoint
- [x] Verify user identity (email confirmation or password)
- [x] Cancel Stripe subscription if active
- [x] Cascade delete: campaigns, projects, saved_content, strategy_checks, profile
- [x] Delete Supabase auth user
- [x] Add "Delete Account" button in UI with confirmation dialog
- [x] Log deletion for compliance audit trail

### Data Export Endpoint
Users must be able to download their personal data (CCPA Right to Know).
- [x] Create `GET /api/user/export` endpoint
- [x] Return JSON of all user data (profile, projects, campaigns, saved content, strategy checks, usage stats)
- [x] Add "Download My Data" button in UI

### Rate Limiting
All API routes are currently unlimited — risk of cost abuse on AI generation endpoints.
- [x] Add rate-limiting middleware (e.g. `next-rate-limit` or custom)
- [x] Unauthenticated: 5 req/min (IP-based)
- [x] Free tier: 10 req/min
- [x] Premium: 50 req/min
- [x] Apply to all `/api/generate`, `/api/creative-ideas`, `/api/remix`, `/api/planning-review`, `/api/briefs/parse` routes

### Turnstile Fail-Closed Fix
Signup bot protection currently skips verification if `TURNSTILE_SECRET_KEY` is missing.
- [x] Change `verifyTurnstile()` in `/api/auth/signup` to return `false` (not `true`) when secret key is missing
- [x] Return 500 error to client instead of silently passing

---

## P1 — High (next 2–4 weeks)

### Row Level Security (RLS) Hardening
Database-level security is incomplete — only `campaigns` and `strategy_checks` have RLS.
- [x] Verify/enable RLS on `profiles` table
- [x] Verify/enable RLS on `projects` table
- [x] Verify/enable RLS on `saved_content` table
- [x] Add UPDATE/DELETE policies to `strategy_checks` table
- [ ] Test: confirm user A cannot access user B's data at the database level

### Require Auth on AI Generation Routes
AI endpoints only check origin/referer headers — easily spoofed.
- [x] Add bearer token auth to `/api/generate`
- [x] Add bearer token auth to `/api/creative-ideas`
- [x] Add bearer token auth to `/api/remix`
- [x] Add bearer token auth to `/api/planning-review`
- [x] Add bearer token auth to `/api/briefs/parse`
- [x] Preserve anonymous usage tracking via IP/session for free-tier users

### Sanitize Error Responses
API routes leak `error.message` details in production.
- [x] Create error sanitization helper
- [x] Return generic messages in production, log full details server-side
- [x] Apply to all API routes

### CSRF Protection
No CSRF tokens on any POST endpoint.
- [x] Implement origin validation via shared csrf.ts helper
- [x] Apply to all state-changing endpoints (auth, stripe, library, projects, campaigns)

### "Do Not Sell" Link
CCPA requires a visible opt-out link.
- [x] Add "Do Not Sell My Info" link to footer
- [x] Link to privacy policy CCPA section

---

## P2 — Medium (next 1–2 months)

### Privacy Settings Page
- [ ] Create `/settings/privacy` or in-app privacy settings section
- [ ] Analytics opt-out toggle (revoke cookie consent)
- [ ] Email preferences (marketing, account notifications)
- [ ] Link to data export and account deletion

### Password Reset Hardening
- [x] Return generic response regardless of email existence (prevent account enumeration)
- [x] Add rate limiting to reset-password endpoint
- [x] Add Turnstile verification to reset-password form

### Centralize Origin Allowlist
Allowed origins are hardcoded in 3+ route files.
- [x] Move to shared config or environment variable
- [x] Import from single source in all routes

### Input Validation
No schema validation on request bodies.
- [x] Add Zod schemas for all API route inputs
- [x] Validate UUIDs, enums, string lengths

### Data Retention Policy
No automated cleanup of old data.
- [ ] Define retention periods (e.g. 3 years inactive → purge)
- [ ] Implement automated cleanup for archived campaigns
- [ ] Document retention schedule in privacy policy

### Environment Variable Housekeeping
- [x] Create `.env.example` with all required variables documented
- [x] Move hardcoded GA measurement ID to env var
- [x] Move hardcoded Turnstile site key to `NEXT_PUBLIC_` env var

---

## P3 — Low / Nice-to-Have

- [ ] Add MFA option for premium/billing users
- [ ] Field-level encryption for Stripe customer/subscription IDs
- [ ] Prompt injection mitigation (structured input instead of string concatenation)
- [ ] Encrypt user-provided API keys in transit/storage
- [x] Security headers (CSP, X-Frame-Options) via `next.config.js`
- [ ] Webhook idempotency and failure alerting for Stripe
- [x] Audit logging for sensitive operations (account changes, data access)

---

## Notes

- P0 items are legal/compliance requirements under CCPA — should be done before significant user acquisition
- P1 items are security hardening — important but not legally blocking
- See `SECURITY_AUDIT_2026-02-06.md` for full details on each finding
- See `ROADMAP.md` for product feature planning (Creative Remix, Brand Guidelines, Asset Builder)

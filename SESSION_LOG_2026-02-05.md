# Session Log (2026-02-04 / 2026-02-05)

## Summary
- Integrated Stripe for premium subscriptions with checkout, webhook, and billing portal routes.
- Introduced tiered free prompt limits: 10 (anonymous) → 25 (signed-in) → unlimited (premium).
- Added a pricing tiers section to the landing page.
- Added Google Analytics tracking via `next/script`.
- Added Cloudflare Turnstile CAPTCHA to the signup form for spam protection.

## Files Added
- src/app/api/stripe/checkout/route.ts
- src/app/api/stripe/portal/route.ts
- src/app/api/stripe/webhook/route.ts
- src/lib/stripe.ts
- supabase/migrations/20250204_add_stripe_columns.sql

## Files Updated
- src/app/page.tsx
- src/app/layout.tsx
- src/app/api/auth/signup/route.ts
- src/app/api/usage/route.ts
- package.json
- package-lock.json

## Key Changes (Details)

### Stripe Integration (Feb 4)
- Added `src/lib/stripe.ts` with a lazy-loaded Stripe client and price ID helpers.
- **Checkout** (`/api/stripe/checkout`): Creates a Stripe Checkout session for authenticated users; creates a Stripe customer if one doesn't exist and saves the ID to the `profiles` table.
- **Webhook** (`/api/stripe/webhook`): Handles `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, and `invoice.payment_failed` events; upgrades/downgrades the user tier accordingly.
- **Billing Portal** (`/api/stripe/portal`): Redirects authenticated users to the Stripe Customer Portal for subscription management.
- **Database migration**: Added `stripe_customer_id` and `stripe_subscription_id` columns to `profiles`, with an index on `stripe_customer_id`.
- Fixed Stripe API version (`2025-01-27.acacia`) to match the installed `stripe` package.

### Tiered Free Prompt Limits (Feb 4)
- Replaced the single `FREE_PROMPT_LIMIT` (15) with `ANONYMOUS_PROMPT_LIMIT` (10) and `SIGNED_IN_PROMPT_LIMIT` (25).
- Limit modal now shows a "Sign Up Free" option for anonymous users (offering +15 prompts) alongside the Premium upgrade.
- Premium upgrade button now triggers a real Stripe Checkout flow instead of a placeholder alert.
- Added `checkoutLoading` state and handles `?upgrade=success|cancelled` URL params on return from Stripe.

### Pricing Section on Landing Page (Feb 4)
- Added a "THE DEAL" pricing tiers section to the landing page, showing free vs premium feature comparison.

### Header Usage Meter Visibility (Feb 4)
- Usage meter bar border changed from `#333` to `#555` for better contrast.
- Counter text changed from `#888` to white for normal usage levels.

### Google Analytics (Feb 5)
- Added GA4 tracking (`G-CF80X5DDSG`) to `src/app/layout.tsx` using `next/script` with `afterInteractive` strategy.

### Cloudflare Turnstile Spam Protection (Feb 5)
- **Server** (`/api/auth/signup`): Added `verifyTurnstile()` helper that validates the token against Cloudflare's siteverify endpoint. Rejects signup if Turnstile is configured but token is missing or invalid. Gracefully skips verification if `TURNSTILE_SECRET_KEY` is not set.
- **Client** (`AuthModal` in `page.tsx`): Loads the Turnstile script dynamically when the signup modal opens. Renders the widget with dark theme. Submit button is disabled until the token is captured. Token is passed to the signup API.
- Site key: `0x4AAAAAACYSY9iyDUHa3N6Y`.

## Notes
- Stripe requires `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_MONTHLY`, and `STRIPE_PRICE_ID_YEARLY` environment variables.
- Turnstile requires `TURNSTILE_SECRET_KEY` server-side and uses a hardcoded site key client-side.
- GA measurement ID is hardcoded in `layout.tsx`.

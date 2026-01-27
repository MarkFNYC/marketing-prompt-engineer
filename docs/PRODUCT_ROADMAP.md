# Amplify — Product Roadmap

## Vision
Amplify is a **virtual agency room** where marketers access the strategic thinking process of real agencies (DDB, Grey, McCann). Unlike other AI tools that start with "what channel?", Amplify starts with "what's the real problem?"—capturing the Planning → Creative → Media workflow that makes great marketing.

## Strategic Differentiator
> "Every other AI tool is a content generator. Amplify is a strategic thinking partner."

---

## Phase 0: Agency Model Foundation ✅ COMPLETE

### Epic: Strategic Thread & Planning Review

**Overview**: Establish the core agency operating model with Planning and Creative roles, strategic threads as the north star object, and Planning Review as the quality gate.

**Status:** ✅ Complete (January 2026)

#### What's Built ✅
- [x] Brand context system
- [x] Campaign context system (Strategic Thread)
- [x] AI-generated target personas
- [x] **Role-based navigation** — "Talk to Planning" / "Talk to Creative"
- [x] Discovery mode with problem exploration
- [x] **Message Strategy generation** — AI generates 3 strategic options
- [x] **Creative Ideas exploration** — AI generates 3 creative concepts
- [x] **Planning Review checkpoint** — AI assesses brief (1-10 score)
- [x] **Soft gate** — Creative mode triggers Planning Review if not approved
- [x] **Thread state machine** — `draft → in_planning → pending_review → approved → active`
- [x] Upload Brief feature — Parse PDF/Word documents
- [x] Creative Remix with 26 advertising legends
- [x] Collapsible output sections
- [x] Dual save (Original/Remix)
- [x] Warning banner for skipped Planning Review

#### API Endpoints Implemented
- `/api/planning-review` — AI brief assessment
- `/api/campaigns/message-strategy` — Strategy generation (Gemini 2.0 Flash)
- `/api/personas` — Target persona management
- `/api/briefs/parse` — Brief document parsing

#### Documentation
- See [CHANGELOG_AGENCY_MODEL.md](./CHANGELOG_AGENCY_MODEL.md) for full implementation details

---

## Phase 0.5: Agency Model Enhancements (Next Sprint)

### Epic: Refine Agency Workflow

**Overview**: Polish and extend the agency model based on user feedback from Phase 0.

#### Planned Work
- [ ] **Brief Enhancement** — Add deliverables, format, media fields to brief parsing
- [ ] **Smart Routing** — Skip discipline selection when brief specifies deliverable (e.g., "15-second video" → Video discipline)
- [ ] **Thread Summary Sidebar** — Show strategic context persistently during Creative mode
- [ ] **Output Tracking** — Link generated content back to threads for audit trail
- [ ] **Quick Generate Mode** — Allow one-off generations without full thread (with warning)

#### Future Considerations
- [ ] **Media Role** — Add "Talk to Media" for distribution/channel strategy
- [ ] **Budget-based recommendations** — Suggest channels based on budget constraints
- [ ] **Timeline awareness** — Adjust recommendations based on campaign timing

---

## Phase 1: Creative Personas (Sprint 1-2) ✅ COMPLETE
### Epic: AI Personas Based on Marketing Legends

**Overview**: Users can select a "creative lens" that adjusts the tone, approach, and philosophy of AI outputs based on legendary marketers and creatives.

#### User Stories

**1.1 Persona Selection**
- [ ] As a user, I want to select a creative persona before running a prompt, so that the output reflects that legend's style and philosophy.
- [ ] As a user, I want to see a brief bio of each persona, so I understand their approach before selecting.
- [ ] As a user, I want to switch personas on the output page and regenerate, so I can compare different perspectives.

**1.2 Persona Library**
- [ ] As a user, I want to browse all available personas in a gallery view, so I can discover new creative approaches.
- [ ] As a user, I want to see example outputs from each persona, so I can understand the difference in style.
- [ ] As a user, I want to "favorite" personas I use frequently, so they appear first in my selection.

#### Proposed Personas

| Persona | Era | Philosophy | Best For |
|---------|-----|------------|----------|
| **David Ogilvy** | 1960s | Research-driven, long-copy, benefit-focused | Direct response, headlines, body copy |
| **Bill Bernbach** | 1960s | Creative revolution, emotion over logic, simplicity | Brand campaigns, disruptive ideas |
| **Lee Clow** | 1980s-2000s | Bold visuals, cultural relevance, "Think Different" | Brand positioning, big ideas |
| **Steve Jobs** | 1980s-2011 | Simplicity, product-as-hero, reality distortion | Product launches, keynote messaging |
| **Claude Hopkins** | 1920s | Scientific advertising, testing, coupons | Direct response, offers, A/B testing |
| **Mary Wells Lawrence** | 1960s-70s | Bold, colorful, breaking conventions | Rebranding, repositioning |
| **Gary Halbert** | 1970s-2000s | Street-smart copy, urgency, storytelling | Sales letters, email sequences |
| **Eugene Schwartz** | 1960s | Market awareness levels, sophistication stages | Funnel copy, market positioning |
| **Seth Godin** | 2000s+ | Permission marketing, remarkable products, tribes | Content marketing, community building |
| **April Dunford** | 2010s+ | Obviously Awesome positioning, competitive alternatives | Positioning, messaging frameworks |

#### Status: ✅ COMPLETE
- 26 advertising legend personas implemented
- Persona system prompts working
- Creative Remix feature with persona switching
- Stored in localStorage (database migration pending)

---

## Phase 2: Authentication & User Accounts (Sprint 3-4)
### Epic: User Authentication System

**Overview**: Implement secure authentication so users can save their work, access it across devices, and unlock premium features.

#### User Stories

**2.1 Sign Up / Login**
- [ ] As a visitor, I want to sign up with email/password, so I can create an account.
- [ ] As a visitor, I want to sign up with Google OAuth, so I can get started quickly.
- [ ] As a user, I want to log in to access my saved content and settings.
- [ ] As a user, I want to reset my password via email if I forget it.
- [ ] As a user, I want to stay logged in across sessions (remember me).

**2.2 User Profile**
- [ ] As a user, I want to edit my profile (name, company, role), so the AI can better personalize outputs.
- [ ] As a user, I want to save multiple brand contexts, so I can switch between clients/projects.
- [ ] As a user, I want to set a default brand context, so it's pre-filled when I start.

**2.3 Session Management**
- [ ] As a user, I want to see my active sessions and log out of other devices.
- [ ] As an admin, I want users to be automatically logged out after 30 days of inactivity.

#### Technical Requirements
- Auth provider: Supabase Auth, Clerk, or NextAuth.js
- JWT tokens with refresh token rotation
- Email verification flow
- Password requirements: min 8 chars, 1 number, 1 special char

---

## Phase 3: Freemium Model & Payments (Sprint 5-6)
### Epic: Subscription & Billing System

**Overview**: Implement a freemium model where users can access limited features for free, with premium tiers unlocking full functionality.

#### User Stories

**3.1 Free Tier**
- [ ] As a free user, I want to access 3 disciplines (SEO, Content, Social), so I can try the product.
- [ ] As a free user, I want to run up to 10 prompts per month, so I can see the value.
- [ ] As a free user, I want to see what premium features I'm missing, so I'm motivated to upgrade.
- [ ] As a free user, I want to use Strategy mode only, with Execution mode as a premium upsell.

**3.2 Premium Tier ($29/month or $290/year)**
- [ ] As a premium user, I want unlimited access to all 9 disciplines.
- [ ] As a premium user, I want unlimited prompt runs per month.
- [ ] As a premium user, I want access to all creative personas.
- [ ] As a premium user, I want both Strategy and Execution modes.
- [ ] As a premium user, I want to save unlimited outputs to my library.
- [ ] As a premium user, I want to connect publishing integrations.

**3.3 Team Tier ($99/month or $990/year)**
- [ ] As a team admin, I want to invite up to 5 team members.
- [ ] As a team admin, I want to manage shared brand contexts across the team.
- [ ] As a team member, I want to see and collaborate on shared outputs.
- [ ] As a team admin, I want to see usage analytics for my team.

**3.4 Billing & Payments**
- [ ] As a user, I want to subscribe via credit card (Stripe).
- [ ] As a user, I want to manage my subscription (upgrade, downgrade, cancel).
- [ ] As a user, I want to see my billing history and download invoices.
- [ ] As a user, I want to receive email receipts after each payment.

#### Pricing Table

| Feature | Free | Premium ($29/mo) | Team ($99/mo) |
|---------|------|------------------|---------------|
| Disciplines | 3 | 9 | 9 |
| Prompts/month | 10 | Unlimited | Unlimited |
| Creative Personas | 2 | All (10+) | All (10+) |
| Strategy Mode | ✓ | ✓ | ✓ |
| Execution Mode | ✗ | ✓ | ✓ |
| Saved Outputs | 5 | Unlimited | Unlimited |
| Brand Contexts | 1 | 5 | 20 |
| Publishing Integrations | ✗ | ✓ | ✓ |
| Team Members | 1 | 1 | 5 |
| Priority Support | ✗ | ✓ | ✓ |

#### Technical Requirements
- Payment provider: Stripe
- Webhook handling for subscription events
- Usage tracking and enforcement
- Proration for mid-cycle changes

---

## Phase 4: Content Library & Folders (Sprint 7-8)
### Epic: Save, Organize, and Manage Outputs

**Overview**: Users can save generated content to a personal library, organize with folders and tags, and access their history.

#### User Stories

**4.1 Saving Content**
- [ ] As a user, I want to save an AI output with one click, so I can access it later.
- [ ] As a user, I want to name/rename saved outputs, so I can find them easily.
- [ ] As a user, I want to add notes to saved outputs, so I remember context.
- [ ] As a user, I want to see which prompt and persona generated each output.

**4.2 Organization**
- [ ] As a user, I want to create folders to organize my saved content by project/client.
- [ ] As a user, I want to add tags to outputs for cross-folder organization.
- [ ] As a user, I want to move outputs between folders.
- [ ] As a user, I want to search my saved outputs by keyword, tag, or folder.

**4.3 History**
- [ ] As a user, I want to see my recent prompt history (last 50 runs).
- [ ] As a user, I want to re-run a previous prompt with one click.
- [ ] As a user, I want to see outputs I didn't save, in case I want to recover them.

**4.4 Export**
- [ ] As a user, I want to export saved outputs as Markdown, DOCX, or PDF.
- [ ] As a user, I want to export an entire folder as a ZIP file.
- [ ] As a user, I want to copy output with formatting preserved.

#### Technical Requirements
- Database tables: outputs, folders, tags, output_tags
- Full-text search with PostgreSQL or Algolia
- Soft delete with 30-day recovery

---

## Phase 5: Publishing Integrations (Sprint 9-12)
### Epic: Connect & Publish to Marketing Channels

**Overview**: Users can connect their marketing accounts and publish generated content directly, without leaving the app.

#### User Stories

**5.1 LinkedIn Integration**
- [ ] As a user, I want to connect my LinkedIn account via OAuth.
- [ ] As a user, I want to publish a generated post directly to LinkedIn.
- [ ] As a user, I want to schedule a LinkedIn post for a future date/time.
- [ ] As a user, I want to see my recent LinkedIn posts and their performance.

**5.2 Twitter/X Integration**
- [ ] As a user, I want to connect my Twitter/X account via OAuth.
- [ ] As a user, I want to publish a tweet or thread directly.
- [ ] As a user, I want to schedule tweets for optimal times.

**5.3 Google Ads Integration**
- [ ] As a user, I want to connect my Google Ads account.
- [ ] As a user, I want to generate ad copy and push it to a draft campaign.
- [ ] As a user, I want to see my active campaigns and their headlines.

**5.4 Meta Ads Integration**
- [ ] As a user, I want to connect my Meta Business account.
- [ ] As a user, I want to generate ad creative and push to Ads Manager.

**5.5 Email Platform Integrations**
- [ ] As a user, I want to connect Mailchimp, Klaviyo, or ConvertKit.
- [ ] As a user, I want to push generated email copy to a draft campaign.
- [ ] As a user, I want to see my email templates and edit them in-app.

**5.6 CMS Integrations**
- [ ] As a user, I want to connect WordPress via REST API.
- [ ] As a user, I want to push blog content as a draft post.
- [ ] As a user, I want to connect Webflow and push to CMS collections.

#### Integration Priority Matrix

| Integration | Complexity | User Value | Priority |
|-------------|------------|------------|----------|
| LinkedIn | Medium | High | P0 |
| Twitter/X | Low | High | P0 |
| Google Ads | High | High | P1 |
| Mailchimp | Medium | Medium | P1 |
| WordPress | Medium | Medium | P2 |
| Meta Ads | High | Medium | P2 |
| Klaviyo | Medium | Medium | P2 |
| Webflow | Medium | Low | P3 |

#### Technical Requirements
- OAuth 2.0 flows for each platform
- Token refresh and secure storage
- Webhook listeners for post status updates
- Rate limiting and retry logic
- Platform-specific API adapters

---

## Phase 6: Analytics & Insights (Sprint 13-14)
### Epic: Track Performance and Optimize

**Overview**: Help users understand what's working by tracking published content performance and prompt effectiveness.

#### User Stories

**6.1 Content Performance**
- [ ] As a user, I want to see engagement metrics for my published LinkedIn posts.
- [ ] As a user, I want to see open/click rates for published emails.
- [ ] As a user, I want to compare performance across different personas/modes.

**6.2 Usage Analytics**
- [ ] As a user, I want to see how many prompts I've run this month.
- [ ] As a user, I want to see my most-used disciplines and prompts.
- [ ] As a team admin, I want to see team usage and popular prompts.

**6.3 AI Insights**
- [ ] As a user, I want AI-generated insights on what content performed best.
- [ ] As a user, I want recommendations for which persona to use based on my goals.

---

## Technical Architecture Overview

### Recommended Stack
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend**: Next.js API Routes + Supabase
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth or Clerk
- **Payments**: Stripe
- **AI**: OpenAI API + Anthropic API
- **File Storage**: Supabase Storage or S3
- **Hosting**: Vercel
- **Analytics**: PostHog or Mixpanel

### Key Migrations
1. Convert from single HTML file to Next.js project
2. Move state management to React Context + Zustand
3. Implement server-side API routes for AI calls (hide API keys)
4. Set up database for users, outputs, folders, integrations

---

## Sprint Timeline (Updated January 2026)

| Phase | Sprints | Duration | Milestone | Status |
|-------|---------|----------|-----------|--------|
| Phase 0: Agency Model | 0 | 2 weeks | Planning Review + Strategic Threads | ✅ Complete |
| Phase 0.5: Agency Enhancements | — | Ongoing | Brief fields, smart routing | 🔄 Next |
| Phase 1: Personas | 1-2 | 4 weeks | Creative Personas Live | ✅ Complete |
| Phase 1.5: Target Personas | 2 | 1 week | AI-generated audience personas | ✅ Complete |
| Phase 2: Auth | 3-4 | 4 weeks | User Accounts Live | ✅ Complete |
| Phase 3: Payments | 5-6 | 4 weeks | Freemium Launch | 📋 Planned |
| Phase 4: Library | 7-8 | 4 weeks | Content Library Live | 🔄 Partial |
| Phase 5: Integrations | 9-12 | 8 weeks | LinkedIn + Twitter Live | 📋 Planned |
| Phase 6: Analytics | 13-14 | 4 weeks | Analytics Dashboard | 📋 Planned |
| Phase 7: Media Role | 15-16 | 4 weeks | "Talk to Media" + Channel Recs | 📋 Planned |

**Total Estimated Timeline**: 32 weeks (~8 months)

---

## Success Metrics (Updated for Agency Model)

### North Star Metric
- **Strategic Threads Completed** (from Discovery → Approved → Executed)

This captures the full strategic process, not just content generation.

### Supporting Metrics
| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Threads with Planning Review | 80%+ | Shows users value the strategic process |
| Planning → Creative conversion | 60%+ | Strategy leads to execution |
| Brief sanity-check usage | 30%+ of new users | Entry point validation |
| Creative outputs per thread | 5+ | Strategy enables multiple executions |
| Remix usage per execution | 2+ | Users exploring creative perspectives |
| Free-to-Paid conversion rate | 5% | Revenue |
| Net Promoter Score | 50+ | User satisfaction |
| Monthly Recurring Revenue (MRR) | Growth | Business health |

---

## Open Questions

1. ~~Should we allow users to create custom personas?~~ → Yes, target personas implemented
2. Should free users see a watermark on outputs?
3. Do we need GDPR/CCPA compliance from day 1?
4. Should we build a mobile app, or is mobile web sufficient?
5. Do we want an API for power users/agencies?
6. **How strict should the Planning Review gate be?** → Decided: Soft gate with override option
7. **Should we allow quick one-off generations without a thread?** → Yes, with warning
8. **How do existing campaigns migrate to threads?** → Auto-migrate as `approved` state

---

## Appendix: Agency Model References

See [PRD_AGENCY_MODEL_ADDENDUM.md](./PRD_AGENCY_MODEL_ADDENDUM.md) for detailed specifications on:
- Agency role authority model
- Strategic Thread lifecycle
- Planning Review flow
- Navigation structure
- User journeys

---

*Last Updated: January 2026*
*Agency Model Phase 0: Complete*
*Document Owner: Product Team*

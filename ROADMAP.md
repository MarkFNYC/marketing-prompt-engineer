# Amplify Product Roadmap

## Overview
Feature backlog and planning for Amplify - AI-powered marketing tool.

---

## Upcoming Features

### 1. Creative Remix
**Priority:** High | **Complexity:** Medium

Reimagine strategy or execution outputs through the lens of legendary advertising minds.

**User Story:**
> As a user, I want to remix my generated content through the perspective of legendary ad creatives/strategists, so I can get fresh approaches and learn from different schools of thought.

**Requirements:**
- [ ] Segment personas into **Strategists** (for strategy outputs) and **Creatives** (for execution outputs)
- [ ] Add "Remix" button on LLM output screen
- [ ] Build persona selection modal with legend info (name, tagline, style, quote)
- [ ] Create detailed system prompts for each persona
- [ ] Generate remixed output maintaining brand context
- [ ] Display with persona attribution and signature colors

**Personas:** (pending full list from user)
| Type | Legends |
|------|---------|
| Strategists | TBD |
| Creatives | TBD |

---

### 2. Brand Guidelines per Project
**Priority:** High | **Complexity:** Medium

Store brand-specific guidelines within each project for more consistent, on-brand outputs.

**User Story:**
> As a user, I want to save my brand colors, fonts, and voice guidelines with each project, so all generated content stays on-brand.

**Requirements:**
- [ ] Extend project schema with brand guidelines fields
- [ ] Update project create/edit UI with guidelines section
- [ ] Fields to include:
  - Primary color
  - Secondary color
  - Accent color
  - Headline font
  - Body font
  - Voice & tone description
  - Logo upload (optional)
- [ ] Pass voice/tone into LLM prompts for brand-aware generation
- [ ] Display brand colors in project cards

**Database Changes:**
```sql
ALTER TABLE projects ADD COLUMN brand_guidelines JSONB DEFAULT '{}';
-- Structure: { colors: {primary, secondary, accent}, fonts: {headline, body}, voice: string, logo_url: string }
```

---

### 3. Asset Builder
**Priority:** Medium | **Complexity:** High

Turn execution outputs into polished, ready-to-use visual assets.

**User Story:**
> As a user, I want to turn my generated copy into a visual asset (LinkedIn post, social ad, etc.), so I can publish directly without using other tools.

**Requirements:**
- [ ] Template selection (LinkedIn post, Instagram, Facebook ad, Twitter, etc.)
- [ ] Image handling (upload or AI generation integration)
- [ ] Live preview with headline, copy, CTA positioned correctly
- [ ] Apply brand colors/fonts from project guidelines
- [ ] Export as PNG/JPG
- [ ] Platform-specific sizing presets

**Approach Options:**
1. **In-app builder** - Full control, more dev effort
2. **Canva integration** - Leverage existing tool via API
3. **Structured output + copy buttons** - Simplest MVP

---

## Completed Features

### Multi-Project System ✅
*Shipped: January 2025*

- Projects persist in database with brand context
- Switch between multiple brands/clients
- Saved content linked to projects
- Edit/delete projects

### Personal Library ✅
*Shipped: January 2025*

- Save generated content to library
- View, copy, delete saved items
- Linked to projects

### Authentication ✅
*Shipped: January 2025*

- Email/password signup & login
- Email confirmation flow
- Password reset
- Usage tracking per user

---

## Ideas / Future Consideration

- **Team collaboration** - Share projects with team members
- **Content calendar** - Schedule when to use generated content
- **Analytics integration** - Track performance of content created in Amplify
- **Custom prompt templates** - Users create their own prompts
- **Export to marketing tools** - Direct publish to Buffer, Hootsuite, HubSpot, etc.

---

## Notes

*Last updated: January 2025*

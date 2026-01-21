# Amplify

> Turn any marketing discipline into a personalized AI prompt library—with strategic wisdom from legendary creative minds.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
[![Powered by](https://img.shields.io/badge/Powered%20by-Fabrica%20Collective-purple)](https://fabricacollective.com)

## Overview

**Amplify** by [Fabrica Collective](https://fabricacollective.com) is an AI-powered tool that generates personalized marketing prompts across 9 disciplines. Enter your brand context once, and get battle-tested prompts customized to your specific business challenges.

### Key Features

- **9 Marketing Disciplines**: SEO, Paid Media, Lifecycle, Content, CRO, LinkedIn, Blog, Email, Social
- **90 Expert Prompts**: Battle-tested prompts designed by operators who've scaled companies
- **50+ Mental Models**: Strategic frameworks from Reforge, CXL, Demand Curve, and more
- **Strategy & Execution Modes**: Toggle between planning frameworks and ready-to-publish content
- **LLM Integration**: Run prompts with OpenAI or Anthropic, or copy for any AI tool
- **Brand Personalization**: Every prompt auto-customized with your brand context

## Live Demo

🚀 **[Try it now](https://marketing-prompt-engineer.vercel.app)** — No signup required

## Screenshots

*Coming soon*

## Quick Start

### Option 1: Use the hosted version
Visit [marketing-prompt-engineer.vercel.app](https://marketing-prompt-engineer.vercel.app) and start generating prompts immediately.

### Option 2: Run locally
```bash
# Clone the repository
git clone https://github.com/yourusername/marketing-prompt-engineer.git

# Navigate to directory
cd marketing-prompt-engineer

# Open in browser (it's a single HTML file!)
open index.html
```

### Option 3: Deploy your own
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/marketing-prompt-engineer)

## Usage

1. **Add Your Context**: Enter your brand name, website, industry, and current business challenge
2. **Choose a Discipline**: Pick from 9 marketing areas (SEO, Email, Social, etc.)
3. **Select Your Mode**:
   - **Strategy Mode** 📋 — Get frameworks, analysis, and recommendations
   - **Execution Mode** ⚡ — Get ready-to-use content you can copy and publish
4. **Run or Copy**: Execute prompts with AI (bring your own API key) or copy for use anywhere

## Disciplines

| Discipline | Prompts | Focus |
|------------|---------|-------|
| 🔍 SEO | 10 | Technical SEO, content optimization, link building |
| 💰 Paid Media | 10 | Ad creative, audience strategy, measurement |
| 🔄 Lifecycle | 10 | Email flows, retention, automation |
| ✍️ Content | 10 | Strategy, distribution, repurposing |
| 📈 CRO | 10 | Testing, friction audits, optimization |
| 💼 LinkedIn | 10 | Posts, carousels, engagement |
| 📝 Blog | 10 | Long-form content, SEO articles |
| 📧 Email | 10 | Campaigns, sequences, newsletters |
| 📱 Social | 10 | Twitter, Instagram, TikTok |

## API Key Setup

To run prompts directly in the app, you'll need an API key from:

- **OpenAI**: Get your key at [platform.openai.com](https://platform.openai.com/api-keys)
- **Anthropic**: Get your key at [console.anthropic.com](https://console.anthropic.com/)

Your API key is stored locally in your browser and never sent to our servers.

**Or use "Copy Only" mode** to paste prompts into ChatGPT, Claude, or any AI tool.

## Roadmap

See [PRODUCT_ROADMAP.md](./docs/PRODUCT_ROADMAP.md) for the full development plan.

### Coming Soon

- [ ] **Creative Personas**: Get outputs in the style of David Ogilvy, Steve Jobs, and other legends
- [ ] **User Accounts**: Save your outputs and access across devices
- [ ] **Content Library**: Organize saved content with folders and tags
- [ ] **Publishing Integrations**: Connect LinkedIn, Twitter, Google Ads, and more
- [ ] **Team Features**: Collaborate with shared brand contexts

## Tech Stack

**Current (v1.0)**
- Single HTML file
- Tailwind CSS (via CDN)
- Vanilla JavaScript
- OpenAI / Anthropic API (client-side)

**Planned (v2.0)**
- Next.js 14
- Supabase (Auth, Database, Storage)
- Stripe (Payments)
- Vercel (Hosting)

## Project Structure

```
marketing-prompt-engineer/
├── index.html              # Main application (current)
├── README.md               # This file
├── docs/
│   ├── PRODUCT_ROADMAP.md  # Feature roadmap & user stories
│   ├── DATABASE_SCHEMA.md  # Data model for v2
│   └── BUSINESS_RULES.md   # Business logic documentation
└── .github/
    └── ISSUE_TEMPLATE.md   # Bug report template
```

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

### Development

```bash
# The current version is a single HTML file
# Just edit index.html and refresh your browser

# For the Next.js v2 (coming soon):
npm install
npm run dev
```

### Bug Reports

Please include:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## Mental Model Sources

This tool incorporates frameworks and mental models from:
- [Reforge](https://reforge.com)
- [CXL](https://cxl.com)
- [Demand Curve](https://demandcurve.com)
- [HubSpot](https://hubspot.com)
- [Semrush](https://semrush.com)
- [Growth.Design](https://growth.design)

## License

MIT License — see [LICENSE](./LICENSE) for details.

## Support

- 📧 Email: support@example.com
- 🐦 Twitter: [@example](https://twitter.com/example)
- 💬 Discord: [Join our community](https://discord.gg/example)

---

---

Built with ❤️ by [Fabrica Collective](https://fabricacollective.com)

*Powered by Claude & GPT-4*

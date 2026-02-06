import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — Amplify',
  description: 'Privacy Policy for Amplify by Fabrica Collective',
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#0D0D0D] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="inline-block text-[#FF0066] hover:text-[#FFFF00] text-sm mb-8 transition-colors"
        >
          &larr; Back to Amplify
        </Link>

        {/* Page title */}
        <h1 className="font-display text-white text-4xl sm:text-5xl tracking-wide uppercase mb-2">
          Privacy Policy
        </h1>
        <p className="text-[#aaa] text-sm mb-10">Last updated: February 2026</p>

        {/* Introduction */}
        <section className="mb-10">
          <p className="text-[#aaa] text-base leading-relaxed mb-4">
            This Privacy Policy describes how <span className="text-white font-semibold">Fabrica Collective</span>{' '}
            (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, discloses, and
            protects your personal information when you use{' '}
            <span className="text-white font-semibold">Amplify</span> (the &quot;Platform&quot;), available at{' '}
            <a
              href="https://amplify.fabricacollective.com"
              className="text-[#FF0066] hover:text-[#FFFF00] transition-colors"
            >
              amplify.fabricacollective.com
            </a>
            .
          </p>
          <p className="text-[#aaa] text-base leading-relaxed mb-4">
            Amplify is an AI-powered marketing platform that helps users create strategies, campaigns,
            creative briefs, and content using artificial intelligence. By using Amplify, you agree to
            the collection and use of information in accordance with this policy.
          </p>
          <div className="border border-[#FF0066]/40 bg-[#FF0066]/5 rounded-lg p-4 mb-4">
            <p className="text-white text-sm font-semibold mb-2">
              Important: AI Data Processing Disclosure
            </p>
            <p className="text-[#aaa] text-sm leading-relaxed">
              Amplify sends your prompts, brand context, campaign details, and related content to{' '}
              <span className="text-white">Google&apos;s Gemini API</span> to generate AI-powered marketing
              content. This means your brand information, campaign strategies, audience data, and any text
              you provide in prompts is transmitted to Google&apos;s servers for processing. Google&apos;s use of
              this data is governed by{' '}
              <a
                href="https://ai.google.dev/gemini-api/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FF0066] hover:text-[#FFFF00] transition-colors underline"
              >
                Google&apos;s Gemini API Terms of Service
              </a>
              . If you optionally configure your own OpenAI or Anthropic API keys, your data will also
              be sent to those respective providers under their own privacy policies.
            </p>
          </div>
        </section>

        <div className="border-t border-[#333] mb-10" />

        {/* 1. Information We Collect */}
        <section className="mb-10">
          <h2 className="font-display text-white text-2xl tracking-wide uppercase mb-6">
            1. Information We Collect
          </h2>

          <h3 className="text-[#FF0066] text-lg font-semibold mb-3">
            1.1 Information You Provide Directly
          </h3>
          <p className="text-[#aaa] text-sm leading-relaxed mb-3">
            When you create an account and use Amplify, you may provide us with:
          </p>
          <ul className="text-[#aaa] text-sm leading-relaxed list-disc list-inside space-y-2 mb-6 ml-2">
            <li>
              <span className="text-white">Account information:</span> email address and password
            </li>
            <li>
              <span className="text-white">Brand and project details:</span> brand name, website URL,
              industry, target audience descriptions, value proposition, and other brand context you enter
            </li>
            <li>
              <span className="text-white">Campaign data:</span> business problems, success metrics,
              budgets, timelines, constraints, strategies, message strategies, creative ideas, and
              campaign configurations
            </li>
            <li>
              <span className="text-white">AI prompts and outputs:</span> the prompts you submit, any
              customizations or refinements, and the AI-generated content you choose to save
            </li>
            <li>
              <span className="text-white">Buyer personas:</span> audience demographic data, psychographic
              profiles, behavioral information, and persona descriptions you create
            </li>
            <li>
              <span className="text-white">Optional API keys:</span> if you choose to use your own
              OpenAI or Anthropic API keys, those keys are stored in your account
            </li>
          </ul>

          <h3 className="text-[#FF0066] text-lg font-semibold mb-3">
            1.2 Information Collected Automatically
          </h3>
          <p className="text-[#aaa] text-sm leading-relaxed mb-3">
            When you use Amplify, we automatically collect:
          </p>
          <ul className="text-[#aaa] text-sm leading-relaxed list-disc list-inside space-y-2 mb-6 ml-2">
            <li>
              <span className="text-white">Usage metrics:</span> number of prompts used per month,
              feature interactions, and subscription tier
            </li>
            <li>
              <span className="text-white">Timestamps:</span> account creation dates, last login times,
              and content creation dates
            </li>
            <li>
              <span className="text-white">Analytics data:</span> page views, events, navigation patterns,
              session duration, and performance metrics (collected via Google Analytics and Vercel Analytics)
            </li>
            <li>
              <span className="text-white">CAPTCHA verification data:</span> tokens generated by Cloudflare
              Turnstile during the signup process
            </li>
          </ul>

          <h3 className="text-[#FF0066] text-lg font-semibold mb-3">
            1.3 Information from Third Parties
          </h3>
          <p className="text-[#aaa] text-sm leading-relaxed mb-6">
            If you subscribe to a premium plan, Stripe provides us with confirmation of your payment
            status and subscription details. We do not receive or store your full credit card number.
          </p>
        </section>

        <div className="border-t border-[#333] mb-10" />

        {/* 2. How We Use Your Information */}
        <section className="mb-10">
          <h2 className="font-display text-white text-2xl tracking-wide uppercase mb-6">
            2. How We Use Your Information
          </h2>
          <p className="text-[#aaa] text-sm leading-relaxed mb-3">
            We use the information we collect for the following purposes:
          </p>
          <ul className="text-[#aaa] text-sm leading-relaxed list-disc list-inside space-y-2 mb-4 ml-2">
            <li>
              <span className="text-white">Provide the Platform:</span> to operate Amplify, generate
              AI-powered marketing content, and deliver the features you use
            </li>
            <li>
              <span className="text-white">AI content generation:</span> to send your prompts and brand
              context to AI providers (Google Gemini, and optionally OpenAI or Anthropic) so they can
              generate marketing content on your behalf
            </li>
            <li>
              <span className="text-white">Account management:</span> to authenticate your identity,
              manage your subscription, and enforce usage limits
            </li>
            <li>
              <span className="text-white">Process payments:</span> to process premium subscription
              payments ($29/month) through Stripe
            </li>
            <li>
              <span className="text-white">Improve the Platform:</span> to analyze usage patterns,
              diagnose technical issues, and improve features and performance
            </li>
            <li>
              <span className="text-white">Security:</span> to prevent fraud, abuse, and unauthorized
              access, including CAPTCHA verification during signup
            </li>
            <li>
              <span className="text-white">Communications:</span> to send you service-related emails
              such as account verification, password resets, and critical product updates
            </li>
            <li>
              <span className="text-white">Legal compliance:</span> to comply with applicable laws,
              regulations, and legal processes
            </li>
          </ul>
        </section>

        <div className="border-t border-[#333] mb-10" />

        {/* 3. Third-Party Services and Data Sharing */}
        <section className="mb-10">
          <h2 className="font-display text-white text-2xl tracking-wide uppercase mb-6">
            3. Third-Party Services and Data Sharing
          </h2>
          <p className="text-[#aaa] text-sm leading-relaxed mb-6">
            We share your information with the following third-party service providers who assist us
            in operating the Platform. We do not sell your personal information to any third party.
          </p>

          <div className="space-y-6">
            <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-5">
              <h3 className="text-white font-semibold mb-2">Google Gemini API</h3>
              <p className="text-[#aaa] text-sm leading-relaxed">
                <span className="text-[#FF0066] font-medium">Data shared:</span> All prompts, brand
                context (brand name, industry, audience, value proposition), campaign details (business
                problems, strategies, budgets, constraints), buyer personas, and any other text you
                include in AI generation requests.
              </p>
              <p className="text-[#aaa] text-sm leading-relaxed mt-2">
                <span className="text-[#FF0066] font-medium">Purpose:</span> AI-powered marketing
                content generation, which is the core functionality of Amplify.
              </p>
            </div>

            <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-5">
              <h3 className="text-white font-semibold mb-2">
                OpenAI / Anthropic <span className="text-[#aaa] text-xs font-normal">(optional)</span>
              </h3>
              <p className="text-[#aaa] text-sm leading-relaxed">
                <span className="text-[#FF0066] font-medium">Data shared:</span> Same categories as
                Google Gemini above, if you choose to configure and use your own API keys for these
                providers.
              </p>
              <p className="text-[#aaa] text-sm leading-relaxed mt-2">
                <span className="text-[#FF0066] font-medium">Purpose:</span> Alternative AI content
                generation at your discretion. Data sent to these providers is governed by their
                respective privacy policies.
              </p>
            </div>

            <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-5">
              <h3 className="text-white font-semibold mb-2">Stripe</h3>
              <p className="text-[#aaa] text-sm leading-relaxed">
                <span className="text-[#FF0066] font-medium">Data shared:</span> Email address and
                billing information for premium subscription processing.
              </p>
              <p className="text-[#aaa] text-sm leading-relaxed mt-2">
                <span className="text-[#FF0066] font-medium">Purpose:</span> Payment processing for
                premium subscriptions ($29/month). Stripe&apos;s handling of your payment data is governed by
                the{' '}
                <a
                  href="https://stripe.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF0066] hover:text-[#FFFF00] transition-colors underline"
                >
                  Stripe Privacy Policy
                </a>
                .
              </p>
            </div>

            <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-5">
              <h3 className="text-white font-semibold mb-2">Supabase</h3>
              <p className="text-[#aaa] text-sm leading-relaxed">
                <span className="text-[#FF0066] font-medium">Data shared:</span> All user account
                data, brand/project information, campaign data, saved outputs, and personas are stored
                in Supabase-hosted PostgreSQL databases.
              </p>
              <p className="text-[#aaa] text-sm leading-relaxed mt-2">
                <span className="text-[#FF0066] font-medium">Purpose:</span> Database hosting,
                authentication, and data persistence. Supabase also manages user authentication
                (login/signup sessions).
              </p>
            </div>

            <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-5">
              <h3 className="text-white font-semibold mb-2">Google Analytics (GA4)</h3>
              <p className="text-[#aaa] text-sm leading-relaxed">
                <span className="text-[#FF0066] font-medium">Data shared:</span> Page views, events,
                user behavior, session data, and device/browser information. Measurement ID:{' '}
                <span className="text-white font-mono text-xs">G-CF80X5DDSG</span>.
              </p>
              <p className="text-[#aaa] text-sm leading-relaxed mt-2">
                <span className="text-[#FF0066] font-medium">Purpose:</span> Website analytics to
                understand how users interact with the Platform and to improve the user experience.
              </p>
            </div>

            <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-5">
              <h3 className="text-white font-semibold mb-2">Vercel Analytics</h3>
              <p className="text-[#aaa] text-sm leading-relaxed">
                <span className="text-[#FF0066] font-medium">Data shared:</span> Page views, web
                vitals, and performance metrics.
              </p>
              <p className="text-[#aaa] text-sm leading-relaxed mt-2">
                <span className="text-[#FF0066] font-medium">Purpose:</span> Performance monitoring
                and page-level analytics to ensure the Platform runs smoothly.
              </p>
            </div>

            <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-5">
              <h3 className="text-white font-semibold mb-2">Cloudflare Turnstile</h3>
              <p className="text-[#aaa] text-sm leading-relaxed">
                <span className="text-[#FF0066] font-medium">Data shared:</span> CAPTCHA verification
                tokens and related challenge data during the signup process.
              </p>
              <p className="text-[#aaa] text-sm leading-relaxed mt-2">
                <span className="text-[#FF0066] font-medium">Purpose:</span> Bot prevention and abuse
                mitigation during account registration.
              </p>
            </div>
          </div>
        </section>

        <div className="border-t border-[#333] mb-10" />

        {/* 4. Cookies and Tracking Technologies */}
        <section className="mb-10">
          <h2 className="font-display text-white text-2xl tracking-wide uppercase mb-6">
            4. Cookies and Tracking Technologies
          </h2>
          <p className="text-[#aaa] text-sm leading-relaxed mb-4">
            Amplify uses cookies and similar tracking technologies. Cookie consent is required before
            analytics scripts are loaded.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border border-[#333] rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-[#1a1a1a] border-b border-[#333]">
                  <th className="text-white font-semibold px-4 py-3">Cookie</th>
                  <th className="text-white font-semibold px-4 py-3">Provider</th>
                  <th className="text-white font-semibold px-4 py-3">Purpose</th>
                  <th className="text-white font-semibold px-4 py-3">Duration</th>
                </tr>
              </thead>
              <tbody className="text-[#aaa]">
                <tr className="border-b border-[#333]/50">
                  <td className="px-4 py-3 font-mono text-xs text-white">_ga</td>
                  <td className="px-4 py-3">Google Analytics</td>
                  <td className="px-4 py-3">Distinguishes unique users</td>
                  <td className="px-4 py-3">2 years</td>
                </tr>
                <tr className="border-b border-[#333]/50">
                  <td className="px-4 py-3 font-mono text-xs text-white">_gid</td>
                  <td className="px-4 py-3">Google Analytics</td>
                  <td className="px-4 py-3">Distinguishes unique users (24h)</td>
                  <td className="px-4 py-3">24 hours</td>
                </tr>
                <tr className="border-b border-[#333]/50">
                  <td className="px-4 py-3 font-mono text-xs text-white">va_*</td>
                  <td className="px-4 py-3">Vercel Analytics</td>
                  <td className="px-4 py-3">Page view and performance tracking</td>
                  <td className="px-4 py-3">Session</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs text-white">sb-*-auth-token</td>
                  <td className="px-4 py-3">Supabase</td>
                  <td className="px-4 py-3">Authentication session management</td>
                  <td className="px-4 py-3">Session / configurable</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-[#aaa] text-sm leading-relaxed mt-4">
            You can control cookies through your browser settings. Disabling certain cookies may
            affect the functionality of the Platform, particularly authentication cookies which are
            essential for logging in.
          </p>
        </section>

        <div className="border-t border-[#333] mb-10" />

        {/* 5. Data Security */}
        <section className="mb-10">
          <h2 className="font-display text-white text-2xl tracking-wide uppercase mb-6">
            5. Data Security
          </h2>
          <p className="text-[#aaa] text-sm leading-relaxed mb-4">
            We implement appropriate technical and organizational measures to protect your personal
            information:
          </p>
          <ul className="text-[#aaa] text-sm leading-relaxed list-disc list-inside space-y-2 ml-2">
            <li>
              <span className="text-white">Encryption at rest:</span> All data stored in our Supabase
              PostgreSQL databases is encrypted at rest
            </li>
            <li>
              <span className="text-white">Encryption in transit:</span> All data transmitted between
              your browser and our servers is protected via TLS (HTTPS)
            </li>
            <li>
              <span className="text-white">Authentication:</span> Passwords are hashed and managed by
              Supabase Auth; we never store plaintext passwords
            </li>
            <li>
              <span className="text-white">Access controls:</span> Row-level security policies are
              implemented at the database level to ensure users can only access their own data
            </li>
          </ul>
          <p className="text-[#aaa] text-sm leading-relaxed mt-4">
            While we take reasonable steps to protect your data, no method of electronic storage or
            transmission over the Internet is 100% secure. We cannot guarantee absolute security.
          </p>
        </section>

        <div className="border-t border-[#333] mb-10" />

        {/* 6. Data Retention */}
        <section className="mb-10">
          <h2 className="font-display text-white text-2xl tracking-wide uppercase mb-6">
            6. Data Retention
          </h2>
          <p className="text-[#aaa] text-sm leading-relaxed mb-4">
            We retain your personal information for as long as your account is active or as needed to
            provide you with the Platform&apos;s services:
          </p>
          <ul className="text-[#aaa] text-sm leading-relaxed list-disc list-inside space-y-2 ml-2">
            <li>
              <span className="text-white">Account and content data:</span> Retained until you request
              account deletion
            </li>
            <li>
              <span className="text-white">Payment records:</span> Stripe retains billing and
              transaction records as required by applicable financial regulations and legal
              requirements
            </li>
            <li>
              <span className="text-white">Analytics data:</span> Retained according to Google
              Analytics and Vercel Analytics default retention periods
            </li>
            <li>
              <span className="text-white">AI-generated content:</span> Saved outputs are retained in
              your account until you delete them or request account deletion
            </li>
          </ul>
        </section>

        <div className="border-t border-[#333] mb-10" />

        {/* 7. Your Privacy Rights — CCPA */}
        <section className="mb-10">
          <h2 className="font-display text-white text-2xl tracking-wide uppercase mb-6">
            7. Your Privacy Rights (California Residents)
          </h2>
          <p className="text-[#aaa] text-sm leading-relaxed mb-6">
            If you are a California resident, you have the following rights under the California
            Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA):
          </p>

          <h3 className="text-[#FF0066] text-lg font-semibold mb-3">
            7.1 Categories of Personal Information Collected
          </h3>
          <p className="text-[#aaa] text-sm leading-relaxed mb-2">
            In the preceding 12 months, we have collected the following categories of personal
            information:
          </p>
          <ul className="text-[#aaa] text-sm leading-relaxed list-disc list-inside space-y-2 mb-6 ml-2">
            <li>
              <span className="text-white">Identifiers:</span> email address, account credentials, IP
              address
            </li>
            <li>
              <span className="text-white">Commercial information:</span> subscription tier, payment
              history, usage records
            </li>
            <li>
              <span className="text-white">Internet or electronic network activity:</span> browsing
              history on the Platform, page views, interactions with features, device and browser
              information
            </li>
            <li>
              <span className="text-white">Professional or employment-related information:</span>{' '}
              brand details, business information, and marketing data you voluntarily provide
            </li>
            <li>
              <span className="text-white">Inferences:</span> usage patterns and feature preferences
              derived from your activity
            </li>
          </ul>

          <h3 className="text-[#FF0066] text-lg font-semibold mb-3">
            7.2 Sources of Personal Information
          </h3>
          <ul className="text-[#aaa] text-sm leading-relaxed list-disc list-inside space-y-2 mb-6 ml-2">
            <li>Directly from you when you create an account and use the Platform</li>
            <li>Automatically through cookies, analytics tools, and server logs</li>
            <li>From third-party payment processors (Stripe) regarding subscription status</li>
          </ul>

          <h3 className="text-[#FF0066] text-lg font-semibold mb-3">
            7.3 Business and Commercial Purposes for Collection
          </h3>
          <ul className="text-[#aaa] text-sm leading-relaxed list-disc list-inside space-y-2 mb-6 ml-2">
            <li>Providing, operating, and improving the Platform</li>
            <li>Processing AI content generation requests</li>
            <li>Processing payments and managing subscriptions</li>
            <li>Analyzing usage to improve features and user experience</li>
            <li>Security, fraud prevention, and abuse mitigation</li>
            <li>Legal compliance</li>
          </ul>

          <h3 className="text-[#FF0066] text-lg font-semibold mb-3">
            7.4 Third Parties With Whom We Share Data
          </h3>
          <p className="text-[#aaa] text-sm leading-relaxed mb-6">
            We share personal information with the service providers listed in Section 3 above
            (Google Gemini API, Stripe, Google Analytics, Vercel Analytics, Cloudflare Turnstile, and
            Supabase). These entities receive data solely for the purposes of providing services to
            us and operating the Platform on our behalf.
          </p>

          <h3 className="text-[#FF0066] text-lg font-semibold mb-3">
            7.5 Your CCPA Rights
          </h3>
          <p className="text-[#aaa] text-sm leading-relaxed mb-3">
            As a California resident, you have the right to:
          </p>
          <ul className="text-[#aaa] text-sm leading-relaxed list-disc list-inside space-y-3 mb-6 ml-2">
            <li>
              <span className="text-white">Right to Know (Access and Export):</span> You may request
              that we disclose what personal information we have collected about you, the categories of
              sources, the business purposes for collection, and the categories of third parties with
              whom we have shared it. You may also request a copy of the specific personal information
              we hold about you in a portable format.
            </li>
            <li>
              <span className="text-white">Right to Delete:</span> You may request that we delete the
              personal information we have collected about you, subject to certain exceptions permitted
              by law (such as records required for legal compliance or completing a transaction).
            </li>
            <li>
              <span className="text-white">Right to Correct:</span> You may request that we correct
              inaccurate personal information we maintain about you.
            </li>
            <li>
              <span className="text-white">Right to Opt-Out of Sale or Sharing:</span> You have the
              right to opt out of the &quot;sale&quot; or &quot;sharing&quot; of your personal information. See Section 7.6
              below for our disclosure on this topic.
            </li>
            <li>
              <span className="text-white">Right to Non-Discrimination:</span> We will not
              discriminate against you for exercising any of your CCPA rights. We will not deny you
              services, charge you different prices, or provide a different quality of service because
              you exercise these rights.
            </li>
          </ul>
          <p className="text-[#aaa] text-sm leading-relaxed mb-6">
            To exercise any of these rights, please contact us at{' '}
            <a
              href="mailto:Admin@FabricaCollective.com"
              className="text-[#FF0066] hover:text-[#FFFF00] transition-colors"
            >
              Admin@FabricaCollective.com
            </a>
            . We will verify your identity before processing your request and respond within 45 days
            as required by law.
          </p>
          <p className="text-[#aaa] text-sm leading-relaxed mb-6 italic">
            Note: In-app data export and account deletion features are currently under development.
            In the meantime, please email us to exercise these rights and we will process your request
            manually.
          </p>

          <h3 className="text-[#FF0066] text-lg font-semibold mb-3">
            7.6 Do Not Sell or Share My Personal Information
          </h3>
          <p className="text-[#aaa] text-sm leading-relaxed mb-4">
            <span className="text-white font-semibold">
              We do not sell your personal information.
            </span>{' '}
            We do not exchange your personal information for monetary consideration with any third
            party.
          </p>
          <p className="text-[#aaa] text-sm leading-relaxed mb-4">
            We share personal information with service providers as described in Section 3 strictly
            for the operational purposes described in this policy. These service providers are
            contractually limited in how they may use your data and may not use it for their own
            independent marketing purposes.
          </p>
          <p className="text-[#aaa] text-sm leading-relaxed">
            To the extent that the use of analytics cookies (Google Analytics) could be considered
            &quot;sharing&quot; under the CCPA, you may opt out by declining analytics cookies when prompted or
            by adjusting your browser settings to block third-party cookies.
          </p>
        </section>

        <div className="border-t border-[#333] mb-10" />

        {/* 8. Children's Privacy */}
        <section className="mb-10">
          <h2 className="font-display text-white text-2xl tracking-wide uppercase mb-6">
            8. Children&apos;s Privacy
          </h2>
          <p className="text-[#aaa] text-sm leading-relaxed mb-4">
            Amplify is not intended for use by children under 13 years of age. We do not knowingly
            collect personal information from children under 13 in compliance with the Children&apos;s
            Online Privacy Protection Act (COPPA).
          </p>
          <p className="text-[#aaa] text-sm leading-relaxed">
            If we become aware that we have collected personal information from a child under 13, we
            will take immediate steps to delete that information. If you believe a child under 13 has
            provided us with personal information, please contact us at{' '}
            <a
              href="mailto:Admin@FabricaCollective.com"
              className="text-[#FF0066] hover:text-[#FFFF00] transition-colors"
            >
              Admin@FabricaCollective.com
            </a>
            .
          </p>
        </section>

        <div className="border-t border-[#333] mb-10" />

        {/* 9. International Data Transfers */}
        <section className="mb-10">
          <h2 className="font-display text-white text-2xl tracking-wide uppercase mb-6">
            9. International Data Transfers
          </h2>
          <p className="text-[#aaa] text-sm leading-relaxed">
            Amplify is operated from the United States. If you access the Platform from outside the
            United States, your information may be transferred to, stored, and processed in the United
            States or other countries where our service providers maintain facilities. By using
            Amplify, you consent to the transfer of your information to the United States and other
            jurisdictions that may not provide the same level of data protection as your home country.
          </p>
        </section>

        <div className="border-t border-[#333] mb-10" />

        {/* 10. Third-Party Links */}
        <section className="mb-10">
          <h2 className="font-display text-white text-2xl tracking-wide uppercase mb-6">
            10. Third-Party Links
          </h2>
          <p className="text-[#aaa] text-sm leading-relaxed">
            The Platform may contain links to third-party websites or services that are not operated
            by us. We have no control over, and assume no responsibility for, the content, privacy
            policies, or practices of any third-party websites or services. We encourage you to review
            the privacy policies of any third-party sites you visit.
          </p>
        </section>

        <div className="border-t border-[#333] mb-10" />

        {/* 11. Changes to This Policy */}
        <section className="mb-10">
          <h2 className="font-display text-white text-2xl tracking-wide uppercase mb-6">
            11. Changes to This Privacy Policy
          </h2>
          <p className="text-[#aaa] text-sm leading-relaxed mb-4">
            We may update this Privacy Policy from time to time to reflect changes in our practices,
            technologies, legal requirements, or other factors. When we make material changes, we will
            update the &quot;Last updated&quot; date at the top of this page.
          </p>
          <p className="text-[#aaa] text-sm leading-relaxed">
            We encourage you to review this Privacy Policy periodically. Your continued use of Amplify
            after any changes constitutes your acceptance of the updated policy.
          </p>
        </section>

        <div className="border-t border-[#333] mb-10" />

        {/* 12. Contact Us */}
        <section className="mb-10">
          <h2 className="font-display text-white text-2xl tracking-wide uppercase mb-6">
            12. Contact Us
          </h2>
          <p className="text-[#aaa] text-sm leading-relaxed mb-4">
            If you have any questions, concerns, or requests regarding this Privacy Policy or our data
            practices, please contact us:
          </p>
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-5">
            <p className="text-white font-semibold mb-2">Fabrica Collective</p>
            <p className="text-[#aaa] text-sm mb-1">
              Email:{' '}
              <a
                href="mailto:Admin@FabricaCollective.com"
                className="text-[#FF0066] hover:text-[#FFFF00] transition-colors"
              >
                Admin@FabricaCollective.com
              </a>
            </p>
            <p className="text-[#aaa] text-sm mb-1">
              Website:{' '}
              <a
                href="https://amplify.fabricacollective.com"
                className="text-[#FF0066] hover:text-[#FFFF00] transition-colors"
              >
                amplify.fabricacollective.com
              </a>
            </p>
            <p className="text-[#aaa] text-sm">Jurisdiction: California, United States</p>
          </div>
        </section>

        {/* Footer note */}
        <div className="border-t border-[#333] pt-8 pb-12">
          <p className="text-[#666] text-xs text-center">
            &copy; {new Date().getFullYear()} Fabrica Collective. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  )
}

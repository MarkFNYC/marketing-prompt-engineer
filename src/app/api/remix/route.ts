import { NextRequest, NextResponse } from 'next/server';
import { getPersonaById } from '@/lib/personas';
import { rateLimiter, getClientIdentifier } from '@/lib/rate-limiter';
import { getUserIdIfPresent } from '@/lib/auth-server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    // Basic protection: Check origin/referer
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const allowedOrigins = [
      'https://amplify.fabricacollective.com',
      'http://localhost:3000',
      'https://marketing-prompter.vercel.app',
    ];

    // Also allow any vercel.app subdomain for preview deployments
    const isVercelPreview = origin?.endsWith('.vercel.app') || referer?.includes('.vercel.app');

    if (!origin && !referer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const isAllowed = isVercelPreview || allowedOrigins.some(allowed =>
      origin?.startsWith(allowed) || referer?.startsWith(allowed)
    );

    if (!isAllowed) {
      return NextResponse.json({ error: 'Unauthorized - origin not allowed' }, { status: 403 });
    }

    // Rate limiting
    const authResult = await getUserIdIfPresent(request);
    const userId = 'userId' in authResult ? authResult.userId : null;
    const identifier = getClientIdentifier(request, userId ?? undefined);
    const limit = userId ? 10 : 5;
    const rateCheck = rateLimiter.check(identifier, limit, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rateCheck.resetMs / 1000)) } }
      );
    }

    const { originalContent, personaId, mode, brandContext, feedback } = await request.json();

    if (!originalContent || !personaId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const persona = getPersonaById(personaId);
    if (!persona) {
      return NextResponse.json({ error: 'Invalid persona' }, { status: 400 });
    }

    // Build the remix prompt (with optional feedback for re-brief)
    const remixPrompt = buildRemixPrompt(originalContent, persona, mode, brandContext, feedback);

    // Call Gemini API
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: remixPrompt }] }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return NextResponse.json(
        { error: errorData.error?.message || 'Failed to generate remix' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!result) {
      return NextResponse.json({ error: 'No content generated' }, { status: 500 });
    }

    return NextResponse.json({
      result,
      persona: {
        id: persona.id,
        name: persona.fullName,
        tagline: persona.tagline,
        colors: persona.colors,
        quote: persona.quote,
      },
    });
  } catch (error: any) {
    console.error('Remix API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function buildRemixPrompt(
  originalContent: string,
  persona: { fullName: string; systemPrompt: string; tagline: string },
  mode: 'strategy' | 'execution',
  brandContext?: { brand?: string; industry?: string; challenge?: string; targetAudience?: string; brandVoice?: string },
  feedback?: string
): string {
  const modeContext = mode === 'strategy'
    ? 'This is a strategic framework/analysis. Reimagine the strategic thinking and approach.'
    : 'This is execution content (headlines, copy, creative). Reimagine the creative execution.';

  let brandInfo = '';
  if (brandContext) {
    const parts = ['\n\nBrand Context:'];
    if (brandContext.brand) parts.push(`- Brand: ${brandContext.brand}`);
    if (brandContext.industry) parts.push(`- Industry: ${brandContext.industry}`);
    if (brandContext.challenge) parts.push(`- Business Challenge: ${brandContext.challenge}`);
    if (brandContext.targetAudience) parts.push(`- Target Audience: ${brandContext.targetAudience}`);
    if (brandContext.brandVoice) {
      parts.push(`- Brand Voice & Tone: ${brandContext.brandVoice}`);
      parts.push('\nIMPORTANT: While applying your unique perspective, ensure the final tone respects the brand voice described above.');
    }
    brandInfo = parts.join('\n');
  }

  // Add re-brief feedback section if provided
  let feedbackSection = '';
  if (feedback) {
    feedbackSection = `

---

CREATIVE RE-BRIEF:
The previous remix didn't meet requirements. Please regenerate with the following feedback in mind:
${feedback}

CRITICAL: You MUST address this specific feedback while maintaining your unique voice and the core brief requirements. This feedback takes priority.`;
  }

  return `${persona.systemPrompt}

---

${modeContext}
${brandInfo}
${feedbackSection}

---

ORIGINAL CONTENT TO REIMAGINE:

${originalContent}

---

Now reimagine this content through your unique lens. Maintain the core intent but transform it with your distinctive philosophy and approach.

Important:
- Stay true to your philosophy and voice
- Don't just rephrase - genuinely reimagine the approach
- If this is strategy, rethink the strategic framework
- If this is creative, reimagine the headlines, copy, and creative direction
- Be bold - your perspective should noticeably transform the output
- If a brand voice was specified, blend your style with their voice appropriately${feedback ? '\n- Address the re-brief feedback provided above - this is critical' : ''}

Begin your reimagined version:`;
}

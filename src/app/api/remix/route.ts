import { NextRequest, NextResponse } from 'next/server';
import { getPersonaById } from '@/lib/personas';
import { rateLimiter, getClientIdentifier, getRateLimit } from '@/lib/rate-limiter';
import { getUserIdIfPresent, getUserTier } from '@/lib/auth-server';
import { requireOrigin } from '@/lib/csrf';
import { apiError } from '@/lib/api-error';
import { remixSchema } from '@/lib/validations';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    // CSRF protection: validate request origin
    const originError = requireOrigin(request);
    if (originError) return originError;

    // Rate limiting (premium users get a higher allowance)
    const authResult = await getUserIdIfPresent(request);
    const userId = 'userId' in authResult ? authResult.userId : null;
    const tier = userId ? await getUserTier(userId) : undefined;
    const identifier = getClientIdentifier(request, userId ?? undefined);
    const limit = getRateLimit(userId, tier);
    const rateCheck = rateLimiter.check(identifier, limit, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rateCheck.resetMs / 1000)) } }
      );
    }

    const body = await request.json();
    const parsed = remixSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input. Original content and persona are required.' }, { status: 400 });
    }
    const { originalContent, personaId, mode, brandContext, feedback } = parsed.data;

    const persona = getPersonaById(personaId);
    if (!persona) {
      return NextResponse.json({ error: 'Invalid persona' }, { status: 400 });
    }

    // Build the remix prompt (with optional feedback for re-brief)
    const remixPrompt = buildRemixPrompt(originalContent, persona, mode ?? 'execution', brandContext ?? undefined, feedback ?? undefined);

    // Call Gemini API
    if (!GEMINI_API_KEY) {
      return apiError('Service configuration error', 500, 'Missing GEMINI_API_KEY for remix');
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
      return apiError('Failed to generate remix', response.status >= 500 ? 500 : response.status, 'Gemini API error:', errorData);
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
    return apiError('Failed to generate remix', 500, 'Remix API error:', error);
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

import { NextResponse } from 'next/server';
import { getPersonaById } from '@/lib/personas';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
  try {
    // Basic protection: Check origin/referer
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const allowedOrigins = ['https://amplify.fabricacollective.com', 'http://localhost:3000'];

    if (!origin && !referer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const isAllowed = allowedOrigins.some(allowed =>
      origin?.startsWith(allowed) || referer?.startsWith(allowed)
    );

    if (!isAllowed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { originalContent, personaId, mode, brandContext } = await request.json();

    if (!originalContent || !personaId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const persona = getPersonaById(personaId);
    if (!persona) {
      return NextResponse.json({ error: 'Invalid persona' }, { status: 400 });
    }

    // Build the remix prompt
    const remixPrompt = buildRemixPrompt(originalContent, persona, mode, brandContext);

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
  brandContext?: { brand?: string; industry?: string; challenge?: string }
): string {
  const modeContext = mode === 'strategy'
    ? 'This is a strategic framework/analysis. Reimagine the strategic thinking and approach.'
    : 'This is execution content (headlines, copy, creative). Reimagine the creative execution.';

  const brandInfo = brandContext
    ? `\n\nBrand Context:\n- Brand: ${brandContext.brand || 'Not specified'}\n- Industry: ${brandContext.industry || 'Not specified'}\n- Challenge: ${brandContext.challenge || 'Not specified'}`
    : '';

  return `${persona.systemPrompt}

---

${modeContext}
${brandInfo}

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

Begin your reimagined version:`;
}

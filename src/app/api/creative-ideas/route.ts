import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter, getClientIdentifier } from '@/lib/rate-limiter';
import { getUserIdIfPresent } from '@/lib/auth-server';
import { apiError } from '@/lib/api-error';

// Initialize Gemini with server-side API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// POST - Generate creative territories/ideas (media-neutral)
export async function POST(request: NextRequest) {
  try {
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

    const {
      brandContext,
      businessProblem,
      selectedStrategy,
      constraints,
      targetAudience,
    } = await request.json();

    if (!businessProblem || !selectedStrategy) {
      return NextResponse.json({ error: 'Business problem and strategy required' }, { status: 400 });
    }

    const prompt = `You are an award-winning Creative Director at a top agency. Your task is to generate 3 distinct creative territories (big ideas) that could bring a strategy to life.

IMPORTANT: These are CREATIVE IDEAS, not executions. They should be:
- Media-neutral (could work across any channel)
- Conceptual and inspiring
- Emotionally resonant
- Strategically aligned

Do NOT mention specific media channels, formats, or tactics. Focus on the IDEA itself.

Return your response as a valid JSON array with exactly 3 creative territories. Return ONLY the JSON array, no markdown formatting.

Format:
[
  {
    "id": "idea-1",
    "name": "Creative Territory Name",
    "summary": "1-2 sentence description of the big idea",
    "why_it_fits": "How this idea ladders up to the strategy",
    "tone_and_feel": ["adjective1", "adjective2", "adjective3"],
    "creative_risk_level": "low | medium | high",
    "what_it_sacrifices": "What this approach trades off (be honest)"
  }
]

---

BRAND CONTEXT:
${brandContext?.name ? `Brand: ${brandContext.name}` : ''}
${brandContext?.industry ? `Industry: ${brandContext.industry}` : ''}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}
${brandContext?.valueProposition ? `Value Proposition: ${brandContext.valueProposition}` : ''}

BUSINESS PROBLEM:
${businessProblem}

APPROVED STRATEGY:
Name: ${selectedStrategy.name}
Core Message: ${selectedStrategy.core_message}
Angle: ${selectedStrategy.angle}
${selectedStrategy.rationale ? `Rationale: ${selectedStrategy.rationale}` : ''}

${constraints ? `CONSTRAINTS: ${constraints}` : ''}

Based on this strategy, propose 3 distinct creative territories. Each should be a genuinely different creative approach to bringing this strategy to life. Think like a Creative Director presenting ideas to a client - make them bold, memorable, and strategically sound.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from response
    let ideas;
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        ideas = JSON.parse(jsonMatch[0]);
      } else {
        console.error('No JSON array found in response:', text);
        return NextResponse.json({ error: 'Failed to parse creative ideas - no JSON found' }, { status: 500 });
      }
    } catch (parseError) {
      console.error('Failed to parse creative ideas:', parseError, 'Response:', text);
      return NextResponse.json({ error: 'Failed to parse creative ideas' }, { status: 500 });
    }

    return NextResponse.json({ ideas });
  } catch (error: any) {
    return apiError('Failed to generate creative ideas', 500, 'Creative ideas generation error:', error);
  }
}

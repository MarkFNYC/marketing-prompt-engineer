import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { getUserIdIfPresent } from '@/lib/auth-server';
import { apiError } from '@/lib/api-error';

// Initialize Gemini with server-side API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// POST - Generate message strategy options for Discovery Mode
export async function POST(request: NextRequest) {
  try {
    const auth = await getUserIdIfPresent(request);
    if ('error' in auth) return auth.error;

    const {
      campaignId,
      brandContext,
      businessProblem,
      successMetric,
      timeline,
      budget,
      constraints,
      whatBeenTried,
      // Expanded brief fields
      targetAudience,
      proposition,
      support,
      tone,
      mandatories,
    } = await request.json();

    if (!businessProblem) {
      return NextResponse.json({ error: 'Business problem required' }, { status: 400 });
    }

    // Build the prompt for message strategy generation
    const prompt = `You are a senior marketing strategist. Your task is to analyze a business challenge and propose 3 distinct message strategies.

Each strategy should include:
1. A clear name (e.g., "Trusted Advisor Positioning", "Risk Reversal", "Peer Proof")
2. A core message (one compelling sentence)
3. An angle (the strategic approach)
4. A rationale (why this fits the situation)
5. Best for (2-3 use cases where this excels)

Return your response as a valid JSON array with exactly 3 options. Return ONLY the JSON array, no markdown formatting.

Format:
[
  {
    "id": "strategy-1",
    "name": "Strategy Name",
    "core_message": "The one-liner that captures this strategy",
    "angle": "How this strategy approaches the problem",
    "rationale": "Why this is a good fit for this specific situation",
    "best_for": ["use case 1", "use case 2"]
  }
]

---

BRAND CONTEXT:
${brandContext?.name ? `Brand: ${brandContext.name}` : ''}
${brandContext?.industry ? `Industry: ${brandContext.industry}` : ''}
${brandContext?.targetAudience || targetAudience ? `Target Audience: ${targetAudience || brandContext?.targetAudience}` : ''}
${brandContext?.valueProposition || proposition ? `Value Proposition: ${proposition || brandContext?.valueProposition}` : ''}

CAMPAIGN BRIEF:
Business Problem: ${businessProblem}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}
${proposition ? `Core Proposition: ${proposition}` : ''}
${support?.length ? `Support Points: ${support.join(', ')}` : ''}
${tone ? `Desired Tone: ${tone}` : ''}
${mandatories?.length ? `Mandatories: ${mandatories.join(', ')}` : ''}
${successMetric ? `Success Metric: ${successMetric}` : ''}
${timeline ? `Timeline: ${timeline}` : ''}
${budget ? `Budget: ${budget}` : ''}
${constraints ? `Constraints: ${constraints}` : ''}
${whatBeenTried ? `What's Been Tried: ${whatBeenTried}` : ''}

Based on this comprehensive brief, propose 3 distinct message strategies. Each should take a meaningfully different approach to solving this business problem. Build upon the proposition provided (if any) and consider the target audience, tone requirements, and constraints.`;

    // Use the same model as the main generate endpoint
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from response
    let strategies;
    try {
      // Find JSON array in the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        strategies = JSON.parse(jsonMatch[0]);
      } else {
        console.error('No JSON array found in response:', text);
        return NextResponse.json({ error: 'Failed to parse strategy options - no JSON found' }, { status: 500 });
      }
    } catch (parseError) {
      console.error('Failed to parse strategies:', parseError, 'Response:', text);
      return NextResponse.json({ error: 'Failed to parse strategy options' }, { status: 500 });
    }

    // If campaignId provided, save to campaign
    if (campaignId && !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (campaignId && auth.userId) {
      try {
        await getSupabaseAdmin()
          .from('campaigns')
          .update({
            message_strategy_options: strategies,
            updated_at: new Date().toISOString(),
          })
          .eq('id', campaignId)
          .eq('user_id', auth.userId);
      } catch (dbError) {
        console.error('Failed to save to database:', dbError);
        // Don't fail the request if DB save fails - still return strategies
      }
    }

    return NextResponse.json({ strategies });
  } catch (error: any) {
    return apiError('Failed to generate message strategy', 500, 'Message strategy generation error:', error);
  }
}

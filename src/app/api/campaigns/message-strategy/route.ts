import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// POST - Generate message strategy options for Discovery Mode
export async function POST(request: NextRequest) {
  try {
    const {
      campaignId,
      brandContext,
      businessProblem,
      successMetric,
      timeline,
      budget,
      constraints,
      whatBeenTried,
    } = await request.json();

    if (!businessProblem) {
      return NextResponse.json({ error: 'Business problem required' }, { status: 400 });
    }

    // Build the prompt for message strategy generation
    const systemPrompt = `You are a senior marketing strategist. Your task is to analyze a business challenge and propose 3 distinct message strategies.

Each strategy should include:
1. A clear name (e.g., "Trusted Advisor Positioning", "Risk Reversal", "Peer Proof")
2. A core message (one compelling sentence)
3. An angle (the strategic approach)
4. A rationale (why this fits the situation)
5. Best for (2-3 use cases where this excels)

Return your response as a valid JSON array with exactly 3 options.

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
]`;

    const userPrompt = `BRAND CONTEXT:
${brandContext?.name ? `Brand: ${brandContext.name}` : ''}
${brandContext?.industry ? `Industry: ${brandContext.industry}` : ''}
${brandContext?.targetAudience ? `Target Audience: ${brandContext.targetAudience}` : ''}
${brandContext?.valueProposition ? `Value Proposition: ${brandContext.valueProposition}` : ''}

CAMPAIGN BRIEF:
Business Problem: ${businessProblem}
${successMetric ? `Success Metric: ${successMetric}` : ''}
${timeline ? `Timeline: ${timeline}` : ''}
${budget ? `Budget: ${budget}` : ''}
${constraints ? `Constraints: ${constraints}` : ''}
${whatBeenTried ? `What's Been Tried: ${whatBeenTried}` : ''}

Based on this brief, propose 3 distinct message strategies. Each should take a meaningfully different approach to solving this business problem. Consider the constraints and what's been tried.`;

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2000,
          },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract JSON from response
    let strategies;
    try {
      // Find JSON array in the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        strategies = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON array found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse strategies:', parseError);
      return NextResponse.json({ error: 'Failed to parse strategy options' }, { status: 500 });
    }

    // If campaignId provided, save to campaign
    if (campaignId) {
      await getSupabaseAdmin()
        .from('campaigns')
        .update({
          message_strategy_options: strategies,
          updated_at: new Date().toISOString(),
        })
        .eq('id', campaignId);
    }

    return NextResponse.json({ strategies });
  } catch (error: any) {
    console.error('Message strategy generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

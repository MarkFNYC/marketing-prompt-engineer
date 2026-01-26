import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Gemini with server-side API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface PlanningReviewRequest {
  problemStatement: string;
  targetAudience: string;
  strategy: {
    name: string;
    core_message: string;
    angle: string;
  } | null;
  mandatories: string[];
  brandContext?: {
    name: string;
    industry: string;
  };
}

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

    const body: PlanningReviewRequest = await request.json();
    const { problemStatement, targetAudience, strategy, mandatories, brandContext } = body;

    // Build the assessment prompt
    const assessmentPrompt = `You are a senior Planning Director at a top advertising agency (like DDB, Grey, or McCann). Your job is to review creative briefs before they go to the Creative team.

Review this strategic foundation and provide an honest assessment:

---
BRAND: ${brandContext?.name || 'Not specified'}
INDUSTRY: ${brandContext?.industry || 'Not specified'}

PROBLEM STATEMENT:
${problemStatement || 'Not provided'}

TARGET AUDIENCE:
${targetAudience || 'Not provided'}

SELECTED STRATEGY:
${strategy ? `
Name: ${strategy.name}
Core Message: ${strategy.core_message}
Angle: ${strategy.angle}
` : 'No strategy selected'}

MANDATORIES:
${mandatories?.length ? mandatories.map((m, i) => `${i + 1}. ${m}`).join('\n') : 'None specified'}
---

Evaluate this brief against these criteria:
1. Is there a clear, single-minded proposition?
2. Is the strategy distinctive vs. competition?
3. Is it relevant to the target audience?
4. Are the mandatories achievable and clear?
5. Is there enough direction for Creative to execute well?

Respond in this exact JSON format:
{
  "score": <number 1-10>,
  "assessment": "<2-3 sentences summarizing the brief's strength or weakness>",
  "suggestions": ["<specific improvement 1>", "<specific improvement 2>", "<specific improvement 3>"]
}

Scoring guide:
- 1-3: Brief is too weak to proceed. Critical elements missing.
- 4-5: Brief needs work. Some good elements but gaps remain.
- 6-7: Brief is workable. Minor refinements would help.
- 8-9: Brief is strong. Ready for Creative execution.
- 10: Brief is exceptional. Clear, compelling, and actionable.

Be honest and constructive. If the brief is weak, say so clearly. If it's strong, acknowledge that.
Return ONLY valid JSON, no markdown formatting.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const response = await model.generateContent(assessmentPrompt);
    const responseText = response.response.text();

    // Parse the JSON response
    try {
      // Extract JSON from the response (handle potential markdown wrapping)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const result = JSON.parse(jsonMatch[0]);

      // Validate the response structure
      if (typeof result.score !== 'number' || !result.assessment || !Array.isArray(result.suggestions)) {
        throw new Error('Invalid response structure');
      }

      // Ensure score is within bounds
      result.score = Math.max(1, Math.min(10, Math.round(result.score)));

      return NextResponse.json(result);

    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      // Return a fallback response
      return NextResponse.json({
        score: 5,
        assessment: 'Unable to fully assess the brief. Please review the strategic elements and ensure all required fields are complete.',
        suggestions: [
          'Ensure your problem statement is specific and measurable',
          'Add clear target audience details',
          'Select or refine your message strategy'
        ]
      });
    }

  } catch (error: any) {
    console.error('Planning Review API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to assess brief' },
      { status: 500 }
    );
  }
}

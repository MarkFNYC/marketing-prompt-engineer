import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Gemini with server-side API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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

    const { prompt, mode, provider, userApiKey, brandContext } = await request.json();

    // Validate input
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Build brand context string if provided
    let brandContextString = '';
    if (brandContext) {
      const parts: string[] = ['\n\n---\n\nBRAND CONTEXT:'];
      if (brandContext.brand) parts.push(`Brand: ${brandContext.brand}`);
      if (brandContext.website) parts.push(`Website: ${brandContext.website}`);
      if (brandContext.industry) parts.push(`Industry: ${brandContext.industry}`);
      if (brandContext.challenge) parts.push(`Business Challenge: ${brandContext.challenge}`);
      if (brandContext.targetAudience) {
        parts.push(`Target Audience: ${brandContext.targetAudience}`);
      }
      if (brandContext.brandVoice) {
        parts.push(`Brand Voice & Tone: ${brandContext.brandVoice}`);
        parts.push('');
        parts.push('IMPORTANT: Adapt your writing style to match the brand voice described above. Maintain this tone consistently throughout your response.');
      }
      brandContextString = parts.join('\n');
    }

    // Build system prompt based on mode
    const systemPrompt = mode === 'execution'
      ? `You are an elite marketing executor. Your job is to CREATE ready-to-use content, not explain strategy.

IMPORTANT RULES FOR EXECUTION MODE:
- Output ACTUAL content that can be copied and used immediately
- No explanations, frameworks, or "here's how to think about it"
- No bullet points of tips—give the ACTUAL deliverable
- For posts: Write the full post, ready to copy-paste
- For emails: Write the full email copy
- For hooks: Just the hooks, no explanations
- For calendars: Actual dates, actual post copy
- Use markdown formatting for clarity
- Be specific to the brand and context provided
- If brand voice is specified, STRICTLY follow that tone and style${brandContextString}`
      : `You are an elite marketing strategist. Provide detailed, actionable recommendations based on the prompt.

IMPORTANT RULES FOR STRATEGY MODE:
- Explain the thinking and frameworks behind your recommendations
- Provide examples and templates they can adapt
- Include best practices and mental models
- Help them understand WHY, not just WHAT
- Use markdown formatting for clarity
- Tailor advice specifically to the brand context provided
- If brand voice is specified, consider how to maintain it in recommendations${brandContextString}`;

    let result: string;

    // Determine which API to use
    if (provider === 'gemini' || (!userApiKey && provider !== 'openai' && provider !== 'anthropic')) {
      // Use server-side Gemini API (free tier)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const fullPrompt = `${systemPrompt}\n\n---\n\nUser request:\n${prompt}`;

      const response = await model.generateContent(fullPrompt);
      result = response.response.text();
    }
    else if (provider === 'openai' && userApiKey) {
      // Use user's OpenAI API key
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          max_tokens: 4000
        })
      });

      const data = await response.json();
      if (data.error) {
        return NextResponse.json({ error: data.error.message }, { status: 400 });
      }
      result = data.choices[0].message.content;
    }
    else if (provider === 'anthropic' && userApiKey) {
      // Use user's Anthropic API key
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': userApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          system: systemPrompt,
          messages: [
            { role: 'user', content: prompt }
          ]
        })
      });

      const data = await response.json();
      if (data.error) {
        return NextResponse.json({ error: data.error.message }, { status: 400 });
      }
      result = data.content[0].text;
    }
    else {
      // Better error message for debugging
      const errorMsg = !provider
        ? 'No provider specified'
        : provider === 'anthropic' && !userApiKey
        ? 'Anthropic selected but no API key provided. Please enter your API key in the Brand Input screen.'
        : provider === 'openai' && !userApiKey
        ? 'OpenAI selected but no API key provided. Please enter your API key in the Brand Input screen.'
        : 'Invalid provider or missing API key';
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    return NextResponse.json({ result });

  } catch (error: any) {
    console.error('Generate API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    );
  }
}

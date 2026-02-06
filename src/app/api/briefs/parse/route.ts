import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter, getClientIdentifier } from '@/lib/rate-limiter';
import { getUserIdIfPresent } from '@/lib/auth-server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Parsed brief structure
interface ParsedBrief {
  campaignName: string | null;
  objective: string | null;
  targetAudience: string | null;
  proposition: string | null;
  support: string[] | null;
  mandatories: string[] | null;
  tone: string | null;
  constraints: string | null;
  budget: string | null;
  timeline: string | null;
  successMetrics: string | null;
}

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

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const textContent = formData.get('textContent') as string | null;

    let documentText = '';

    if (textContent) {
      // Direct text content (e.g., pasted brief)
      documentText = textContent;
    } else if (file) {
      // File upload - extract text based on type
      const fileType = file.type;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (fileType === 'text/plain') {
        // Plain text file
        documentText = buffer.toString('utf-8');
      } else if (fileType === 'application/pdf') {
        // For PDF, we'll send the base64 to Gemini which can read PDFs
        const base64 = buffer.toString('base64');
        return await parseWithGeminiVision(base64, 'application/pdf');
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileType === 'application/msword'
      ) {
        // For Word docs, we'll try to extract text or use Gemini vision
        // For now, send as base64 to Gemini
        const base64 = buffer.toString('base64');
        return await parseWithGeminiVision(base64, fileType);
      } else if (fileType.startsWith('image/')) {
        // Image of a brief - use Gemini vision
        const base64 = buffer.toString('base64');
        return await parseWithGeminiVision(base64, fileType);
      } else {
        // Try to read as text
        documentText = buffer.toString('utf-8');
      }
    } else {
      return NextResponse.json({ error: 'No file or text content provided' }, { status: 400 });
    }

    // Parse text content with Gemini
    return await parseWithGeminiText(documentText);
  } catch (error: any) {
    console.error('Brief parsing error:', error);
    return NextResponse.json({ error: error.message || 'Failed to parse brief' }, { status: 500 });
  }
}

async function parseWithGeminiText(text: string): Promise<NextResponse> {
  const prompt = buildExtractionPrompt(text);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2000,
        },
      }),
    }
  );

  const data = await response.json();

  if (data.error) {
    return NextResponse.json({ error: data.error.message }, { status: 500 });
  }

  const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return parseGeminiResponse(responseText);
}

async function parseWithGeminiVision(base64: string, mimeType: string): Promise<NextResponse> {
  const textPrompt = `You are analyzing a creative brief document. Extract the following information from this document and return it as JSON.

Extract these fields (use null if not found):
- campaignName: The campaign or project name
- objective: The goal/objective of the campaign (what they want to achieve)
- targetAudience: Who they're trying to reach
- proposition: The key message, core promise, or single-minded proposition
- support: Array of proof points, reasons to believe, or supporting evidence
- mandatories: Array of must-include elements or non-negotiables
- tone: The tone of voice or brand voice guidelines
- constraints: Any limitations or things to avoid
- budget: The budget if mentioned
- timeline: Key dates or timeline
- successMetrics: How success will be measured (KPIs)

Return ONLY valid JSON in this exact format:
{
  "campaignName": "string or null",
  "objective": "string or null",
  "targetAudience": "string or null",
  "proposition": "string or null",
  "support": ["array", "of", "strings"] or null,
  "mandatories": ["array", "of", "strings"] or null,
  "tone": "string or null",
  "constraints": "string or null",
  "budget": "string or null",
  "timeline": "string or null",
  "successMetrics": "string or null"
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64,
                },
              },
              { text: textPrompt },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2000,
        },
      }),
    }
  );

  const data = await response.json();

  if (data.error) {
    return NextResponse.json({ error: data.error.message }, { status: 500 });
  }

  const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return parseGeminiResponse(responseText);
}

function buildExtractionPrompt(documentText: string): string {
  return `You are analyzing a creative brief document. Extract the following information and return it as JSON.

DOCUMENT CONTENT:
---
${documentText}
---

Extract these fields (use null if not found in the document):
- campaignName: The campaign or project name
- objective: The goal/objective of the campaign (what they want to achieve)
- targetAudience: Who they're trying to reach
- proposition: The key message, core promise, or single-minded proposition
- support: Array of proof points, reasons to believe, or supporting evidence
- mandatories: Array of must-include elements or non-negotiables
- tone: The tone of voice or brand voice guidelines
- constraints: Any limitations or things to avoid
- budget: The budget if mentioned
- timeline: Key dates or timeline
- successMetrics: How success will be measured (KPIs)

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "campaignName": "string or null",
  "objective": "string or null",
  "targetAudience": "string or null",
  "proposition": "string or null",
  "support": ["array", "of", "strings"] or null,
  "mandatories": ["array", "of", "strings"] or null,
  "tone": "string or null",
  "constraints": "string or null",
  "budget": "string or null",
  "timeline": "string or null",
  "successMetrics": "string or null"
}`;
}

function parseGeminiResponse(responseText: string): NextResponse {
  try {
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed: ParsedBrief = JSON.parse(jsonMatch[0]);

      // Count how many fields were extracted
      const extractedFields = Object.entries(parsed).filter(
        ([_, value]) => value !== null && value !== undefined &&
        (Array.isArray(value) ? value.length > 0 : true)
      );

      // Identify missing fields
      const allFields = [
        'campaignName', 'objective', 'targetAudience', 'proposition',
        'support', 'mandatories', 'tone', 'constraints', 'budget',
        'timeline', 'successMetrics'
      ];
      const missingFields = allFields.filter(
        field => !parsed[field as keyof ParsedBrief] ||
        (Array.isArray(parsed[field as keyof ParsedBrief]) &&
          (parsed[field as keyof ParsedBrief] as any[]).length === 0)
      );

      return NextResponse.json({
        parsed,
        extractedCount: extractedFields.length,
        missingFields,
        totalFields: allFields.length,
      });
    } else {
      return NextResponse.json({ error: 'Could not parse response as JSON' }, { status: 500 });
    }
  } catch (parseError) {
    console.error('JSON parse error:', parseError);
    return NextResponse.json({ error: 'Failed to parse extracted data' }, { status: 500 });
  }
}

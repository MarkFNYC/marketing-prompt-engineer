import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { apiError } from '@/lib/api-error';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// GET - Fetch personas for a project
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
  }

  // For now, return empty array - personas stored in localStorage
  // Future: fetch from Supabase
  return NextResponse.json({ personas: [] });
}

// POST - Generate or create persona
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, projectId, industry, targetAudience, challenge, personaData } = body;

    if (action === 'generate') {
      // Generate personas using AI
      if (!industry) {
        return NextResponse.json({ error: 'Industry required for generation' }, { status: 400 });
      }

      const prompt = `You are a marketing strategist creating detailed buyer personas. Based on the following business context, generate 3 distinct, realistic buyer personas.

BUSINESS CONTEXT:
- Industry: ${industry}
${targetAudience ? `- Current Target Audience Understanding: ${targetAudience}` : ''}
${challenge ? `- Business Challenge: ${challenge}` : ''}

For each persona, provide:
1. A memorable name and title (e.g., "Sarah, The Justice Reform Catalyst")
2. Role/Job title
3. A vivid 2-3 sentence description capturing who they are
4. Demographics (age range, location type, income level)
5. Psychographics (values, attitudes, lifestyle)
6. 3-4 specific pain points related to ${industry}
7. 3-4 goals they're trying to achieve
8. 3-4 key behaviors (how they research, buy, consume content)
9. Preferred channels (where they spend time, how they prefer to be reached)
10. A representative quote that captures their mindset
11. An emoji that represents them

Make each persona DISTINCTLY different - vary their seniority, priorities, and communication preferences. Make them feel like real people, not stereotypes.

Respond in this exact JSON format:
{
  "personas": [
    {
      "name": "Full Name, The [Descriptor]",
      "role": "Job Title at Company Type",
      "description": "2-3 sentences describing who they are and what drives them",
      "demographics": "Age range, location type, income bracket",
      "psychographics": "Values, attitudes, lifestyle descriptors",
      "pain_points": ["Pain point 1", "Pain point 2", "Pain point 3"],
      "goals": ["Goal 1", "Goal 2", "Goal 3"],
      "behaviors": ["Behavior 1", "Behavior 2", "Behavior 3"],
      "preferred_channels": ["Channel 1", "Channel 2", "Channel 3"],
      "quote": "A quote that captures their mindset",
      "avatar_emoji": "🎯"
    }
  ]
}`;

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return NextResponse.json({ error: 'Failed to parse persona response' }, { status: 500 });
      }

      try {
        const parsed = JSON.parse(jsonMatch[0]);
        const personas = parsed.personas.map((p: any, index: number) => ({
          id: `generated-${Date.now()}-${index}`,
          ...p,
          is_generated: true,
          project_id: projectId,
          created_at: new Date().toISOString(),
        }));

        return NextResponse.json({ personas });
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return NextResponse.json({ error: 'Failed to parse generated personas' }, { status: 500 });
      }
    }

    if (action === 'create') {
      // Manually create a persona
      if (!personaData || !personaData.name || !personaData.role) {
        return NextResponse.json({ error: 'Name and role required' }, { status: 400 });
      }

      const persona = {
        id: `manual-${Date.now()}`,
        ...personaData,
        is_generated: false,
        project_id: projectId,
        created_at: new Date().toISOString(),
      };

      return NextResponse.json({ persona });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return apiError('Failed to process persona request', 500, 'Personas API error:', error);
  }
}

// DELETE - Remove a persona
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const personaId = searchParams.get('id');

  if (!personaId) {
    return NextResponse.json({ error: 'Persona ID required' }, { status: 400 });
  }

  // For now, just acknowledge - actual deletion happens in localStorage
  // Future: delete from Supabase
  return NextResponse.json({ success: true });
}

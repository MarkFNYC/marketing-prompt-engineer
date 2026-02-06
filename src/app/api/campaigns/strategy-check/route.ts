import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { getUserIdIfPresent } from '@/lib/auth-server';
import { apiError } from '@/lib/api-error';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Discipline to typical goal mapping
const DISCIPLINE_GOAL_ALIGNMENT: Record<string, string[]> = {
  seo: ['awareness', 'consideration'],
  'paid-media': ['awareness', 'consideration', 'conversion'],
  lifecycle: ['retention', 'conversion'],
  content: ['awareness', 'consideration'],
  cro: ['conversion'],
  linkedin: ['awareness', 'consideration'],
  blog: ['awareness', 'consideration'],
  email: ['conversion', 'retention'],
  social: ['awareness', 'consideration'],
};

// POST - Perform strategy check for Directed Mode
export async function POST(request: NextRequest) {
  try {
    const auth = await getUserIdIfPresent(request);
    if ('error' in auth) return auth.error;

    const {
      userId,
      campaignId,
      discipline,
      goalType,
      goalDescription,
      brandContext,
    } = await request.json();

    if (!discipline || !goalType) {
      return NextResponse.json({ error: 'Discipline and goal type required' }, { status: 400 });
    }

    if (userId && auth.userId && userId !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Quick alignment check
    const alignedGoals = DISCIPLINE_GOAL_ALIGNMENT[discipline] || [];
    const isAligned = alignedGoals.includes(goalType);

    let severity: 'none' | 'mild' | 'strong' = 'none';
    let recommendation = '';
    let alternativeDisciplines: string[] = [];

    if (!isAligned) {
      // Determine severity based on mismatch
      if (goalType === 'conversion' && ['content', 'blog', 'social'].includes(discipline)) {
        severity = 'strong';
      } else if (goalType === 'retention' && ['seo', 'paid-media', 'social'].includes(discipline)) {
        severity = 'strong';
      } else {
        severity = 'mild';
      }

      // Find better-aligned disciplines
      alternativeDisciplines = Object.entries(DISCIPLINE_GOAL_ALIGNMENT)
        .filter(([_, goals]) => goals.includes(goalType))
        .map(([disc]) => disc)
        .slice(0, 3);

      // Generate recommendation using AI for more nuanced feedback
      if (severity === 'strong') {
        const prompt = `A user wants to use ${discipline} tactics for a ${goalType} goal.
Their specific goal: ${goalDescription || goalType}
Industry: ${brandContext?.industry || 'not specified'}

This is a misalignment. In 1-2 sentences, explain why ${discipline} typically doesn't serve ${goalType} goals well, and suggest what would work better. Be helpful, not dismissive.`;

        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 200 },
              }),
            }
          );
          const data = await response.json();
          recommendation = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } catch (e) {
          // Fallback to static message
          recommendation = `${discipline} typically serves ${alignedGoals.join(' and ')} goals. For ${goalType}, consider ${alternativeDisciplines.slice(0, 2).join(' or ')}.`;
        }
      } else {
        // Mild misalignment - static message
        recommendation = `Consider also adding ${alternativeDisciplines[0]} to strengthen your ${goalType} results.`;
      }
    }

    // Log the strategy check for analytics
    if (auth.userId) {
      await getSupabaseAdmin()
        .from('strategy_checks')
        .insert({
          user_id: auth.userId,
          campaign_id: campaignId || null,
          discipline,
          goal_type: goalType,
          goal_description: goalDescription,
          misalignment_severity: severity,
          recommendation_shown: recommendation || null,
          alternative_disciplines: alternativeDisciplines.length > 0 ? alternativeDisciplines : null,
          check_result: 'shown',
        });
    }

    // Update campaign if provided
    if (campaignId && !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (campaignId && auth.userId) {
      await getSupabaseAdmin()
        .from('campaigns')
        .update({
          strategy_check_shown: true,
          strategy_check_recommendation: recommendation || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', campaignId)
        .eq('user_id', auth.userId);
    }

    return NextResponse.json({
      aligned: isAligned,
      severity,
      recommendation,
      alternativeDisciplines,
    });
  } catch (error: any) {
    return apiError('Strategy check failed', 500, 'Strategy check error:', error);
  }
}

// PUT - Record user's response to strategy check
export async function PUT(request: NextRequest) {
  try {
    const auth = await getUserIdIfPresent(request);
    if ('error' in auth) return auth.error;
    if (!auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { strategyCheckId, campaignId, response } = await request.json();

    if (!response || !['accepted', 'overridden', 'dismissed'].includes(response)) {
      return NextResponse.json({ error: 'Valid response required' }, { status: 400 });
    }

    // Update strategy check record
    if (strategyCheckId) {
      await getSupabaseAdmin()
        .from('strategy_checks')
        .update({ check_result: response })
        .eq('id', strategyCheckId)
        .eq('user_id', auth.userId);
    }

    // Update campaign
    if (campaignId) {
      await getSupabaseAdmin()
        .from('campaigns')
        .update({
          strategy_check_user_response: response,
          updated_at: new Date().toISOString(),
        })
        .eq('id', campaignId)
        .eq('user_id', auth.userId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return apiError('Failed to record strategy check response', 500, 'Strategy check response error:', error);
  }
}

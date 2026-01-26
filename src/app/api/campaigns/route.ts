import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

// GET - Fetch user's campaigns (optionally filtered by brand)
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const brandId = request.nextUrl.searchParams.get('brandId');
    const status = request.nextUrl.searchParams.get('status'); // 'active' | 'completed' | 'all'

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    let query = getSupabaseAdmin()
      .from('campaigns')
      .select('*')
      .eq('user_id', userId)
      .is('archived_at', null)
      .order('updated_at', { ascending: false });

    if (brandId) {
      query = query.eq('brand_id', brandId);
    }

    if (status === 'active') {
      query = query.is('completed_at', null);
    } else if (status === 'completed') {
      query = query.not('completed_at', 'is', null);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ campaigns: data });
  } catch (error: any) {
    console.error('Campaigns GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      brandId,
      name,
      mode,
      discipline,
      // Discovery Mode fields
      businessProblem,
      successMetric,
      successMetricValue,
      timeline,
      budget,
      campaignConstraints,
      whatBeenTried,
      // Directed Mode fields
      goalType,
      goalDescription,
      campaignMandatories,
    } = body;

    if (!userId || !brandId || !name || !mode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const campaignData: Record<string, any> = {
      user_id: userId,
      brand_id: brandId,
      name,
      mode,
    };

    // Add mode-specific fields
    if (mode === 'discovery') {
      if (businessProblem) campaignData.business_problem = businessProblem;
      if (successMetric) campaignData.success_metric = successMetric;
      if (successMetricValue) campaignData.success_metric_value = successMetricValue;
      if (timeline) campaignData.timeline = timeline;
      if (budget) campaignData.budget = budget;
      if (campaignConstraints) campaignData.campaign_constraints = campaignConstraints;
      if (whatBeenTried) campaignData.what_been_tried = whatBeenTried;
    } else if (mode === 'directed') {
      if (discipline) campaignData.discipline = discipline;
      if (goalType) campaignData.goal_type = goalType;
      if (goalDescription) campaignData.goal_description = goalDescription;
      if (campaignMandatories) campaignData.campaign_mandatories = campaignMandatories;
    }

    const { data, error } = await getSupabaseAdmin()
      .from('campaigns')
      .insert(campaignData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ campaign: data });
  } catch (error: any) {
    console.error('Campaigns POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update campaign
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, userId, ...updates } = body;

    if (!id || !userId) {
      return NextResponse.json({ error: 'ID and User ID required' }, { status: 400 });
    }

    // Map camelCase to snake_case for database
    const dbUpdates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    const fieldMap: Record<string, string> = {
      name: 'name',
      mode: 'mode',
      discipline: 'discipline',
      businessProblem: 'business_problem',
      successMetric: 'success_metric',
      successMetricValue: 'success_metric_value',
      timeline: 'timeline',
      budget: 'budget',
      campaignConstraints: 'campaign_constraints',
      whatBeenTried: 'what_been_tried',
      goalType: 'goal_type',
      goalDescription: 'goal_description',
      campaignMandatories: 'campaign_mandatories',
      messageStrategyOptions: 'message_strategy_options',
      selectedMessageStrategy: 'selected_message_strategy',
      mediaStrategyOptions: 'media_strategy_options',
      selectedMediaStrategy: 'selected_media_strategy',
      strategyCheckShown: 'strategy_check_shown',
      strategyCheckRecommendation: 'strategy_check_recommendation',
      strategyCheckUserResponse: 'strategy_check_user_response',
      outcome: 'outcome',
      outcomeNotes: 'outcome_notes',
      outcomeMetrics: 'outcome_metrics',
      completedAt: 'completed_at',
    };

    for (const [key, value] of Object.entries(updates)) {
      if (fieldMap[key] && value !== undefined) {
        dbUpdates[fieldMap[key]] = value;
      }
    }

    const { data, error } = await getSupabaseAdmin()
      .from('campaigns')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ campaign: data });
  } catch (error: any) {
    console.error('Campaigns PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Archive campaign (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const { id, userId } = await request.json();

    if (!id || !userId) {
      return NextResponse.json({ error: 'ID and User ID required' }, { status: 400 });
    }

    const { error } = await getSupabaseAdmin()
      .from('campaigns')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Campaigns DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

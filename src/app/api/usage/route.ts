import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

const FREE_TIER_LIMIT = 15;

// GET - Get usage for a user
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // Profile doesn't exist, create it
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          prompts_used: 0,
          prompts_limit: FREE_TIER_LIMIT,
          tier: 'free',
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Check if we need to reset monthly usage
    if (profile && new Date(profile.prompts_reset_at) <= new Date()) {
      await supabaseAdmin
        .from('profiles')
        .update({
          prompts_used_this_month: 0,
          prompts_reset_at: getFirstOfNextMonth(),
        })
        .eq('id', userId);

      return NextResponse.json({
        prompts_used: 0,
        prompts_limit: profile.tier === 'premium' ? Infinity : FREE_TIER_LIMIT,
        tier: profile.tier,
      });
    }

    return NextResponse.json({
      prompts_used: profile?.prompts_used_this_month || 0,
      prompts_limit: profile?.tier === 'premium' ? Infinity : FREE_TIER_LIMIT,
      tier: profile?.tier || 'free',
    });
  } catch (error: any) {
    console.error('Usage GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Increment usage
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Get current profile
    let { data: profile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Create profile if it doesn't exist
    if (fetchError && fetchError.code === 'PGRST116') {
      const { data: newProfile } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          tier: 'free',
          prompts_used_this_month: 1,
          prompts_reset_at: getFirstOfNextMonth(),
        })
        .select()
        .single();

      return NextResponse.json({
        prompts_used: 1,
        prompts_limit: FREE_TIER_LIMIT,
      });
    }

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Check limit
    if (profile.tier === 'free' && profile.prompts_used_this_month >= FREE_TIER_LIMIT) {
      return NextResponse.json({
        error: 'Monthly limit reached',
        prompts_used: profile.prompts_used_this_month,
        prompts_limit: FREE_TIER_LIMIT,
      }, { status: 403 });
    }

    // Increment usage
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ prompts_used_this_month: profile.prompts_used_this_month + 1 })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      prompts_used: updated.prompts_used_this_month,
      prompts_limit: profile.tier === 'premium' ? Infinity : FREE_TIER_LIMIT,
    });
  } catch (error: any) {
    console.error('Usage POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getFirstOfNextMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
}

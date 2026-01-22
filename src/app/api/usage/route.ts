import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

const FREE_TIER_LIMIT = 15;

// GET - Get current usage for user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        prompts_used: 0,
        prompts_limit: FREE_TIER_LIMIT,
        tier: 'free'
      });
    }

    const adminClient = createAdminClient();

    // Get or create user profile
    let { data: profile, error } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist, create it
      const { data: newProfile, error: createError } = await adminClient
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          tier: 'free',
          prompts_used_this_month: 0,
          prompts_reset_at: getFirstOfNextMonth(),
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
      }
      profile = newProfile;
    }

    // Check if we need to reset monthly usage
    if (profile && new Date(profile.prompts_reset_at) <= new Date()) {
      const { data: updatedProfile } = await adminClient
        .from('profiles')
        .update({
          prompts_used_this_month: 0,
          prompts_reset_at: getFirstOfNextMonth(),
        })
        .eq('id', user.id)
        .select()
        .single();
      profile = updatedProfile;
    }

    return NextResponse.json({
      authenticated: true,
      prompts_used: profile?.prompts_used_this_month || 0,
      prompts_limit: profile?.tier === 'premium' ? Infinity : FREE_TIER_LIMIT,
      tier: profile?.tier || 'free',
      email: user.email,
    });
  } catch (error) {
    console.error('Usage GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Increment usage after running a prompt
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // Get current profile
    const { data: profile, error: fetchError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (fetchError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if at limit (for free tier)
    if (profile.tier === 'free' && profile.prompts_used_this_month >= FREE_TIER_LIMIT) {
      return NextResponse.json({
        error: 'Monthly limit reached',
        prompts_used: profile.prompts_used_this_month,
        prompts_limit: FREE_TIER_LIMIT,
      }, { status: 403 });
    }

    // Increment usage
    const { data: updatedProfile, error: updateError } = await adminClient
      .from('profiles')
      .update({
        prompts_used_this_month: profile.prompts_used_this_month + 1,
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating usage:', updateError);
      return NextResponse.json({ error: 'Failed to update usage' }, { status: 500 });
    }

    return NextResponse.json({
      prompts_used: updatedProfile.prompts_used_this_month,
      prompts_limit: profile.tier === 'premium' ? Infinity : FREE_TIER_LIMIT,
    });
  } catch (error) {
    console.error('Usage POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getFirstOfNextMonth(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString();
}

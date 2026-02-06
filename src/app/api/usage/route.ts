import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { requireUserId } from '@/lib/auth-server';
import { requireOrigin } from '@/lib/csrf';
import { apiError } from '@/lib/api-error';

const FREE_TIER_LIMIT = 25;
const PREMIUM_TIER_LIMIT = Number.MAX_SAFE_INTEGER;

// GET - Get usage for a user
export async function GET(request: NextRequest) {
  try {
    const auth = await requireUserId(request);
    if ('error' in auth) return auth.error;
    const userId = auth.userId;

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
      return apiError('Failed to fetch usage data', 500, 'Usage GET query error:', error);
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
        prompts_limit: profile.tier === 'premium' ? PREMIUM_TIER_LIMIT : FREE_TIER_LIMIT,
        tier: profile.tier,
      });
    }

    return NextResponse.json({
      prompts_used: profile?.prompts_used_this_month || 0,
      prompts_limit: profile?.tier === 'premium' ? PREMIUM_TIER_LIMIT : FREE_TIER_LIMIT,
      tier: profile?.tier || 'free',
    });
  } catch (error: any) {
    return apiError('Failed to fetch usage data', 500, 'Usage GET error:', error);
  }
}

// POST - Increment usage
export async function POST(request: NextRequest) {
  try {
    // CSRF protection: validate request origin
    const originError = requireOrigin(request);
    if (originError) return originError;

    const auth = await requireUserId(request);
    if ('error' in auth) return auth.error;
    const userId = auth.userId;

    const { userId: bodyUserId } = await request.json();
    if (bodyUserId && bodyUserId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
      return apiError('Failed to fetch usage data', 500, 'Usage POST fetch error:', fetchError);
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
      return apiError('Failed to update usage data', 500, 'Usage POST update error:', updateError);
    }

    return NextResponse.json({
      prompts_used: updated.prompts_used_this_month,
      prompts_limit: profile.tier === 'premium' ? PREMIUM_TIER_LIMIT : FREE_TIER_LIMIT,
    });
  } catch (error: any) {
    return apiError('Failed to update usage', 500, 'Usage POST error:', error);
  }
}

function getFirstOfNextMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
}

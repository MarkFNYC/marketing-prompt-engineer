import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { requireUserId } from '@/lib/auth-server';
import { apiError } from '@/lib/api-error';

// GET - Export all user data as a downloadable JSON file
export async function GET(request: NextRequest) {
  try {
    const auth = await requireUserId(request);
    if ('error' in auth) return auth.error;
    const userId = auth.userId;

    const supabaseAdmin = getSupabaseAdmin();

    // Fetch all user data in parallel
    const [
      { data: profile, error: profileError },
      { data: projects, error: projectsError },
      { data: campaigns, error: campaignsError },
      { data: savedContent, error: savedContentError },
      { data: strategyChecks, error: strategyChecksError },
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('id', userId).single(),
      supabaseAdmin.from('projects').select('*').eq('user_id', userId),
      supabaseAdmin.from('campaigns').select('*').eq('user_id', userId),
      supabaseAdmin.from('saved_content').select('*').eq('user_id', userId),
      supabaseAdmin.from('strategy_checks').select('*').eq('user_id', userId),
    ]);

    if (profileError && profileError.code !== 'PGRST116') {
      return apiError('Failed to export user data', 500, 'Export profile error:', profileError);
    }
    if (projectsError) {
      return apiError('Failed to export user data', 500, 'Export projects error:', projectsError);
    }
    if (campaignsError) {
      return apiError('Failed to export user data', 500, 'Export campaigns error:', campaignsError);
    }
    if (savedContentError) {
      return apiError('Failed to export user data', 500, 'Export saved content error:', savedContentError);
    }
    if (strategyChecksError) {
      return apiError('Failed to export user data', 500, 'Export strategy checks error:', strategyChecksError);
    }

    // Get user email from Supabase auth
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (userError || !user) {
      return NextResponse.json({ error: 'Failed to retrieve user account' }, { status: 500 });
    }

    // Strip sensitive fields from profile
    const sanitizedProfile = profile ? { ...profile } : null;
    if (sanitizedProfile && 'stripe_customer_id' in sanitizedProfile) {
      delete sanitizedProfile.stripe_customer_id;
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      account: {
        email: user.email,
        id: userId,
      },
      profile: sanitizedProfile,
      projects: projects || [],
      campaigns: campaigns || [],
      savedContent: savedContent || [],
      strategyChecks: strategyChecks || [],
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="amplify-data-export.json"',
      },
    });
  } catch (error: any) {
    return apiError('Failed to export user data', 500, 'User data export error:', error);
  }
}

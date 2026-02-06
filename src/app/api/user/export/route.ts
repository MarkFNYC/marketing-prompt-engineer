import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { requireUserId } from '@/lib/auth-server';

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
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }
    if (projectsError) {
      return NextResponse.json({ error: projectsError.message }, { status: 500 });
    }
    if (campaignsError) {
      return NextResponse.json({ error: campaignsError.message }, { status: 500 });
    }
    if (savedContentError) {
      return NextResponse.json({ error: savedContentError.message }, { status: 500 });
    }
    if (strategyChecksError) {
      return NextResponse.json({ error: strategyChecksError.message }, { status: 500 });
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
    console.error('User data export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

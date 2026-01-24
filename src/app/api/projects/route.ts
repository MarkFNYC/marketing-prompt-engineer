import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

// GET - Fetch user's projects
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ projects: data });
  } catch (error: any) {
    console.error('Projects GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new project
export async function POST(request: NextRequest) {
  try {
    const { userId, name, website, industry, challenge, targetAudience, brandVoice } = await request.json();

    if (!userId || !name || !industry || !challenge) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from('projects')
      .insert({
        user_id: userId,
        name,
        website: website || '',
        industry,
        challenge,
        target_audience: targetAudience || '',
        brand_voice: brandVoice || '',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ project: data });
  } catch (error: any) {
    console.error('Projects POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update project
export async function PUT(request: NextRequest) {
  try {
    const { id, userId, name, website, industry, challenge, targetAudience, brandVoice } = await request.json();

    if (!id || !userId) {
      return NextResponse.json({ error: 'ID and User ID required' }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from('projects')
      .update({
        name,
        website: website || '',
        industry,
        challenge,
        target_audience: targetAudience || '',
        brand_voice: brandVoice || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ project: data });
  } catch (error: any) {
    console.error('Projects PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete project
export async function DELETE(request: NextRequest) {
  try {
    const { id, userId } = await request.json();

    if (!id || !userId) {
      return NextResponse.json({ error: 'ID and User ID required' }, { status: 400 });
    }

    const { error } = await getSupabaseAdmin()
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Projects DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

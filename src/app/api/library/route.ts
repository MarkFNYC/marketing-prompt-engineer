import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

const supabaseAdmin = { from: (table: string) => getSupabaseAdmin().from(table) };

// GET - Fetch user's saved content (optionally filtered by project)
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const projectId = request.nextUrl.searchParams.get('projectId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    let query = supabaseAdmin
      .from('saved_content')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Filter by project if provided
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data });
  } catch (error: any) {
    console.error('Library GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Save new content
export async function POST(request: NextRequest) {
  try {
    const { userId, projectId, title, discipline, mode, promptGoal, content } = await request.json();

    if (!userId || !title || !discipline || !mode || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('saved_content')
      .insert({
        user_id: userId,
        project_id: projectId || null,
        title,
        discipline,
        mode,
        prompt_goal: promptGoal,
        content,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: data });
  } catch (error: any) {
    console.error('Library POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove saved content
export async function DELETE(request: NextRequest) {
  try {
    const { id, userId } = await request.json();

    if (!id || !userId) {
      return NextResponse.json({ error: 'ID and User ID required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('saved_content')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Library DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

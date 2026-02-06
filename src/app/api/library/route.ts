import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { requireUserId } from '@/lib/auth-server';
import { apiError } from '@/lib/api-error';

const supabaseAdmin = { from: (table: string) => getSupabaseAdmin().from(table) };

// GET - Fetch user's saved content (optionally filtered by project)
export async function GET(request: NextRequest) {
  try {
    const auth = await requireUserId(request);
    if ('error' in auth) return auth.error;
    const userId = auth.userId;
    const projectId = request.nextUrl.searchParams.get('projectId');

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
      return apiError('Failed to fetch library', 500, 'Library GET query error:', error);
    }

    return NextResponse.json({ items: data });
  } catch (error: any) {
    return apiError('Failed to fetch library', 500, 'Library GET error:', error);
  }
}

// POST - Save new content
export async function POST(request: NextRequest) {
  try {
    const auth = await requireUserId(request);
    if ('error' in auth) return auth.error;
    const userId = auth.userId;

    const { userId: bodyUserId, projectId, title, discipline, mode, promptGoal, content } = await request.json();

    if (bodyUserId && bodyUserId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!title || !discipline || !mode || !content) {
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
      return apiError('Failed to save content', 500, 'Library POST insert error:', error);
    }

    return NextResponse.json({ item: data });
  } catch (error: any) {
    return apiError('Failed to save content', 500, 'Library POST error:', error);
  }
}

// DELETE - Remove saved content
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireUserId(request);
    if ('error' in auth) return auth.error;
    const userId = auth.userId;

    const { id, userId: bodyUserId } = await request.json();

    if (bodyUserId && bodyUserId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('saved_content')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return apiError('Failed to delete content', 500, 'Library DELETE query error:', error);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return apiError('Failed to delete content', 500, 'Library DELETE error:', error);
  }
}

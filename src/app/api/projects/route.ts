import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { requireUserId } from '@/lib/auth-server';

// GET - Fetch user's projects
export async function GET(request: NextRequest) {
  try {
    const auth = await requireUserId(request);
    if ('error' in auth) return auth.error;
    const userId = auth.userId;

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
    const auth = await requireUserId(request);
    if ('error' in auth) return auth.error;
    const userId = auth.userId;

    const {
      userId: bodyUserId,
      name,
      website,
      industry,
      challenge,
      targetAudience,
      brandVoice,
      valueProposition,
      persistentMandatories,
      persistentConstraints,
    } = await request.json();

    if (bodyUserId && bodyUserId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!name || !industry || !challenge) {
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
        value_proposition: valueProposition || '',
        persistent_mandatories: persistentMandatories || [],
        persistent_constraints: persistentConstraints || '',
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
    const auth = await requireUserId(request);
    if ('error' in auth) return auth.error;
    const userId = auth.userId;

    const {
      id,
      userId: bodyUserId,
      name,
      website,
      industry,
      challenge,
      targetAudience,
      brandVoice,
      valueProposition,
      persistentMandatories,
      persistentConstraints,
    } = await request.json();

    if (bodyUserId && bodyUserId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    // Only update fields that are provided
    if (name !== undefined) updateData.name = name;
    if (website !== undefined) updateData.website = website || '';
    if (industry !== undefined) updateData.industry = industry;
    if (challenge !== undefined) updateData.challenge = challenge;
    if (targetAudience !== undefined) updateData.target_audience = targetAudience || '';
    if (brandVoice !== undefined) updateData.brand_voice = brandVoice || '';
    if (valueProposition !== undefined) updateData.value_proposition = valueProposition || '';
    if (persistentMandatories !== undefined) updateData.persistent_mandatories = persistentMandatories || [];
    if (persistentConstraints !== undefined) updateData.persistent_constraints = persistentConstraints || '';

    const { data, error } = await getSupabaseAdmin()
      .from('projects')
      .update(updateData)
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

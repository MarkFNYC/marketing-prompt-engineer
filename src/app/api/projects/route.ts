import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { requireUserId } from '@/lib/auth-server';
import { requireOrigin } from '@/lib/csrf';
import { apiError } from '@/lib/api-error';
import { projectPostSchema, projectPutSchema, projectDeleteSchema } from '@/lib/validations';

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
      return apiError('Failed to fetch projects', 500, 'Projects GET query error:', error);
    }

    return NextResponse.json({ projects: data });
  } catch (error: any) {
    return apiError('Failed to fetch projects', 500, 'Projects GET error:', error);
  }
}

// POST - Create new project
export async function POST(request: NextRequest) {
  try {
    // CSRF protection: validate request origin
    const originError = requireOrigin(request);
    if (originError) return originError;

    const auth = await requireUserId(request);
    if ('error' in auth) return auth.error;
    const userId = auth.userId;

    const body = await request.json();
    const parsed = projectPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
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
    } = parsed.data;

    if (bodyUserId && bodyUserId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
      return apiError('Failed to create project', 500, 'Projects POST insert error:', error);
    }

    return NextResponse.json({ project: data });
  } catch (error: any) {
    return apiError('Failed to create project', 500, 'Projects POST error:', error);
  }
}

// PUT - Update project
export async function PUT(request: NextRequest) {
  try {
    // CSRF protection: validate request origin
    const originError = requireOrigin(request);
    if (originError) return originError;

    const auth = await requireUserId(request);
    if ('error' in auth) return auth.error;
    const userId = auth.userId;

    const body = await request.json();
    const parsed = projectPutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'A valid project ID is required' }, { status: 400 });
    }
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
    } = parsed.data;

    if (bodyUserId && bodyUserId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
      return apiError('Failed to update project', 500, 'Projects PUT update error:', error);
    }

    return NextResponse.json({ project: data });
  } catch (error: any) {
    return apiError('Failed to update project', 500, 'Projects PUT error:', error);
  }
}

// DELETE - Delete project
export async function DELETE(request: NextRequest) {
  try {
    // CSRF protection: validate request origin
    const originError = requireOrigin(request);
    if (originError) return originError;

    const auth = await requireUserId(request);
    if ('error' in auth) return auth.error;
    const userId = auth.userId;

    const body = await request.json();
    const parsed = projectDeleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'A valid project ID is required' }, { status: 400 });
    }
    const { id, userId: bodyUserId } = parsed.data;

    if (bodyUserId && bodyUserId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await getSupabaseAdmin()
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return apiError('Failed to delete project', 500, 'Projects DELETE query error:', error);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return apiError('Failed to delete project', 500, 'Projects DELETE error:', error);
  }
}

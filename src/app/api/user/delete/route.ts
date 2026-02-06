import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { getStripe } from '@/lib/stripe';
import { requireUserId } from '@/lib/auth-server';

// POST - Delete user account
export async function POST(request: NextRequest) {
  try {
    const auth = await requireUserId(request);
    if ('error' in auth) return auth.error;
    const userId = auth.userId;

    const { confirmEmail } = await request.json();

    if (!confirmEmail) {
      return NextResponse.json(
        { error: 'Email confirmation is required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Verify the confirmation email matches the user's actual email
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.getUserById(userId);

    if (authError || !authUser?.user) {
      return NextResponse.json(
        { error: 'Unable to verify user identity' },
        { status: 500 }
      );
    }

    if (authUser.user.email !== confirmEmail) {
      return NextResponse.json(
        { error: 'Email does not match your account' },
        { status: 400 }
      );
    }

    // Check for active Stripe subscription and cancel if present
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_subscription_id')
      .eq('id', userId)
      .single();

    if (profile?.stripe_subscription_id) {
      try {
        const stripe = getStripe();
        await stripe.subscriptions.cancel(profile.stripe_subscription_id);
      } catch (stripeError: any) {
        console.error('Stripe subscription cancellation error:', stripeError);
        // Continue with deletion even if Stripe cancellation fails
      }
    }

    // Delete user data in order (respects FK constraints)
    const tables = [
      'strategy_checks',
      'saved_content',
      'campaigns',
      'projects',
      'profiles',
    ];

    for (const table of tables) {
      const column = table === 'profiles' ? 'id' : 'user_id';
      const { error: deleteError } = await supabaseAdmin
        .from(table)
        .delete()
        .eq(column, userId);

      if (deleteError) {
        console.error(`Error deleting from ${table}:`, deleteError);
        return NextResponse.json(
          { error: 'Failed to delete account data' },
          { status: 500 }
        );
      }
    }

    // Delete the auth user
    const { error: deleteAuthError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteAuthError) {
      console.error('Error deleting auth user:', deleteAuthError);
      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

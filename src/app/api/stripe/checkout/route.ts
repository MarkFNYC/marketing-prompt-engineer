import { NextRequest, NextResponse } from 'next/server';
import { getStripe, getStripePrices } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { requireUserId } from '@/lib/auth-server';
import { requireOrigin } from '@/lib/csrf';
import { apiError } from '@/lib/api-error';
import { stripeCheckoutSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    // CSRF protection: validate request origin
    const originError = requireOrigin(request);
    if (originError) return originError;

    const auth = await requireUserId(request);
    if ('error' in auth) return auth.error;
    const userId = auth.userId;

    const body = await request.json();
    const parsed = stripeCheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const { priceType = 'monthly' } = parsed.data;

    const stripe = getStripe();
    const prices = getStripePrices();
    const priceId = priceType === 'yearly' ? prices.yearly : prices.monthly;

    if (!priceId) {
      return apiError('Checkout configuration error', 500, `Missing STRIPE_PRICE_ID_${priceType.toUpperCase()} environment variable`);
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Get user email from Supabase auth
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has a Stripe customer ID
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    let customerId = profile?.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: userId,
        },
      });
      customerId = customer.id;

      // Save customer ID to profile
      await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId,
          stripe_customer_id: customerId,
        }, { onConflict: 'id' });
    }

    // Get the origin for redirect URLs
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}?upgrade=success`,
      cancel_url: `${origin}?upgrade=cancelled`,
      metadata: {
        supabase_user_id: userId,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: userId,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return apiError('Failed to create checkout session', 500, 'Stripe checkout error:', error);
  }
}

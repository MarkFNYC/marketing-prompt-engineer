import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import Stripe from 'stripe';

// Disable body parsing - we need the raw body for webhook verification
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;

        if (userId) {
          // Update user to premium tier
          await supabaseAdmin
            .from('profiles')
            .upsert({
              id: userId,
              tier: 'premium',
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
            }, { onConflict: 'id' });

          console.log(`User ${userId} upgraded to premium`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;

        if (userId) {
          const isActive = ['active', 'trialing'].includes(subscription.status);

          await supabaseAdmin
            .from('profiles')
            .update({
              tier: isActive ? 'premium' : 'free',
              stripe_subscription_id: subscription.id,
            })
            .eq('id', userId);

          console.log(`User ${userId} subscription updated: ${subscription.status}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;

        if (userId) {
          // Downgrade to free tier
          await supabaseAdmin
            .from('profiles')
            .update({
              tier: 'free',
              stripe_subscription_id: null,
            })
            .eq('id', userId);

          console.log(`User ${userId} subscription cancelled, downgraded to free`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Find user by customer ID and optionally notify them
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          console.log(`Payment failed for user ${profile.id}`);
          // You could send an email notification here
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

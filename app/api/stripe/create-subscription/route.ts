import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { StripeService } from '@/lib/stripe/service';
import { getServerSupabaseAction } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, email, name, priceId } = await request.json();
    
    if (!userId || !email || !priceId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, email, and priceId are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = await getServerSupabaseAction();
    
    // Get user from Supabase to verify they exist
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email, name')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create or get existing Stripe customer
    const customer = await StripeService.createCustomer(
      userId,
      email,
      name || user.name
    );

    // Create subscription
    const subscription = await StripeService.createSubscription(
      userId,
      customer.id,
      priceId
    );

    // Store subscription in database
    const { error: subError } = await supabase.from('user_subscriptions').insert([
      {
        user_id: userId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: customer.id,
        plan_id: priceId, // This should be mapped to our plan_id
        status: subscription.status,
        current_period_start: subscription.start_date ? new Date(subscription.start_date * 1000).toISOString() : null,
        current_period_end: null, // Stripe Subscription doesn't have current_period_end, using null for now
        trial_start: subscription.trial_start ? new Date(subscription.trial_start! * 1000).toISOString() : null,
        trial_end: subscription.trial_end ? new Date(subscription.trial_end! * 1000).toISOString() : null,
        cancel_at_period_end: subscription.cancel_at_period_end,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    if (subError) {
      console.error('Error storing subscription:', subError);
      return new Response(
        JSON.stringify({ error: 'Failed to store subscription in database' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          customer: customer.id,
          payment_intent: typeof subscription.latest_invoice === 'string' 
            ? null 
            : (subscription.latest_invoice as Stripe.Invoice & { payment_intent: string | Stripe.PaymentIntent })?.payment_intent,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating subscription:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create subscription' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

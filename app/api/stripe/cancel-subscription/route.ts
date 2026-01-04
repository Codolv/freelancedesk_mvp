import { NextRequest } from 'next/server';
import { StripeService } from '@/lib/stripe/service';
import { getServerSupabaseAction } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, subscriptionId } = await request.json();
    
    if (!userId || !subscriptionId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId and subscriptionId are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = await getServerSupabaseAction();
    
    // Verify the subscription belongs to the user
    const { data: userSubscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('stripe_subscription_id, status')
      .eq('user_id', userId)
      .eq('stripe_subscription_id', subscriptionId)
      .single();

    if (subError || !userSubscription) {
      return new Response(
        JSON.stringify({ error: 'Subscription not found or does not belong to user' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (userSubscription.status === 'canceled') {
      return new Response(
        JSON.stringify({ error: 'Subscription is already canceled' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Cancel subscription in Stripe
    const stripeSubscription = await StripeService.cancelSubscription(subscriptionId);

    // Update subscription status in database
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        status: stripeSubscription.status,
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (updateError) {
      console.error('Error updating subscription in database:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update subscription status in database' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        subscription: {
          id: stripeSubscription.id,
          status: stripeSubscription.status,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to cancel subscription' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

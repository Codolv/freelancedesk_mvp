import { NextRequest } from 'next/server';
import { StripeService } from '@/lib/stripe/service';
import { getServerSupabaseAction } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: userId is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get user subscription from database
    const userSubscription = await StripeService.getUserSubscription(userId);

    if (!userSubscription) {
      return new Response(
        JSON.stringify({
          success: true,
          subscription: null,
          hasActiveSubscription: false,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get subscription details from Stripe to ensure it's up to date
    let stripeSubscription;
    try {
      stripeSubscription = await StripeService.getSubscription(userSubscription.stripe_subscription_id);
    } catch (error) {
      console.error('Error fetching subscription from Stripe:', error);
      // Use database data if Stripe call fails
      stripeSubscription = null;
    }

    const subscriptionStatus = stripeSubscription || userSubscription;
    const isActive = subscriptionStatus.status === 'active' || subscriptionStatus.status === 'trialing';

    return new Response(
      JSON.stringify({
        success: true,
        subscription: {
          id: subscriptionStatus.id || userSubscription.id,
          status: subscriptionStatus.status || userSubscription.status,
          current_period_start: subscriptionStatus.current_period_start || userSubscription.current_period_start,
          current_period_end: subscriptionStatus.current_period_end || userSubscription.current_period_end,
          trial_start: subscriptionStatus.trial_start || userSubscription.trial_start,
          trial_end: subscriptionStatus.trial_end || userSubscription.trial_end,
          cancel_at_period_end: subscriptionStatus.cancel_at_period_end || userSubscription.cancel_at_period_end,
          created_at: userSubscription.created_at,
          updated_at: userSubscription.updated_at,
        },
        hasActiveSubscription: isActive,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch user subscription' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

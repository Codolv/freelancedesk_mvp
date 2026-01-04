import { NextRequest } from 'next/server';
import { StripeService } from '@/lib/stripe/service';

export async function GET(request: NextRequest) {
  try {
    const plans = await StripeService.getSubscriptionPlans();

    return new Response(
      JSON.stringify({
        success: true,
        plans: plans.map(plan => ({
          id: plan.id,
          name: plan.name,
          description: plan.description,
          price: plan.price_cents / 100, // Convert cents to dollars/euros
          currency: plan.currency,
          interval: plan.interval,
          stripe_price_id: plan.stripe_price_id,
          features: plan.features,
        })),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch subscription plans' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

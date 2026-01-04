import { NextRequest } from 'next/server';
import { StripeService } from '@/lib/stripe/service';
import { getServerSupabaseAction } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, returnUrl } = await request.json();
    
    if (!userId || !returnUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId and returnUrl are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = await getServerSupabaseAction();
    
    // Get user's subscription to find their customer ID
    const { data: userSubscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subError || !userSubscription) {
      return new Response(
        JSON.stringify({ error: 'No subscription found for user' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create billing portal session
    const portalSession = await StripeService.createBillingPortalSession(
      userSubscription.stripe_customer_id,
      returnUrl
    );

    return new Response(
      JSON.stringify({
        success: true,
        url: portalSession.url,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating portal session:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create billing portal session' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

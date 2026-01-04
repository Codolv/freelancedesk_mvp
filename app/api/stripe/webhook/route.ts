import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { StripeService } from '@/lib/stripe/service';
import { getServerSupabaseAction } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

 if (!sig || !webhookSecret) {
    return new Response('Webhook secret not configured', { status: 40 });
  }

  try {
    const event = await StripeService.constructWebhookEvent(
      Buffer.from(body),
      sig,
      webhookSecret
    );

    switch (event.type) {
      case 'customer.created':
        await handleCustomerCreated(event);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event);
        break;
      case 'invoice.created':
        await handleInvoiceCreated(event);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Webhook error', { status: 400 });
  }
}

async function handleCustomerCreated(event: Stripe.Event) {
  const customer = event.data.object as Stripe.Customer;
  console.log('Customer created:', customer.id);
  // Customer is already linked to user via metadata in the service
}

async function handleSubscriptionCreated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const supabase = await getServerSupabaseAction();

  // Get user ID from customer metadata
  const customer = await StripeService.getCustomer(subscription.customer as string);
  const userId = (customer as Stripe.Customer).metadata?.user_id;

  if (!userId) {
    console.error('No user ID found in customer metadata');
    return;
  }

  // Insert subscription into database
 const { error } = await supabase.from('user_subscriptions').insert([
    {
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      plan_id: subscription.items.data[0].price.id, // This will need to be mapped to our plan_id
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

  if (error) {
    console.error('Error inserting subscription:', error);
  }

  console.log('Subscription created:', subscription.id);
}

async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const supabase = await getServerSupabaseAction();

  // Update subscription in database
 const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: subscription.status,
      current_period_start: subscription.start_date ? new Date(subscription.start_date * 1000).toISOString() : null,
      current_period_end: null, // Stripe Subscription doesn't have current_period_end, using null for now
      trial_start: subscription.trial_start ? new Date(subscription.trial_start! * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end! * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription:', error);
  }

  console.log('Subscription updated:', subscription.id);
}

async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const supabase = await getServerSupabaseAction();

  // Update subscription status to canceled
 const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating canceled subscription:', error);
  }

 console.log('Subscription canceled:', subscription.id);
}

async function handleInvoicePaymentSucceeded(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const supabase = await getServerSupabaseAction();

  // Find the subscription for this invoice
  let subscriptionId: string | null = null;
  
  // Check if invoice has a parent with subscription details
  if (invoice.parent && invoice.parent.type === 'subscription_details') {
    const parentSub = invoice.parent.subscription_details?.subscription;
    subscriptionId = typeof parentSub === 'string' ? parentSub : parentSub?.id || null;
  }
  
  // Fallback: check if there's a direct subscription reference (though this doesn't exist in the type)
  // This is just to handle any edge cases
  if (!subscriptionId) {
    console.error('No subscription ID found in invoice:', invoice.id);
    return;
  }
  
  const { data: subscriptionData, error: subError } = await supabase
    .from('user_subscriptions')
    .select('id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (subError || !subscriptionData) {
    console.error('Error finding subscription for invoice:', subError);
    return;
  }

  // Update invoice status in database
 const { error } = await supabase
    .from('subscription_invoices')
    .update({
      status: 'paid',
    })
    .eq('stripe_invoice_id', invoice.id);

  if (error) {
    console.error('Error updating invoice status:', error);
  }

 console.log('Invoice payment succeeded:', invoice.id);
}

async function handleInvoicePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const supabase = await getServerSupabaseAction();

  // Find the subscription for this invoice
  let subscriptionId: string | null = null;
  
  // Check if invoice has a parent with subscription details
  if (invoice.parent && invoice.parent.type === 'subscription_details') {
    const parentSub = invoice.parent.subscription_details?.subscription;
    subscriptionId = typeof parentSub === 'string' ? parentSub : parentSub?.id || null;
  }
  
  if (!subscriptionId) {
    console.error('No subscription ID found in invoice:', invoice.id);
    return;
  }

  const { data: subscriptionData, error: subError } = await supabase
    .from('user_subscriptions')
    .select('id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (subError || !subscriptionData) {
    console.error('Error finding subscription for invoice:', subError);
    return;
  }

 // Update invoice status in database
 const { error } = await supabase
    .from('subscription_invoices')
    .update({
      status: 'failed',
    })
    .eq('stripe_invoice_id', invoice.id);

  if (error) {
    console.error('Error updating failed invoice status:', error);
  }

  console.log('Invoice payment failed:', invoice.id);
}

async function handleInvoiceCreated(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const supabase = await getServerSupabaseAction();

  // Find the subscription for this invoice
  let subscriptionId: string | null = null;
  
  // Check if invoice has a parent with subscription details
  if (invoice.parent && invoice.parent.type === 'subscription_details') {
    const parentSub = invoice.parent.subscription_details?.subscription;
    subscriptionId = typeof parentSub === 'string' ? parentSub : parentSub?.id || null;
  }
  
  if (!subscriptionId) {
    console.error('No subscription ID found in invoice:', invoice.id);
    return;
  }

  const { data: subscriptionData, error: subError } = await supabase
    .from('user_subscriptions')
    .select('id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (subError || !subscriptionData) {
    console.error('Error finding subscription for invoice:', subError);
    return;
  }

  // Create invoice record in database
 const { error } = await supabase.from('subscription_invoices').insert([
    {
      subscription_id: subscriptionData.id,
      stripe_invoice_id: invoice.id,
      stripe_payment_intent_id: null, // Stripe Invoice doesn't have payment_intent property, using null for now
      amount_cents: invoice.amount_due,
      currency: invoice.currency,
      status: invoice.status,
      period_start: invoice.period_start ? new Date(invoice.period_start! * 1000).toISOString() : null,
      period_end: invoice.period_end ? new Date(invoice.period_end! * 1000).toISOString() : null,
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    console.error('Error creating invoice record:', error);
  }

  console.log('Invoice created:', invoice.id);
}

import Stripe from 'stripe';
import { getServerSupabaseAction } from '@/lib/supabase/server';
import { env } from '@/env';

const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
});

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_cents: number;
 currency: string;
  interval: 'month' | 'year';
  stripe_price_id: string;
  features: string[];
}

export interface UserSubscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
 stripe_customer_id: string;
  plan_id: string;
 status: string;
 current_period_start: string | null;
  current_period_end: string | null;
  trial_start: string | null;
  trial_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionInvoice {
  id: string;
  subscription_id: string;
  stripe_invoice_id: string;
  stripe_payment_intent_id: string | null;
 amount_cents: number;
  currency: string;
  status: string;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
}

export class StripeService {
  static async createCustomer(userId: string, email: string, name?: string) {
    const supabase = await getServerSupabaseAction();
    
    try {
      // Check if customer already exists in database
      const { data: existingSub, error: existingError } = await supabase
        .from('user_subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single();

      if (existingSub?.stripe_customer_id) {
        // Return existing customer
        return { id: existingSub.stripe_customer_id };
      }

      // Create new customer in Stripe
      const customer = await stripe.customers.create({
        email,
        name: name || undefined,
        metadata: {
          user_id: userId,
        },
      });

      return customer;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw error;
    }
  }

  static async createSubscription(
    userId: string,
    stripeCustomerId: string,
    stripePriceId: string
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [
          {
            price: stripePriceId,
          },
        ],
        payment_behavior: 'default_incomplete',
        expand: [
          'latest_invoice.payment_intent'
        ],
      });

      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
 }

  static async cancelSubscription(stripeSubscriptionId: string) {
    try {
      const subscription = await stripe.subscriptions.cancel(stripeSubscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
 }

  static async updateSubscription(
    stripeSubscriptionId: string,
    stripePriceId: string
  ) {
    try {
      const subscription = await stripe.subscriptions.update(stripeSubscriptionId, {
        items: [
          {
            id: stripeSubscriptionId,
            price: stripePriceId,
          },
        ],
      });
      return subscription;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

 static async createBillingPortalSession(
    stripeCustomerId: string,
    returnUrl: string
 ) {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: returnUrl,
      });
      return session;
    } catch (error) {
      console.error('Error creating billing portal session:', error);
      throw error;
    }
  }

  static async getSubscription(stripeSubscriptionId: string) {
    try {
      const subscription = await stripe.subscriptions.retrieve(
        stripeSubscriptionId,
        {
          expand: ['items.data.price.product'],
        }
      );
      return subscription;
    } catch (error) {
      console.error('Error getting subscription:', error);
      throw error;
    }
  }

 static async getCustomer(customerId: string) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      return customer;
    } catch (error) {
      console.error('Error getting customer:', error);
      throw error;
    }
  }

 static async constructWebhookEvent(
    payload: Buffer,
    signature: string,
    webhookSecret: string
  ) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );
      return event;
    } catch (error) {
      console.error('Error constructing webhook event:', error);
      throw error;
    }
  }

  static async getSubscriptionPlans() {
    const supabase = await getServerSupabaseAction();
    
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('active', true)
      .order('price_cents', { ascending: true });

    if (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }

    return data.map(plan => ({
      ...plan,
      features: plan.features as string[],
    }));
  }

 static async getUserSubscription(userId: string) {
    const supabase = await getServerSupabaseAction();
    
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No subscription found
        return null;
      }
      console.error('Error fetching user subscription:', error);
      throw error;
    }

    return data;
  }

  static async updateSubscriptionInDatabase(
    stripeSubscriptionId: string,
    updates: Partial<UserSubscription>
  ) {
    const supabase = await getServerSupabaseAction();
    
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating subscription in database:', error);
      throw error;
    }

    return data;
  }

  static async createSubscriptionInvoiceInDatabase(
    subscriptionId: string,
    stripeInvoiceData: Stripe.Invoice & { payment_intent?: string | Stripe.PaymentIntent | null }
  ) {
    const supabase = await getServerSupabaseAction();
    
    const { data, error } = await supabase
      .from('subscription_invoices')
      .insert({
        subscription_id: subscriptionId,
        stripe_invoice_id: stripeInvoiceData.id,
        stripe_payment_intent_id: stripeInvoiceData.payment_intent ? typeof stripeInvoiceData.payment_intent === 'string' ? stripeInvoiceData.payment_intent : stripeInvoiceData.payment_intent?.id || null : null,
        amount_cents: stripeInvoiceData.amount_due,
        currency: stripeInvoiceData.currency,
        status: stripeInvoiceData.status,
        period_start: stripeInvoiceData.period_start ? new Date(stripeInvoiceData.period_start * 100).toISOString() : null,
        period_end: stripeInvoiceData.period_end ? new Date(stripeInvoiceData.period_end * 1000).toISOString() : null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating subscription invoice:', error);
      throw error;
    }

    return data;
 }
}

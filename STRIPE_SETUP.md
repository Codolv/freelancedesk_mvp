# Stripe Subscription Setup Guide

This document explains how to set up and configure Stripe for the Freelancedesk MVP subscription system.

## Prerequisites

- Stripe account (https://dashboard.stripe.com/register)
- Stripe API keys
- Webhook endpoint configured

## Step 1: Create Stripe Products and Prices

1. Go to your Stripe Dashboard (https://dashboard.stripe.com/products)
2. Create products for your subscription plans:
   - Basic Plan
   - Pro Plan  
   - Enterprise Plan
3. For each product, create prices:
   - Monthly recurring price
   - Yearly recurring price (with discount)

Example product creation:
```
Product: "Freelancedesk Basic"
Price: €9.99/month (ID: price_basic_monthly)
Price: €99.90/year (ID: price_basic_yearly)  // 10% discount
```

## Step 2: Update Database with Real Stripe Price IDs

Replace the placeholder price IDs in the database with your actual Stripe price IDs:

1. Access your Supabase dashboard
2. Go to the `subscription_plans` table
3. Update the `stripe_price_id` column with your actual Stripe price IDs

Example SQL update:
```sql
UPDATE subscription_plans 
SET stripe_price_id = 'price_123456789' 
WHERE name = 'Basic Plan';
```

## Step 3: Configure Environment Variables

Add your Stripe keys to `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Step 4: Set Up Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Set the endpoint URL to: `https://yourdomain.com/api/stripe/webhook`
4. Select the following events:
   - `customer.created`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `invoice.created`
5. Copy the signing secret and add it to your environment variables

## Step 5: Testing

### Test with Stripe CLI (Recommended)

1. Install Stripe CLI: `npm install -g stripe`
2. Login: `stripe login`
3. Listen to webhooks: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4. Copy the webhook signing secret provided by Stripe CLI
5. Use test cards for payment testing

### Manual Testing

1. Create a test customer in your app
2. Subscribe to a test plan using test card: `4242 4242 4242 4242`
3. Verify subscription appears in your database
4. Check that webhooks are processed correctly

## Test Cards for Different Scenarios

- Successful payment: `4242 4242 4242 4242`
- Declined card: `4000 0000 0000 0002`
- Insufficient funds: `4000 0000 0000 0003`
- Incorrect number: `4242 4242 4242 4241`

## Common Issues and Troubleshooting

### Webhook Issues
- Ensure your webhook endpoint is publicly accessible
- Verify webhook signature using the secret key
- Check that all required events are enabled

### Database Sync Issues
- Ensure subscription status updates are properly handled
- Verify that customer IDs are stored correctly
- Check that billing portal sessions work properly

### Payment Issues
- Verify that price IDs match Stripe dashboard
- Ensure customer creation happens before subscription
- Check that payment methods are properly attached

## Production Checklist

- [ ] Use live Stripe keys (not test keys)
- [ ] Ensure webhook endpoint is HTTPS
- [ ] Set up proper monitoring and logging
- [ ] Test all subscription scenarios
- [ ] Verify data privacy compliance
- [ ] Set up proper error handling
- [ ] Configure automated emails (optional)

## API Endpoints

- `POST /api/stripe/create-subscription` - Create new subscription
- `POST /api/stripe/cancel-subscription` - Cancel subscription
- `POST /api/stripe/create-portal-session` - Create billing portal session
- `GET /api/stripe/plans` - Get available subscription plans
- `GET /api/stripe/user-subscription` - Get user's subscription status
- `POST /api/stripe/webhook` - Handle Stripe webhooks

## Components

- `PricingPlans` - Display available subscription plans
- `SubscriptionManagement` - Manage user's subscription
- `BillingPortalButton` - Button to access billing portal
- `SubscriptionGuard` - Protect routes based on subscription status
- `SubscriptionProvider` - Context provider for subscription data

Your Stripe subscription system is now ready for use!

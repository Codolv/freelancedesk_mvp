-- Create subscription plans table
CREATE TABLE subscription_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price_cents INTEGER NOT NULL, -- Price in cents
    currency TEXT DEFAULT 'EUR',
    interval TEXT NOT NULL, -- 'month', 'year'
    stripe_price_id TEXT NOT NULL, -- Stripe price ID
    active BOOLEAN DEFAULT TRUE,
    features JSONB, -- Features included in the plan
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user subscriptions table
CREATE TABLE user_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    stripe_subscription_id TEXT NOT NULL, -- Stripe subscription ID
    stripe_customer_id TEXT NOT NULL, -- Stripe customer ID
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    status TEXT NOT NULL, -- 'active', 'canceled', 'past_due', 'unpaid', 'incomplete', 'incomplete_expired', 'trialing', 'paused'
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription invoices table
CREATE TABLE subscription_invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    subscription_id UUID NOT NULL REFERENCES user_subscriptions(id),
    stripe_invoice_id TEXT NOT NULL, -- Stripe invoice ID
    stripe_payment_intent_id TEXT, -- Payment intent ID
    amount_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'EUR',
    status TEXT NOT NULL, -- 'draft', 'open', 'paid', 'uncollectible', 'void'
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_stripe_subscription_id ON user_subscriptions(stripe_subscription_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_subscription_invoices_subscription_id ON subscription_invoices(subscription_id);
CREATE INDEX idx_subscription_invoices_stripe_invoice_id ON subscription_invoices(stripe_invoice_id);

-- Enable Row Level Security for subscription tables
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_invoices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Subscription plans policies (public read, admin write)
CREATE POLICY "Anyone can view active subscription plans" ON subscription_plans FOR SELECT USING (active = true);
CREATE POLICY "Admin can manage subscription plans" ON subscription_plans FOR ALL USING (auth.role() = 'service_role');

-- User subscriptions policies (users can view their own)
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON user_subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Subscription invoices policies (users can view their own)
CREATE POLICY "Users can view own subscription invoices" ON subscription_invoices FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_subscriptions 
        WHERE user_subscriptions.id = subscription_id AND user_subscriptions.user_id = auth.uid()
    )
);

-- Insert sample subscription plans
-- Note: You'll need to replace the stripe_price_id with actual Stripe price IDs from your Stripe dashboard

INSERT INTO subscription_plans (name, description, price_cents, currency, interval, stripe_price_id, features, active)
VALUES 
  (
    'Basic Plan',
    'Perfect for freelancers getting started',
    999, -- €9.99
    'EUR',
    'month',
    'price_basic_123', -- Replace with your actual Stripe price ID
    '["Up to 5 projects", "Basic file sharing", "Email support", "1GB storage"]'::jsonb,
    true
  ),
 (
    'Pro Plan', 
    'For growing businesses and agencies',
    2999, -- €29.99
    'EUR',
    'month',
    'price_pro_123', -- Replace with your actual Stripe price ID
    '["Unlimited projects", "Advanced file sharing", "Priority support", "10GB storage", "Team collaboration", "Advanced reporting"]'::jsonb,
    true
  ),
  (
    'Enterprise Plan',
    'For large organizations with advanced needs',
    9999, -- €99.9
    'EUR', 
    'month',
    'price_enterprise_123', -- Replace with your actual Stripe price ID
    '["Unlimited projects", "Unlimited storage", "24/7 dedicated support", "Custom integrations", "Advanced security", "SSO"]'::jsonb,
    true
  );

-- You can also add yearly plans
INSERT INTO subscription_plans (name, description, price_cents, currency, interval, stripe_price_id, features, active)
VALUES 
  (
    'Basic Plan - Annual',
    'Perfect for freelancers getting started (billed yearly)',
    990, -- €99.90 yearly (10% discount)
    'EUR',
    'year',
    'price_basic_yearly_123', -- Replace with your actual Stripe price ID
    '["Up to 5 projects", "Basic file sharing", "Email support", "1GB storage"]'::jsonb,
    true
  );

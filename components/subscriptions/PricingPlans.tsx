'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Motion } from '@/components/custom/Motion';

interface SubscriptionPlan {
  id: string;
  name: string;
 description: string;
 price: number;
 currency: string;
 interval: 'month' | 'year';
  stripe_price_id: string;
 features: string[];
}

export default function PricingPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
 const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month');
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/stripe/plans');
      const data = await response.json();
      
      if (data.success) {
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (priceId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/signin';
      return;
    }

    try {
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          priceId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to Stripe checkout or show success message
        alert('Subscription created successfully!');
        // In a real app, you might redirect to a success page or update the UI
      } else {
        alert(data.error || 'Failed to create subscription');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      alert('Failed to create subscription');
    }
 };

  const filteredPlans = plans.filter(plan => plan.interval === billingCycle);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-muted-foreground">Loading plans...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Choose Your Plan</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Select the perfect plan for your needs. All plans include our core features with options for more advanced functionality.
        </p>
        
        <div className="flex justify-center items-center gap-4 mt-8">
          <span className={`text-sm font-medium ${billingCycle === 'month' ? 'text-foreground' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'month' ? 'year' : 'month')}
            className="relative rounded-full w-12 h-6 bg-muted transition-colors"
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-foreground rounded-full transition-transform ${
                billingCycle === 'month' ? 'left-1' : 'left-7'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${billingCycle === 'year' ? 'text-foreground' : 'text-muted-foreground'}`}>
            Yearly
            <Badge variant="secondary" className="ml-2">Save 10%</Badge>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {filteredPlans.map((plan, index) => (
          <Motion
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {plan.name.includes('Pro') && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge variant="default">Most Popular</Badge>
              </div>
            )}
            
            <Card className={plan.name.includes('Pro') ? "border-primary border-2 shadow-lg" : ""}>
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    {plan.price.toFixed(2)}
                  </span>
                  <span className="text-muted-foreground">/{billingCycle}</span>
                </div>
                
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handleSubscribe(plan.stripe_price_id)}
                >
                  Get {plan.name}
                </Button>
              </CardFooter>
            </Card>
          </Motion>
        ))}
      </div>
    </div>
  );
}

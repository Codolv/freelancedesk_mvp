'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Motion } from '@/components/custom/Motion';

interface UserSubscription {
  id: string;
 status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_start: string | null;
  trial_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export default function SubscriptionManagement() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
 const [billingLoading, setBillingLoading] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchUserSubscription();
  }, []);

  const fetchUserSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        return;
      }

      const response = await fetch(`/api/stripe/user-subscription?userId=${user.id}`);
      const data = await response.json();

      if (data.success) {
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    if (!confirm('Are you sure you want to cancel your subscription? This will end your access at the end of the current billing period.')) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        return;
      }

      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          subscriptionId: subscription.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubscription(data.subscription);
        alert('Subscription canceled successfully!');
      } else {
        alert(data.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('Failed to cancel subscription');
    }
  };

  const handleManageBilling = async () => {
    setBillingLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        return;
      }

      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          returnUrl: window.location.href,
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to open billing portal');
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      alert('Failed to open billing portal');
    } finally {
      setBillingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-muted-foreground">Loading subscription details...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Motion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Your Subscription</CardTitle>
            <CardDescription>
              Manage your subscription and billing information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold capitalize">{subscription.status}</h3>
                    <p className="text-sm text-muted-foreground">
                      {subscription.status === 'active' ? 'Active' : 
                       subscription.status === 'canceled' ? 'Canceled' : 
                       subscription.status === 'trialing' ? 'In Trial' : 'Inactive'}
                    </p>
                  </div>
                  <Badge 
                    variant={
                      subscription.status === 'active' ? 'default' :
                      subscription.status === 'canceled' ? 'destructive' :
                      subscription.status === 'trialing' ? 'secondary' : 'outline'
                    }
                  >
                    {subscription.status}
                  </Badge>
                </div>

                {subscription.current_period_end && (
                  <div className="text-sm">
                    <p className="font-medium">
                      Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {subscription.cancel_at_period_end && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      Your subscription will end on{' '}
                      {subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'the billing date'}.
                      {' '}You can resume anytime before then.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  You don't have an active subscription yet.
                </p>
                <Button asChild>
                  <a href="/pricing">Choose a Plan</a>
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2">
            {subscription && subscription.status === 'active' && (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleManageBilling}
                  disabled={billingLoading}
                >
                  {billingLoading ? 'Loading...' : 'Manage Billing'}
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleCancelSubscription}
                >
                  Cancel Subscription
                </Button>
              </>
            )}
            {subscription && subscription.status === 'canceled' && (
              <Button asChild>
                <a href="/pricing">Reactivate Subscription</a>
              </Button>
            )}
            {!subscription && (
              <Button asChild>
                <a href="/pricing">Choose a Plan</a>
              </Button>
            )}
          </CardFooter>
        </Card>
      </Motion>
    </div>
  );
}

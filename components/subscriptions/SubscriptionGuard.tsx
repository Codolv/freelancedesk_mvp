'use client';

import { useEffect, ReactNode } from 'react';
import { useSubscription } from '@/lib/subscription/context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, AlertCircle } from 'lucide-react';

interface SubscriptionGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectToPricing?: boolean;
}

export default function SubscriptionGuard({ 
  children, 
  fallback, 
  redirectToPricing = true 
}: SubscriptionGuardProps) {
  const { hasActiveSubscription, loading, subscription } = useSubscription();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !hasActiveSubscription && redirectToPricing) {
      router.push('/pricing');
    }
  }, [hasActiveSubscription, loading, redirectToPricing, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-muted-foreground">Checking subscription status...</div>
      </div>
    );
  }

 if (!hasActiveSubscription) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex justify-center items-center h-64">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <AlertCircle className="h-5 w-5" />
              <CardTitle>Subscription Required</CardTitle>
            </div>
            <CardDescription>
              You need an active subscription to access this feature.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Upgrade to access premium features and continue using our service.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <a href="/pricing">
                <CreditCard className="h-4 w-4 mr-2" />
                Choose a Plan
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

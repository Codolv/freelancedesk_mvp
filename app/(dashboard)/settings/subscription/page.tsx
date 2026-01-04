import { getServerSupabaseComponent } from '@/lib/supabase/server';
import SubscriptionManagement from '@/components/subscriptions/SubscriptionManagement';
import { Motion } from '@/components/custom/Motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Shield, Users, BarChart3 } from 'lucide-react';
import { getLocale } from '@/lib/i18n/server';
import { dictionaries } from '@/lib/i18n/dictionaries';

export default async function SubscriptionPage() {
  const supabase = await getServerSupabaseComponent();
  const locale = await getLocale();
  const dict = dictionaries[locale];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        {dict['signin.title'] || 'Sign in required'}
      </div>
    );
  }

  return (
    <Motion
      className="w-full max-w-4xl mx-auto py-10 space-y-10 px-4"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <CreditCard className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {dict['settings.subscription'] || 'Subscription Settings'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {dict['settings.subscription.description'] || 'Manage your subscription and billing information'}
          </p>
        </div>
      </div>

      {/* Subscription Management */}
      <SubscriptionManagement />

      {/* Additional Subscription Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billing Cycle</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Monthly</div>
            <p className="text-xs text-muted-foreground">Auto-renewing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Billing</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Jan 1, 2024</div>
            <p className="text-xs text-muted-foreground">€9.99</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant="default">Active</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Premium access</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-green-500" />
              <span>Unlimited team members</span>
            </div>
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <span>Advanced analytics</span>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-green-500" />
              <span>Priority support</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-500" />
              <span>Enhanced security</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Motion>
  );
}

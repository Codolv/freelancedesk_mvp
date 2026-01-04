import { getServerSupabaseComponent } from '@/lib/supabase/server';
import PricingPlans from '@/components/subscriptions/PricingPlans';
import { Motion } from '@/components/custom/Motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, CreditCard, Shield, Users } from 'lucide-react';
import { getLocale } from '@/lib/i18n/server';
import { dictionaries } from '@/lib/i18n/dictionaries';

export default async function PricingPage() {
  const supabase = await getServerSupabaseComponent();
  const locale = await getLocale();
  const dict = dictionaries[locale];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <Motion
      className="w-full max-w-7xl mx-auto py-10 space-y-10 px-4"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <CreditCard className="h-8 w-8 text-muted-foreground" />
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              {dict['pricing.title'] || 'Pricing Plans'}
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              {dict['pricing.subtitle'] || 'Choose the perfect plan for your needs'}
            </p>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <CardTitle className="text-lg">Core Features</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Unlimited Projects</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Advanced Reporting</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Team Collaboration</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">Team Features</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Unlimited Team Members</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Role Management</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Shared Workspaces</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-5 w-5 text-purple-500" />
              <CardTitle className="text-lg">Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>2FA Authentication</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>SSO Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Advanced Encryption</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-lg">Support</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Email Support</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Priority Support</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Dedicated Account Manager</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Plans */}
      <PricingPlans />

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Can I change plans later?</h4>
            <p className="text-muted-foreground">
              Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated based on your billing cycle.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
            <p className="text-muted-foreground">
              We accept all major credit cards including Visa, Mastercard, and American Express.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Do you offer refunds?</h4>
            <p className="text-muted-foreground">
              We offer a 30-day money-back guarantee for all our plans. No questions asked.
            </p>
          </div>
        </CardContent>
      </Card>
    </Motion>
  );
}

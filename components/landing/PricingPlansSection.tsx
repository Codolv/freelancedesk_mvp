'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getServerSupabaseComponent } from '@/lib/supabase/server';
import { StripeService } from '@/lib/stripe/service';

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

export default function PricingPlansSection() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
 const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      // Fetch plans from the same API route used by the pricing page
      const response = await fetch('/api/stripe/plans');
      const data = await response.json();
      
      if (data.success) {
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      // Set some fallback plans if API fails
      setPlans([
        {
          id: 'free',
          name: 'Free',
          description: 'Perfect for getting started',
          price: 0,
          currency: 'EUR',
          interval: 'month',
          stripe_price_id: '',
          features: ['1 Kunde', '1 Projekt', 'Branding sichtbar'],
        },
        {
          id: 'starter',
          name: 'Starter',
          description: 'For growing freelancers',
          price: 9,
          currency: 'EUR',
          interval: 'month',
          stripe_price_id: '',
          features: ['Bis 5 Kunden', 'PDF-Rechnungen', 'Branding anpassbar'],
        },
        {
          id: 'pro',
          name: 'Pro',
          description: 'For professionals',
          price: 29,
          currency: 'EUR',
          interval: 'month',
          stripe_price_id: '',
          features: ['Unbegrenzt', 'Stripe', 'White-Label'],
        },
        {
          id: 'agency',
          name: 'Agentur',
          description: 'For agencies',
          price: 79,
          currency: 'EUR',
          interval: 'month',
          stripe_price_id: '',
          features: ['Teams', 'Kundengruppen', 'Branding'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter(plan => plan.interval === billingCycle);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-muted-foreground">Lade Pläne...</div>
      </div>
    );
  }

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  return (
    <div className="flex justify-center w-full px-4">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 justify-items-center max-w-6xl w-full"
      >
        {filteredPlans.map((plan, index) => (
          <motion.div
            key={plan.id}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className={`p-6 rounded-2xl border text-center bg-card shadow-sm ${
              plan.name.includes('Pro') || plan.name.includes('Starter') 
                ? "border-primary/50 shadow-md" 
                : "border-border"
            }`}
          >
            <h3 className="font-semibold text-lg">{plan.name}</h3>
            <div className="text-2xl font-bold mt-3">
              {plan.price === 0 ? '0 €' : `${plan.price} €/${billingCycle === 'month' ? 'Monat' : 'Jahr'}`}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {plan.features.join(' • ')}
            </p>
            <Button
              className="mt-6 w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                // If free plan, go to signup, otherwise handle subscription
                if (plan.price === 0) {
                  window.location.href = '/signup';
                } else {
                  // For paid plans, redirect to pricing page where full subscription flow exists
                  window.location.href = '/pricing';
                }
              }}
            >
              {plan.price === 0 ? 'Starten' : 'Wählen'}
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </div>
 );
}

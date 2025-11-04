"use server";

import { getServerSupabaseComponent } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/server";

export interface DashboardData {
  activeProjects: number;
  completedProjects: number;
  monthlyRevenue: number;
  openInvoices: number;
  revenueData: { month: string; value: number }[];
  projectStatusData: { name: string; value: number }[];
  activityFeed: { id: string; text: string; at: Date }[];
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await getServerSupabaseComponent();
  const locale = await getLocale();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Get current month and previous months for revenue data
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(date);
  }

 // Fetch projects data
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, status, created_at")
    .eq("user_id", user.id);

  // Calculate active and completed projects
  // If status field doesn't exist or is null/undefined, consider all projects as active
  const activeProjects = projects?.filter(p => !p.status || p.status !== 'completed').length || 0;
  const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;

  // Fetch invoices data for revenue calculation
  const { data: invoices } = await supabase
    .from("project_invoices")
    .select("id, amount, status, created_at, user_id")
    .eq("user_id", user.id);

  // Calculate monthly revenue for the last 6 months
  const revenueData = months.map(month => {
    const monthStart = month;
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    
    const monthInvoices = invoices?.filter(inv => {
      const invDate = new Date(inv.created_at);
      return invDate >= monthStart && invDate <= monthEnd && inv.status === 'Paid';
    }) || [];
    
    const value = monthInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    
    return {
      month: month.toLocaleDateString(locale, { month: 'short' }),
      value
    };
  });

 // Calculate total monthly revenue (current month)
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const monthlyRevenue = invoices?.filter(inv => {
    const invDate = new Date(inv.created_at);
    return invDate >= currentMonthStart && invDate <= currentMonthEnd && inv.status === 'Paid';
  }).reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;

  // Calculate open invoices
  const openInvoices = invoices?.filter(inv => inv.status === 'Offen').length || 0;

  // Project status distribution
  const projectStatusData = [
    { name: "Aktiv", value: activeProjects },
    { name: "Abgeschlossen", value: completedProjects }
  ];

  // Activity feed - get recent activities
  const activities = [
    ...(projects?.slice(0, 3).map(p => ({
      id: `proj-${p.id}`,
      text: `Projekt '${p.name}' erstellt.`,
      at: new Date(p.created_at)
    })) || []),
    ...(invoices?.slice(0, 3).map(inv => ({
      id: `inv-${inv.id}`,
      text: `Rechnung #${inv.id.slice(0, 4)} erstellt.`,
      at: new Date(inv.created_at)
    })) || [])
  ].sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, 5);

  return {
    activeProjects,
    completedProjects,
    monthlyRevenue,
    openInvoices,
    revenueData,
    projectStatusData,
    activityFeed: activities
  };
}

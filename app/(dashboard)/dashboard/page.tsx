import { getServerSupabaseComponent } from "@/lib/supabase/server";
import { Motion } from "@/components/custom/Motion";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import StatCard from "./components/StatCard";
import RevenueChart from "./components/RevenueChart";
import ProjectStatusChart from "./components/ProjectStatusChart";
import ActivityFeed from "./components/ActivityFeed";

export default async function DashboardPage() {
  const supabase = await getServerSupabaseComponent();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        Bitte melde dich an.
      </div>
    );
  }

  // === Projekte ===
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, status, deadline, created_at, user_id")
    .eq("user_id", user.id);

  const totalProjects = projects?.length || 0;
  const completedProjects =
    projects?.filter((p) => p.status === "Abgeschlossen").length || 0;
  const activeProjects = totalProjects - completedProjects;

  // === Rechnungen ===
  const { data: invoices } = await supabase
    .from("project_invoices")
    .select("id, title, amount_cents, status, created_at, project_id")
    .eq("user_id", user.id);

  const paidInvoices = invoices?.filter((i) => i.status === "Paid") || [];
  const openInvoices = invoices?.filter((i) => i.status === "Open") || [];

  const totalEarnings =
    paidInvoices.reduce((sum, i) => sum + i.amount_cents, 0) / 100;
  const totalOpen = openInvoices.reduce((sum, i) => sum + i.amount_cents, 0) / 100;

  // === Nachrichten (Aktivitäten) ===
  const { data: messages } = await supabase
    .from("project_messages")
    .select("id, content, created_at, projects(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // === Einnahmen-Chart (Demo basierend auf echten Daten) ===
  const groupedByMonth: Record<string, number> = {};
  paidInvoices.forEach((inv) => {
    const month = new Date(inv.created_at).toLocaleString("de-DE", {
      month: "short",
    });
    groupedByMonth[month] = (groupedByMonth[month] || 0) + inv.amount_cents / 100;
  });

  const chartData = Object.entries(groupedByMonth).map(([month, value]) => ({
    month,
    value,
  }));

  // === Projektstatus-Chart ===
  const projectStatusData = [
    { name: "Aktiv", value: activeProjects },
    { name: "Abgeschlossen", value: completedProjects },
  ];

  return (
    <Motion
      className="max-w-6xl mx-auto py-10 space-y-10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Überblick über Projekte, Einnahmen und aktuelle Aktivitäten.
          </p>
        </div>
        <Button asChild>
          <a href="/projects/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Neues Projekt
          </a>
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Aktive Projekte"
          value={activeProjects}
          hint={`von ${totalProjects} insgesamt`}
          icon="projects"
        />
        <StatCard
          label="Abgeschlossene"
          value={completedProjects}
          hint="Gesamt"
          icon="check"
        />
        <StatCard
          label="Einnahmen"
          value={`${totalEarnings.toLocaleString("de-DE", {
            style: "currency",
            currency: "EUR",
          })}`}
          hint="Bezahlt"
          icon="wallet"
        />
        <StatCard
          label="Offene Rechnungen"
          value={openInvoices.length}
          hint={`${totalOpen.toLocaleString("de-DE", {
            style: "currency",
            currency: "EUR",
          })}`}
          icon="invoice"
        />
      </div>

      <Separator />

      {/* Charts + Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <RevenueChart data={chartData} />
          <ProjectStatusChart data={projectStatusData} />
        </div>

        <ActivityFeed messages={messages || []} />
      </div>
    </Motion>
  );
}

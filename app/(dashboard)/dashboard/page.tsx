import { Motion } from "@/components/custom/Motion";
import StatCard from "./components/StatCard";
import RevenueChart from "./components/RevenueChart";
import ProjectStatusChart from "./components/ProjectStatusChart";
import ActivityFeed from "./components/ActivityFeed";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { getDashboardData } from "./data";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <Motion
      className="max-w-6xl mx-auto py-10 space-y-8"
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

        <div className="flex items-center gap-2">
          <Button asChild>
            <a href="/projects/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Neues Projekt
            </a>
          </Button>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Aktive Projekte" value={data.activeProjects.toString()} hint="von insgesamt" icon="projects" />
        <StatCard label="Abgeschlossene" value={data.completedProjects.toString()} hint="letzte 12 Monate" icon="check" />
        <StatCard label="Einnahmen (M)" value={`${data.monthlyRevenue.toLocaleString('de-DE')} €`} hint="letzter Monat" icon="wallet" />
        <StatCard label="Offene Rechnungen" value={data.openInvoices.toString()} hint="Anzahl unbezahlter Rechnungen" icon="invoice" />
      </div>

      <Separator />

      {/* Charts + activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <RevenueChart initialData={data.revenueData} />
          <ProjectStatusChart initialData={data.projectStatusData} />
        </div>

        <div className="space-y-6">
          <ActivityFeed initialData={data.activityFeed} />
        </div>
      </div>
    </Motion>
  );
}

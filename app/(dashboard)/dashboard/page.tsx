import { getServerSupabaseComponent } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Motion } from "@/components/custom/Motion";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  Wallet,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await getServerSupabaseComponent();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <div>Bitte anmelden.</div>;

  // === Fetch basic data ===
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, deadline, status, created_at")
    .eq("user_id", user.id);

  const { data: invoices } = await supabase
    .from("project_invoices")
    .select("id, title, amount_cents, status, created_at")
    .eq("user_id", user.id);

  const { data: messages } = await supabase
    .from("project_messages")
    .select("id, content, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // === Basic statistics ===
  const totalProjects = projects?.length || 0;
  const completedProjects =
    projects?.filter((p) => p.status === "Abgeschlossen").length || 0;
  const activeProjects = totalProjects - completedProjects;

  const totalEarnings =
    invoices
      ?.filter((inv) => inv.status === "Paid")
      .reduce((sum, i) => sum + i.amount_cents, 0) || 0;

  const openInvoices =
    invoices
      ?.filter((inv) => inv.status === "Open")
      .reduce((sum, i) => sum + i.amount_cents, 0) || 0;

  const upcomingDeadlines =
    projects
      ?.filter((p) => p.deadline && new Date(p.deadline) > new Date())
      .sort(
        (a, b) =>
          new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime()
      )
      .slice(0, 3) || [];

  return (
    <Motion
      className="max-w-6xl mx-auto py-10 space-y-10"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Willkommen zurück 👋
          </h1>
          <p className="text-muted-foreground">
            Hier siehst du einen Überblick über deine Projekte, Rechnungen und
            Aktivitäten.
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">+ Neues Projekt</Link>
        </Button>
      </div>

      {/* Statistics */}
      <Motion
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-background/80 backdrop-blur-sm border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aktive Projekte
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              Von {totalProjects} insgesamt
            </p>
          </CardContent>
        </Card>

        <Card className="bg-background/80 backdrop-blur-sm border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Abgeschlossene Projekte
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedProjects}</div>
          </CardContent>
        </Card>

        <Card className="bg-background/80 backdrop-blur-sm border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Einnahmen</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totalEarnings / 100).toLocaleString("de-DE", {
                style: "currency",
                currency: "EUR",
              })}
            </div>
            <p className="text-xs text-muted-foreground">Bezahlt</p>
          </CardContent>
        </Card>

        <Card className="bg-background/80 backdrop-blur-sm border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offen</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(openInvoices / 100).toLocaleString("de-DE", {
                style: "currency",
                currency: "EUR",
              })}
            </div>
            <p className="text-xs text-muted-foreground">Unbezahlt</p>
          </CardContent>
        </Card>
      </Motion>

      <Separator />

      {/* Recent messages & deadlines */}
      <Motion
        className="grid gap-6 md:grid-cols-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {/* Nachrichten */}
        <Card className="bg-background/80 border-border/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              Letzte Nachrichten
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {messages?.length === 0 && (
              <p className="text-muted-foreground">
                Noch keine Nachrichten vorhanden.
              </p>
            )}
            {messages?.map((m: any) => (
              <div
                key={m.id}
                className="rounded-md border p-3 bg-card hover:bg-muted/50 transition"
              >
                <p className="line-clamp-2">{m.content}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(m.created_at).toLocaleString("de-DE")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Deadlines */}
        <Card className="bg-background/80 border-border/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Nächste Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {upcomingDeadlines.length === 0 && (
              <p className="text-muted-foreground">
                Keine anstehenden Deadlines.
              </p>
            )}
            {upcomingDeadlines.map((p: any) => (
              <div
                key={p.id}
                className="rounded-md border p-3 bg-card hover:bg-muted/50 transition"
              >
                <div className="font-medium">{p.name}</div>
                <p className="text-xs text-muted-foreground">
                  Fällig am{" "}
                  {new Date(p.deadline).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </Motion>
    </Motion>
  );
}

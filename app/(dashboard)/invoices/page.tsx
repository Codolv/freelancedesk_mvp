// app/invoices/page.tsx
import { getServerSupabaseComponent } from "@/lib/supabase/server";
import { Motion } from "@/components/custom/Motion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { FileText, Wallet } from "lucide-react";

export default async function InvoicesPage() {
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

  // Fetch invoices + project names
  const { data: invoices } = await supabase
    .from("project_invoices")
    .select("id, title, amount_cents, status, created_at, project_id, projects(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <Motion
      className="max-w-5xl mx-auto py-10 space-y-10"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rechnungen</h1>
          <p className="text-muted-foreground mt-1">
            Überblick über alle Rechnungen deiner Projekte.
          </p>
        </div>
        <Button asChild>
          <Link href="/projects">Zu Projekten</Link>
        </Button>
      </div>

      <Separator />

      {/* Invoice List */}
      <div className="space-y-4">
        {!invoices?.length && (
          <div className="text-center text-muted-foreground py-16">
            Noch keine Rechnungen vorhanden.
          </div>
        )}

        {invoices?.map((invoice, idx) => (
          <Motion
            key={invoice.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="hover:shadow-md transition-all border-border/60 bg-background/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <h2 className="font-semibold text-lg">
                    {invoice.title || "Rechnung"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Projekt: {invoice.projects?.name || "Unbekannt"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      invoice.status === "Paid"
                        ? "default"
                        : invoice.status === "Open"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {invoice.status === "Paid"
                      ? "Bezahlt"
                      : invoice.status === "Open"
                      ? "Offen"
                      : invoice.status}
                  </Badge>
                  <p className="text-sm font-medium">
                    {(invoice.amount_cents / 100).toLocaleString("de-DE", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="flex justify-between items-center text-sm text-muted-foreground">
                <p>
                  Erstellt am{" "}
                  {new Date(invoice.created_at).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="text-sm"
                  >
                    <Link href={`/projects/${invoice.project_id}/invoices/${invoice.id}`}>
                      Anzeigen
                    </Link>
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    asChild
                    className="text-sm"
                  >
                    <Link href={`/projects/${invoice.project_id}/invoices/${invoice.id}/edit`}>
                      Bearbeiten
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Motion>
        ))}
      </div>
    </Motion>
  );
}

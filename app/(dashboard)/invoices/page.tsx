import { getServerSupabaseComponent } from "@/lib/supabase/server";
import { Motion } from "@/components/custom/Motion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Wallet, FileText, PlusCircle } from "lucide-react";

interface Invoice {
  id: string;
  title: string | null;
  amount_cents: number;
  status: string;
  created_at: string;
  project_id: string;
  projects: { name: string }[] | { name: string } | null;
}

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

  // Fetch invoices and related project names
  const { data: invoices } = await supabase
    .from("project_invoices")
    .select(
      `
        id, title, amount_cents, status, created_at, project_id,
        projects(name)
      `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Type assertion for the invoices data
  const typedInvoices = invoices as Invoice[] | null;

  return (
    <Motion
      className="w-full max-w-7xl mx-auto py-10 space-y-10 px-4"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Wallet className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Rechnungen</h1>
            <p className="text-muted-foreground mt-1">
              Überblick über alle Rechnungen deiner Projekte.
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/projects">
            <PlusCircle className="mr-2 h-4 w-4" /> Neue Rechnung
          </Link>
        </Button>
      </div>

      <Separator />

      {/* Invoice List */}
      {!typedInvoices?.length ? (
        <Motion
          className="text-center py-24 text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-60" />
          <p className="text-lg font-medium mb-1">
            Noch keine Rechnungen vorhanden.
          </p>
          <p className="text-sm mb-4">
            Erstelle deine erste Rechnung über deine Projektübersicht.
          </p>
          <Button variant="default" asChild>
            <Link href="/projects">
              <PlusCircle className="mr-2 h-4 w-4" /> Projekt anzeigen
            </Link>
          </Button>
        </Motion>
      ) : (
        <div className="grid gap-4">
          {typedInvoices.map((invoice, idx) => (
            <Motion
              key={invoice.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className=""
            >
              <Card className="hover:shadow-md transition-all border-border/60 bg-background/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-lg">
                      {invoice.title || "Rechnung"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Projekt: {invoice.projects && !Array.isArray(invoice.projects) ? invoice.projects.name : Array.isArray(invoice.projects) ? invoice.projects[0]?.name : "Unbekannt"}
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
                      className={
                        invoice.status === "Paid"
                          ? "bg-olive-600 text-white"
                          : invoice.status === "Open"
                          ? "bg-yellow-500/20 text-yellow-800 dark:text-yellow-300"
                          : ""
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
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`/projects/${invoice.project_id}/invoices/${invoice.id}/view`}
                      >
                        Anzeigen
                      </Link>
                    </Button>
                    <Button variant="secondary" size="sm" asChild>
                      <Link
                        href={`/projects/${invoice.project_id}/invoices/${invoice.id}`}
                      >
                        Bearbeiten
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Motion>
          ))}
        </div>
      )}
    </Motion>
  );
}

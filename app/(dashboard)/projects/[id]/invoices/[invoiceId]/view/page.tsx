import { getServerSupabaseComponent } from "@/lib/supabase/server";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Motion } from "@/components/custom/Motion";
import Link from "next/link";
import { format } from "date-fns";
import { de, enUS } from "date-fns/locale";
import { getDateLocale, formatInvoiceDate } from "@/lib/i18n/date-format";
import { getLocale } from "@/lib/i18n/server";
import { ArrowLeft, FileText, Download, Edit } from "lucide-react";

export default async function InvoiceViewPage({
  params,
}: {
  params: { id: string; invoiceId: string };
}) {
  const supabase = await getServerSupabaseComponent();
  const locale = await getLocale();

  const { data: invoice } = await supabase
    .from("project_invoices")
    .select("*, projects(name)")
    .eq("id", params.invoiceId)
    .single();

  const { data: items } = await supabase
    .from("project_invoice_items")
    .select("*")
    .eq("invoice_id", params.invoiceId);

  if (!invoice) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Rechnung nicht gefunden.
      </div>
    );
  }

  const totalAmount = items?.reduce(
    (sum, item) => sum + Math.round(item.quantity * item.unit_price_cents),
    0
  ) || 0;

  return (
    <Motion
      className="w-full max-w-4xl mx-auto py-10 space-y-6 px-4"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-background/80 border-border/60 shadow-md">
        <CardHeader className="border-b border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">{invoice.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Rechnung #{invoice.id.substring(0, 8)}
              </p>
            </div>
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
                  ? "bg-yellow-500/20 text-yellow-80 dark:text-yellow-300"
                  : ""
              }
            >
              {invoice.status === "Paid"
                ? "Bezahlt"
                : invoice.status === "Open"
                ? "Offen"
                : invoice.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Invoice Details */}
            <div>
              <h3 className="font-medium mb-3">Rechnungsdetails</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Erstellt:</span>
                  <span>
                    {formatInvoiceDate(invoice.created_at, locale)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Projekt:</span>
                  <span>{invoice.projects?.name || invoice.project_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span>
                    {invoice.status === "Paid" ? "Bezahlt" : "Offen"}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Amount */}
            <div className="text-right">
              <h3 className="font-medium mb-3">Gesamtbetrag</h3>
              <p className="text-3xl font-bold text-foreground">
                {(totalAmount / 100).toLocaleString("de-DE", {
                  style: "currency",
                  currency: "EUR",
                })}
              </p>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="mt-8">
            <h3 className="font-medium mb-4">Positionen</h3>
            <div className="border border-border/60 rounded-md">
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-border/60 bg-muted/20 font-medium">
                <div className="col-span-6">Beschreibung</div>
                <div className="col-span-2 text-center">Menge</div>
                <div className="col-span-2 text-right">Einzelpreis</div>
                <div className="col-span-2 text-right">Gesamt</div>
              </div>
              {items?.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-4 p-4 border-b border-border/60 last:border-b-0 hover:bg-muted/10"
                >
                  <div className="col-span-6">{item.description}</div>
                  <div className="col-span-2 text-center">{item.quantity}</div>
                  <div className="col-span-2 text-right">
                    {(item.unit_price_cents / 100).toLocaleString("de-DE", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </div>
                  <div className="col-span-2 text-right">
                    {(Math.round(item.quantity * item.unit_price_cents) / 100).toLocaleString("de-DE", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t border-border/60 flex justify-between">
          <Button variant="outline" asChild>
            <Link href={`/projects/${params.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zum Projekt
            </Link>
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href={`/api/invoices/${params.invoiceId}/pdf`}>
                <Download className="mr-2 h-4 w-4" />
                Als PDF herunterladen
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/projects/${params.id}/invoices/${params.invoiceId}`}>
                <Edit className="mr-2 h-4 w-4" />
                Bearbeiten
              </Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Motion>
  );
}

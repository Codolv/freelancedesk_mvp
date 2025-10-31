import { getServerSupabaseComponent, getServerSupabaseAction } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ItemsField } from "@/components/invoices/ItemsField";
import { Motion } from "@/components/custom/Motion";

export default async function EditInvoicePage({
  params,
}: {
  params: { id: string; invoiceId: string };
}) {
  const supabase = await getServerSupabaseComponent();

  const { data: invoice } = await supabase
    .from("project_invoices")
    .select("*")
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

  interface InvoiceItem {
    description: string;
    qty: number;
    unit_price_cents: number;
  }

  // ✅ Define local server action
  async function updateInvoice(formData: FormData) {
    "use server";
    const supabase = await getServerSupabaseAction();

    const title = formData.get("title")?.toString() || "";
    const status = formData.get("status")?.toString() || "Open";
    const itemsRaw = formData.get("items")?.toString() || "[]";
    const parsedItems: InvoiceItem[] = JSON.parse(itemsRaw);
    const amount_cents = parsedItems.reduce(
      (sum: number, item: InvoiceItem) => sum + Math.round(item.qty * item.unit_price_cents),
      0
    );

    await supabase
      .from("project_invoices")
      .update({
        title,
        status,
        amount_cents,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.invoiceId);

    await supabase
      .from("project_invoice_items")
      .delete()
      .eq("invoice_id", params.invoiceId);

    await supabase.from("project_invoice_items").insert(
      parsedItems.map((i: InvoiceItem) => ({
        invoice_id: params.invoiceId,
        description: i.description,
        qty: i.qty,
        unit_price_cents: i.unit_price_cents,
      }))
    );

    redirect(`/projects/${params.id}`);
  }

  return (
    <Motion
      className="w-full max-w-6xl mx-auto py-10 space-y-6 px-4"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-background/80 border-border/60 shadow-md">
        <CardHeader>
          <h1 className="text-2xl font-semibold">
            Rechnung bearbeiten – {invoice.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            Aktualisiere Titel, Positionen oder Status.
          </p>
        </CardHeader>
        <CardContent>
          <form action={updateInvoice} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                name="title"
                defaultValue={invoice.title}
                placeholder="Rechnungstitel"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={invoice.status}
                className="border rounded-md p-2 bg-background"
              >
                <option value="Open">Offen</option>
                <option value="Paid">Bezahlt</option>
              </select>
            </div>

            <ItemsField />

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" asChild>
                <a href={`/projects/${params.id}`}>Abbrechen</a>
              </Button>
              <Button type="submit">Änderungen speichern</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Motion>
  );
}

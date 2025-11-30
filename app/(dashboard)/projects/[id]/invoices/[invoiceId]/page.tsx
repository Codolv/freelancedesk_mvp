import { getServerSupabaseComponent } from "@/lib/supabase/server";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ItemsField } from "@/components/invoices/ItemsField";
import { Motion } from "@/components/custom/Motion";
import { updateInvoiceAction } from "./actions";
import Link from "next/link";
import { getT } from "@/lib/i18n/server";

export default async function EditInvoicePage({
  params,
}: {
  params: { id: string; invoiceId: string };
}) {
  const supabase = await getServerSupabaseComponent();
  const t = await getT();

  const { data: invoice } = await supabase
    .from("project_invoices")
    .select("*")
    .eq("id", params.invoiceId)
    .single();

  const { data: items } = await supabase
    .from("project_invoice_items")
    .select("*")
    .eq("invoice_id", params.invoiceId);

  // Transform items to ensure proper types for the form
  const transformedItems = items?.map(item => ({
    description: item.description || "",
    quantity: item.quantity || 0,
    unit_price_cents: item.unit_price_cents || 0
  })) || [];

 if (!invoice) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        {t('invoice.not.found')}
      </div>
    );
  }

  interface InvoiceItem {
    description: string;
    quantity: number;
    unit_price_cents: number;
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
            {t('invoice.edit.title').replace('{title}', invoice.title)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('invoice.edit.description')}
          </p>
        </CardHeader>
        <CardContent>
          <form action={async (formData: FormData) => {
            'use server';
            return updateInvoiceAction(params.id, params.invoiceId, formData);
          }} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">{t('invoice.edit.title.label')}</Label>
              <Input
                id="title"
                name="title"
                defaultValue={invoice.title}
                placeholder={t('invoice.edit.title.placeholder')}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">{t('invoice.edit.status.label')}</Label>
              <select
                id="status"
                name="status"
                defaultValue={invoice.status}
                className="border rounded-md p-2 bg-background"
              >
                <option value="Open">{t('invoice.status.open')}</option>
                <option value="Paid">{t('invoice.status.paid')}</option>
              </select>
            </div>

            <ItemsField initialItems={transformedItems} />

            <div className="flex justify-between gap-3 mt-6">
              <Button variant="outline" asChild>
                <a href={`/projects/${params.id}`}>{t('invoice.edit.cancel')}</a>
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" asChild>
                  <Link href={`/projects/${params.id}/invoices/${params.invoiceId}/view`}>
                    {t('invoice.view')}
                  </Link>
                </Button>
                <Button type="submit">{t('invoice.edit.save')}</Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </Motion>
  );
}

"use server";

import { getServerSupabaseAction } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function updateInvoiceAction(
  projectId: string,
  invoiceId: string,
  formData: FormData
) {
  const supabase = await getServerSupabaseAction();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht angemeldet.");

  // Extract form values
  const title = formData.get("title")?.toString() || "";
  const status = formData.get("status")?.toString() || "Open";
  const itemsRaw = formData.get("items")?.toString() || "[]";

  let items: Array<{
    description: string;
    quantity: number;
    unit_price_cents: number;
  }> = [];

  try {
    items = JSON.parse(itemsRaw);
  } catch {
    throw new Error("Fehler beim Parsen der Positionen.");
  }

  if (!title || items.length === 0) {
    throw new Error("Titel und Positionen sind erforderlich.");
  }

  // Recalculate total amount
  const amount_cents = items.reduce(
    (sum, item) => sum + Math.round(item.quantity * item.unit_price_cents),
    0
  );

  // Update invoice
  const { error: updateError } = await supabase
    .from("project_invoices")
    .update({
      title,
      amount_cents,
      status,
    })
    .eq("id", invoiceId)
    .eq("project_id", projectId);

  if (updateError) throw updateError;

  // Delete old items first (simple approach)
  await supabase
    .from("project_invoice_items")
    .delete()
    .eq("invoice_id", invoiceId);

  // Insert updated items
  const { error: insertError } = await supabase
    .from("project_invoice_items")
    .insert(
      items.map((item) => ({
        invoice_id: invoiceId,
        description: item.description,
        quantity: item.quantity,
        unit_price_cents: item.unit_price_cents,
      }))
    );

  if (insertError) throw insertError;

  // Revalidate and redirect
  redirect(`/projects/${projectId}`);
}

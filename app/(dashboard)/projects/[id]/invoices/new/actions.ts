"use server";

import { getServerSupabaseAction } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createInvoiceAction(projectId: string, formData: FormData) {
 const supabase = await getServerSupabaseAction();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht angemeldet");

  const title = (formData.get("title")?.toString() || "").trim();
  if (!title) throw new Error("Titel ist erforderlich");

  // Parse items JSON
  const itemsRaw = formData.get("items")?.toString() || "[]";
  let items: Array<{ description: string; quantity: number; unit_price_cents: number }> = [];
  try {
    items = JSON.parse(itemsRaw);
  } catch {
    throw new Error("Fehler beim Parsen der Positionen");
  }

  if (items.length === 0) throw new Error("Mindestens eine Position ist erforderlich");

  const amount_cents = items.reduce(
    (sum, it) => sum + Math.round(it.quantity * it.unit_price_cents),
    0
  );

  // Get due date from form data
  const dueDate = formData.get("due_date")?.toString() || null;

  // Validate due date is not in the past
  if (dueDate) {
    const dueDateObj = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for comparison
    if (dueDateObj < today) {
      throw new Error("Fälligkeitsdatum kann nicht in der Vergangenheit liegen");
    }
  }

  const { data: inv, error } = await supabase
    .from("project_invoices")
    .insert({
      project_id: projectId,
      title,
      amount_cents,
      status: "draft",
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      user_id: user.id, // Add the user_id to track who created the invoice
    })
    .select("id")
    .single();

  if (error || !inv?.id) throw new Error(error?.message || "Fehler beim Erstellen der Rechnung");

  await supabase.from("project_invoice_items").insert(
    items.map((it) => ({
      invoice_id: inv.id,
      description: it.description,
      quantity: it.quantity,
      unit_price_cents: it.unit_price_cents,
    }))
  );

  redirect(`/projects/${projectId}`);
}

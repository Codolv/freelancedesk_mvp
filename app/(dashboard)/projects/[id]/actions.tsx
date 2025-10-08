// app/projects/[id]/actions.ts
"use server";

import { getServerSupabaseAction } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addMessage(projectId: string, formData: FormData) {
  const supabase = await getServerSupabaseAction();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const content = (formData.get("content")?.toString() || "").trim();
  if (!content) return;

  await supabase
    .from("project_messages")
    .insert({ project_id: projectId, user_id: user.id, content });

  revalidatePath(`/projects/${projectId}`);
}

export async function getFileUrl(path: string) {
  const supabase = await getServerSupabaseAction();
    const { data, error } = await supabase.storage
      .from("files")
      .createSignedUrl(path, 60 * 60); // 1h gültig
    if (error) {
      console.log(error)
    } else {
      return data.signedUrl;
    }
  };

export async function uploadFile(projectId: string, formData: FormData) {
  const supabase = await getServerSupabaseAction();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const file = formData.get("file") as File | null;
  if (!file) return;

  const path = `${projectId}/${file.name}`;
  await supabase.storage.from("files").upload(path, file, { upsert: true });

  revalidatePath(`/projects/${projectId}`);
}

export async function deleteInvoice(projectId: string, invoiceId: string) {
  const supabase = await getServerSupabaseAction();
  await supabase.from("project_invoice_items").delete().eq("invoice_id", invoiceId);
  await supabase.from("project_invoices").delete().eq("id", invoiceId);
  revalidatePath(`/projects/${projectId}`);
}

export async function markInvoicePaid(projectId: string, invoiceId: string) {
  const supabase = await getServerSupabaseAction();
  await supabase
    .from("project_invoices")
    .update({ status: "Paid" })
    .eq("id", invoiceId);

  revalidatePath(`/projects/${projectId}`);
}

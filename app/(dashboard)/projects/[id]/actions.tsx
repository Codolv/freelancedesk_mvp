// app/projects/[id]/actions.ts
"use server";

import { getServerSupabaseAction } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addMessage(projectId: string, content: string) {
  const supabase = await getServerSupabaseAction();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // check if user owns project or is a client
  const { data: project } = await supabase
    .from("projects")
    .select("user_id")
    .eq("id", projectId)
    .single();

  const sender_role = project?.user_id === user.id ? "freelancer" : "client";

  await supabase.from("project_messages").insert({
    project_id: projectId,
    user_id: user.id,
    content,
    sender_role,
  });
}


// Upload file to Supabase storage
export async function uploadFile(projectId: string, formData: FormData) {
  const supabase = await getServerSupabaseAction();
  const file = formData.get("file") as File;
  if (!file) return;

  const { error } = await supabase.storage
    .from("files")
    .upload(`${projectId}/${file.name}`, file, { upsert: true });

  if (error) throw error;

  return { 
    name: file.name,
    size: file.size,
    last_modified: file.lastModified,
  };
}

// Delete file
export async function deleteFile(projectId: string, fileName: string) {
  const supabase = await getServerSupabaseAction();
  await supabase.storage.from("files").remove([`${projectId}/${fileName}`]);
}

// Get file URL
export async function getFileUrl(path: string) {
  const supabase = await getServerSupabaseAction();
  const { data } = await supabase.storage.from("files").createSignedUrl(path, 60);
  return data?.signedUrl;
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

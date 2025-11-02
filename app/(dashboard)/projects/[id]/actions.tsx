'use server'

import { getServerSupabaseAction } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markProjectComplete(projectId: string) {
  try {
    const supabase = await getServerSupabaseAction()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Nicht eingeloggt')
    }

    // Check if user is the project owner
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single()

    if (projectError) {
      throw new Error('Projekt nicht gefunden')
    }

    if (project.user_id !== user.id) {
      throw new Error('Nur der Projektbesitzer kann das Projekt abschließen')
    }

    // Update project status to completed
    const { error } = await supabase
      .from('projects')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    if (error) {
      throw new Error(error.message)
    }

    // Revalidate the project page
    revalidatePath(`/projects/${projectId}`)
    
    return { success: true, message: 'Projekt erfolgreich als abgeschlossen markiert!' }
  } catch (error) {
    console.error('Error marking project complete:', error)
    return { success: false, message: error instanceof Error ? error.message : 'Fehler beim Abschließen des Projekts' }
  }
}



export async function markProjectActive(projectId: string) {
  try {
    const supabase = await getServerSupabaseAction()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Nicht eingeloggt')
    }

    // Check if user is the project owner
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single()

    if (projectError) {
      throw new Error('Projekt nicht gefunden')
    }

    if (project.user_id !== user.id) {
      throw new Error('Nur der Projektbesitzer kann den Projektstatus ändern')
    }

    // Update project status to active
    const { error } = await supabase
      .from('projects')
      .update({ 
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    if (error) {
      throw new Error(error.message)
    }

    // Revalidate the project page
    revalidatePath(`/projects/${projectId}`)
    
    return { success: true, message: 'Projektstatus erfolgreich aktualisiert!' }
  } catch (error) {
    console.error('Error updating project status:', error)
    return { success: false, message: error instanceof Error ? error.message : 'Fehler beim Aktualisieren des Projektstatus' }
  }
}

export async function deleteFile(projectId: string, fileName: string) {
  try {
    const supabase = await getServerSupabaseAction()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Nicht eingeloggt')
    }

    // Check if user is the project owner
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single()

    if (projectError) {
      throw new Error('Projekt nicht gefunden')
    }

    if (project.user_id !== user.id) {
      throw new Error('Nur der Projektbesitzer kann Dateien löschen')
    }

    // Delete file from Supabase storage
    const { error } = await supabase
      .storage
      .from('files')
      .remove([`${projectId}/${fileName}`])

    if (error) {
      throw new Error(error.message)
    }

    // Revalidate the project page
    revalidatePath(`/projects/${projectId}`)
    
    return { success: true, message: 'Datei erfolgreich gelöscht!' }
  } catch (error) {
    console.error('Error deleting file:', error)
    return { success: false, message: error instanceof Error ? error.message : 'Fehler beim Löschen der Datei' }
  }
}

// Upload file to Supabase storage
export async function uploadFile(projectId: string, formData: FormData) {
  const supabase = await getServerSupabaseAction();
  const file = formData.get("file") as File;
  if (!file) return;

  const { data, error } = await supabase.storage
    .from("files")
    .upload(`${projectId}/${file.name}`, file, { upsert: true });

  if (error) throw error;

  return { 
    name: file.name,
    size: file.size,
    last_modified: file.lastModified,
  };
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

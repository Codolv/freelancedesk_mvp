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
    const { error: storageError } = await supabase
      .storage
      .from('files')
      .remove([`${projectId}/${fileName}`]);

    if (storageError) {
      throw new Error(storageError.message)
    }

    // Delete file record from database
    const { error: dbError } = await supabase
      .from('project_files')
      .delete()
      .eq('project_id', projectId)
      .eq('name', fileName);

    if (dbError) {
      console.error('Database delete error:', dbError);
      // Don't throw here as the file was already deleted from storage
    }

    // Revalidate the project page
    revalidatePath(`/projects/${projectId}`)
    
    return { success: true, message: 'Datei erfolgreich gelöscht!' }
  } catch (error) {
    console.error('Error deleting file:', error)
    return { success: false, message: error instanceof Error ? error.message : 'Fehler beim Löschen der Datei' }
  }
}

// Upload file to Supabase storage with versioning support
export async function uploadFile(projectId: string, formData: FormData) {
  const supabase = await getServerSupabaseAction();
  const file = formData.get("file") as File;
  if (!file) return;

  // Get the user who uploaded the file
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht eingeloggt");

  // Check if a file with this name already exists in the project
 const { data: existingFile, error: existingFileError } = await supabase
    .from("project_files")
    .select("*")
    .eq("project_id", projectId)
    .eq("name", file.name)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let projectFileId: string;
  let versionNumber: number;

  if (existingFile) {
    // File already exists, increment version number
    versionNumber = existingFile.version ? existingFile.version + 1 : 2;
    projectFileId = existingFile.id;

    // Update the existing file record
    const { error: updateError } = await supabase
      .from("project_files")
      .update({
        path: `${projectId}/${file.name}`,
        size_bytes: file.size,
        mime_type: file.type || "",
        updated_at: new Date().toISOString(),
        version: versionNumber,
      })
      .eq("id", existingFile.id);

    if (updateError) throw updateError;
  } else {
    // New file, create project_files record
    const { data: newFile, error: insertError } = await supabase
      .from("project_files")
      .insert({
        project_id: projectId,
        name: file.name,
        path: `${projectId}/${file.name}`,
        size_bytes: file.size,
        mime_type: file.type || "",
        uploaded_by: user.id,
        version: 1,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    projectFileId = newFile.id;
    versionNumber = 1;
  }

  // Create a unique filename for this version to avoid conflicts
  const versionFileName = versionNumber === 1 
    ? file.name 
    : `${file.name.split('.')[0]}_v${versionNumber}.${file.name.split('.').pop() || ''}`;
  
  // Upload file to Supabase storage with version-specific name
  const { data, error } = await supabase.storage
    .from("files")
    .upload(`${projectId}/${versionFileName}`, file, { upsert: true });

  if (error) throw error;

  // Insert version record
  const { data: fileVersion, error: versionError } = await supabase
    .from("file_versions")
    .insert({
      project_file_id: projectFileId,
      version_number: versionNumber,
      file_path: `${projectId}/${versionFileName}`,
      size_bytes: file.size,
      mime_type: file.type || "",
      created_by: user.id,
    })
    .select()
    .single();

  if (versionError) throw versionError;

  // Update the current_version_id in project_files
  const { error: updateCurrentVersionError } = await supabase
    .from("project_files")
    .update({ current_version_id: fileVersion.id })
    .eq("id", projectFileId);

  if (updateCurrentVersionError) throw updateCurrentVersionError;

  // Return the updated file info
  const { data: finalFile, error: finalError } = await supabase
    .from("project_files")
    .select("*")
    .eq("id", projectFileId)
    .single();

  if (finalError) throw finalError;

  return finalFile;
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

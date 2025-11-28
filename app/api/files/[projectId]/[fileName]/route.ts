import { NextRequest } from "next/server";
import { getServerSupabaseAction } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ projectId: string; fileName: string }> }
) {
  const { projectId, fileName } = await context.params;
  
  try {
    const supabase = await getServerSupabaseAction();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Check if user has access to this project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .single();

    const { data: projectClient, error: clientError } = await supabase
      .from("project_clients")
      .select("id")
      .eq("project_id", projectId)
      .eq("client_id", user.id)
      .single();

    if (!project && !projectClient) {
      return new Response("Forbidden", { status: 403 });
    }

    // First, try to find the file record to get the correct storage path
    // Look for the most recent version of the file with the given name
    const { data: fileRecord, error: fileError } = await supabase
      .from("project_files")
      .select("id, name, current_version_id, path")
      .eq("project_id", projectId)
      .eq("name", fileName)
      .single();

    if (fileError || !fileRecord) {
      console.error("File record not found:", fileName, "Error:", fileError);
      return new Response("File not found", { status: 404 });
    }

    let storagePath: string;

    // Get the latest version of the file to determine the correct storage path
    // Prioritize the current_version_id if it exists, otherwise get the latest by version_number
    let fileVersionRecord = null;

    if (fileRecord.current_version_id) {
      // Get the specific version record pointed to by current_version_id
      const { data: currentVersion, error: versionError } = await supabase
        .from("file_versions")
        .select("file_path")
        .eq("id", fileRecord.current_version_id)
        .single();

      if (!versionError && currentVersion) {
        fileVersionRecord = currentVersion;
      }
    }

    // If we couldn't get the current version or no current_version_id exists, get the latest version by number
    if (!fileVersionRecord) {
      const { data: latestVersion, error: latestVersionError } = await supabase
        .from("file_versions")
        .select("file_path")
        .eq("project_file_id", fileRecord.id)
        .order("version_number", { ascending: false })
        .limit(1)
        .single();

      if (!latestVersionError && latestVersion) {
        fileVersionRecord = latestVersion;
      }
    }

    // Use the version-specific path if available, otherwise fallback to the original path
    if (fileVersionRecord && fileVersionRecord.file_path) {
      storagePath = fileVersionRecord.file_path;
    } else {
      // Fallback to the original path from project_files
      storagePath = fileRecord.path;
    }

    // Validate that we have a storage path
    if (!storagePath) {
      console.error("No storage path found for file:", fileName, "File record:", fileRecord);
      return new Response("File not found", { status: 404 });
    }

    console.log("Attempting to download file with storage path:", storagePath);

    // Track the download
    await supabase.from("file_downloads").insert({
      project_id: projectId,
      file_name: fileName,
      user_id: user.id,
    });

    // Get the signed URL for the file using the correct storage path
    const { data, error } = await supabase.storage
      .from("files")
      .createSignedUrl(storagePath, 3600); // 1 hour expiry

    if (error) {
      console.error("Error creating signed URL:", error);
      console.error("Attempted path:", storagePath);
      return new Response("File not found", { status: 404 });
    }

    // Redirect to the signed URL
    return Response.redirect(data.signedUrl);
  } catch (error) {
    console.error("Error handling file download:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

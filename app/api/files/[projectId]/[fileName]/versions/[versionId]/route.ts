import { NextRequest } from "next/server";
import { getServerSupabaseAction } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ projectId: string; fileName: string; versionId: string }> }
) {
  const { projectId, fileName, versionId } = await context.params;
  
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

    // First get the project file ID to ensure the version belongs to the correct file
    const { data: projectFile, error: projectFileError } = await supabase
      .from("project_files")
      .select("id")
      .eq("project_id", projectId)
      .eq("name", fileName)
      .single();

    if (projectFileError || !projectFile) {
      return new Response("File not found", { status: 404 });
    }

    // Get the specific file version
    const { data: fileVersion, error: versionError } = await supabase
      .from("file_versions")
      .select("*")
      .eq("id", versionId)
      .eq("project_file_id", projectFile.id)
      .single();

    if (versionError || !fileVersion) {
      return new Response("File version not found", { status: 404 });
    }

    // Track the download for this specific version
    await supabase.from("file_downloads").insert({
      project_id: projectId,
      file_name: `${fileName}_v${fileVersion.version_number}`, // More descriptive name for version downloads
      user_id: user.id,
    });

    // Get the signed URL for the specific version file
    const { data, error } = await supabase.storage
      .from("files")
      .createSignedUrl(fileVersion.file_path, 3600); // 1 hour expiry

    if (error) {
      return new Response("File not found", { status: 404 });
    }

    // Redirect to the signed URL
    return Response.redirect(data.signedUrl);
  } catch (error) {
    console.error("Error handling file version download:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

import { NextRequest } from "next/server";
import { getServerSupabaseAction } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; fileName: string } }
) {
  const { projectId, fileName } = params;
  
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

    // Track the download
    await supabase.from("file_downloads").insert({
      project_id: projectId,
      file_name: fileName,
      user_id: user.id,
    });

    // Get the signed URL for the file
    const { data, error } = await supabase.storage
      .from("files")
      .createSignedUrl(`${projectId}/${fileName}`, 3600); // 1 hour expiry

    if (error) {
      return new Response("File not found", { status: 404 });
    }

    // Redirect to the signed URL
    return Response.redirect(data.signedUrl);
  } catch (error) {
    console.error("Error handling file download:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

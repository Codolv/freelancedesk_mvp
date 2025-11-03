import { NextRequest } from "next/server";
import { getServerSupabaseAction } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;
  
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

    // Fetch files for the project
    const { data: files, error } = await supabase
      .from("project_files")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return new Response("Database error", { status: 500 });
    }

    return Response.json({ files });
  } catch (error) {
    console.error("Error fetching files:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

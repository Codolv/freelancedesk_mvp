import { NextRequest, NextResponse } from "next/server";
import { getServerSupabaseAction } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ projectId: string; fileName: string }> }
): Promise<NextResponse> {
  const { projectId, fileName } = await context.params;
  
  try {
    const supabase = await getServerSupabaseAction();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has access to this project (freelancer or client)
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, user_id")
      .eq("id", projectId)
      .single();

    if (projectError) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const { data: projectClient } = await supabase
      .from("project_clients")
      .select("id")
      .eq("project_id", projectId)
      .eq("client_id", user.id)
      .single();

    // Only allow access if user is the project owner or a client on the project
    if (!project && !projectClient) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // For freelancers, show all downloads
    // For clients, only show their own downloads
    let query = supabase
      .from("file_downloads")
      .select("*")
      .eq("project_id", projectId)
      .eq("file_name", fileName);

    if (projectClient) {
      // If user is a client, only show their downloads
      query = query.eq("user_id", user.id);
    }

    const { data: downloads, error } = await query
      .order("downloaded_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ downloads });
  } catch (error) {
    console.error("Error fetching download data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

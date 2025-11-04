import { NextRequest, NextResponse } from "next/server";
import { getServerSupabaseAction } from "@/lib/supabase/server";

interface ProjectFile {
  id: string;
  project_id: string;
  name: string;
  path: string;
  size_bytes?: number;
  mime_type?: string;
  description?: string;
  uploaded_by: string;
  version?: number;
  created_at: string;
  updated_at: string;
  current_version_id?: string;
  total_versions?: number;
}

interface FileVersion {
  id: string;
  project_file_id: string;
  version_number: number;
  file_path: string;
  size_bytes?: number;
  mime_type?: string;
  created_at: string;
  created_by: string;
}

interface UserProfile {
  id: string;
  name?: string;
  email?: string;
}

interface VersionWithUserInfo extends FileVersion {
  createdBy: UserProfile;
}

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

    // Get the project file record
    const { data: projectFile, error: fileError } = await supabase
      .from("project_files")
      .select("*")
      .eq("project_id", projectId)
      .eq("name", fileName)
      .single();

    if (fileError || !projectFile) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Get all versions for this file
    const { data: versions, error: versionsError } = await supabase
      .from("file_versions")
      .select("*")
      .eq("project_file_id", projectFile.id)
      .order("version_number", { ascending: false });

    if (versionsError) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Get user profiles for version creators
    const userIds = versions?.map((v: FileVersion) => v.created_by) || [];
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("id, name, email")
      .in("id", userIds);

    const userMap = new Map<string, UserProfile>();
    if (users) {
      users.forEach((userProfile: UserProfile) => {
        userMap.set(userProfile.id, userProfile);
      });
    }

    const versionsWithUserInfo: VersionWithUserInfo[] = versions?.map((version: FileVersion) => ({
      ...version,
      createdBy: userMap.get(version.created_by) || { id: version.created_by, name: 'Unknown', email: '' }
    })) || [];

    return NextResponse.json({ 
      versions: versionsWithUserInfo, 
      currentVersion: projectFile.version 
    });
  } catch (error) {
    console.error("Error fetching file versions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

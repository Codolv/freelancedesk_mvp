// app/projects/[id]/page.tsx
import { getServerSupabaseComponent } from "@/lib/supabase/server";
import { Motion } from "@/components/custom/Motion";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ClientInfoBar } from "./components/ClientInfoBar";
import ProjectTabsAnimated from "./ProjectTabsAnimated";
import { getAvatarUrl } from '../../../../lib/supabase/getAvatarUrl';

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getServerSupabaseComponent();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <div className="flex items-center justify-center h-screen text-muted-foreground">Bitte melde dich an.</div>;

  const { data: user_profile } = await supabase.from("profiles").select("id, name, email, avatar_url").eq("id", user.id).single();

  const { data: project } = await supabase.from("projects").select("*").eq("id", id).single();
  if (!project) return <div className="flex items-center justify-center h-screen text-muted-foreground">Projekt nicht gefunden.</div>;

  const isFreelancer = project.user_id === user.id;
  const { data: isClient } = await supabase.from("project_clients").select("id").eq("project_id", id).eq("client_id", user.id).maybeSingle();

  if (!isFreelancer && !isClient) return <div className="flex items-center justify-center h-screen text-muted-foreground">Du hast keinen Zugriff auf dieses Projekt.</div>;

  // fetch data for tabs
  const { data: messagesRaw } = await supabase
  .from("project_messages")
  .select(`
    id,
    content,
    created_at,
    user_id,
    profiles (
      id,
      name,
      email,
      avatar_url
    )
  `)
  .eq("project_id", id)
  .order("created_at", { ascending: false });

  // Define a comprehensive message interface that satisfies both Comments and MessagesTab
  interface UnifiedMessage {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    project_id: string;
    sender_role: "freelancer" | "client";
    profiles?: {
      id?: string;
      name?: string;
      email?: string;
      avatar_url?: string | null;
      signedAvatarUrl?: string | null;
    } | null;
  }

  // Determine project owner to compute sender_role if not in the data
  const projectOwnerId = project.user_id;
  
  // Process the messages for the UI components  
  const messages = (messagesRaw || []).map((m: any) => {
    // Supabase returns the profile data as a single object, not an array
    const profile = m.profiles;
    return {
      id: m.id,
      content: m.content,
      created_at: m.created_at,
      user_id: m.user_id,
      project_id: id, // Add the missing project_id to match expected interface
      profiles: profile, // The profile is already in the correct format
      sender_role: m.sender_role || (m.user_id === projectOwnerId ? 'freelancer' : 'client'), // Include sender_role for MessagesTab
    };
  }) as any;

  interface ProjectFile {
    id?: string;
    name: string;
    size?: number;
    last_modified?: string;
    metadata?: {
      size?: number;
    };
    url?: string;
    user_id?: string;
  }
  
  const { data: filesRaw } = await supabase.storage.from("files").list(id);

  // Define the ProjectFile interface for this file
  // Transform files from Supabase storage format to ProjectFile format
  const files = filesRaw?.map((file: any) => ({
    name: file.name,
    id: file.id,
    last_modified: file.updated_at ? new Date(file.updated_at).toISOString() : undefined,
  })) || [] as any[];
  const { data: invoices } = await supabase.from("project_invoices").select("*").eq("project_id", id).order("created_at", { ascending: false });

  // accepted clients (robust, no join)
  const { data: projectClients } = await supabase.from("project_clients").select("client_id").eq("project_id", id);
  interface Client {
    id: string;
    email: string;
    accepted: boolean;
    role: string;
  }
  
  let acceptedClients: Client[] = [];
  if (projectClients && projectClients.length) {
    const ids = projectClients.map((c: { client_id: string }) => c.client_id);
    const { data: clientProfiles } = await supabase.from("profiles").select("id, email").in("id", ids);
    acceptedClients = (clientProfiles || []).map(profile => ({
      ...profile,
      accepted: true,
      role: "client"
    }));
  }

  const { data: pendingInvites } = await supabase.from("project_invites").select("id, email, accepted, role").eq("project_id", id).eq("accepted", false);

  return (
    <Motion className="max-w-5xl mx-auto py-6" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      {/* Header (shrink-0 so it doesn't flex) */}
      <div className="space-y-4 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            {project.description && <p className="text-muted-foreground mt-1">{project.description}</p>}
            {project.deadline && <p className="text-sm text-muted-foreground mt-1">Fällig am {new Date(project.deadline).toLocaleDateString("de-DE")}</p>}
          </div>

          {isFreelancer && (
            <div className="flex gap-2">
              <Button asChild variant="outline"><Link href={`/projects/${id}/edit`}>Projekt bearbeiten</Link></Button>
            </div>
          )}
        </div>

        {isFreelancer && <ClientInfoBar clients={acceptedClients || []} projectId={id} isFreelancer={true} />}

        <Separator />
      </div>

      {/* Client-side scrollable tabs area */}
      <ProjectTabsAnimated
        projectId={id}
        isFreelancer={isFreelancer}
        messages={messages || []}
        files={files || []}
        invoices={invoices || []}
        acceptedClients={acceptedClients || []}
        pendingInvites={pendingInvites || []}
        user={user_profile || undefined}
      />
    </Motion>
  );
}

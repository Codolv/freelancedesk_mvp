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

  const { data: user_profile } = await supabase.from("profiles").select("id, name, email, avatar_url").eq("id", user.id);

  const { data: project } = await supabase.from("projects").select("*").eq("id", id).single();
  if (!project) return <div className="flex items-center justify-center h-screen text-muted-foreground">Projekt nicht gefunden.</div>;

  const isFreelancer = project.user_id === user.id;
  const { data: isClient } = await supabase.from("project_clients").select("id").eq("project_id", id).eq("client_id", user.id).maybeSingle();

  if (!isFreelancer && !isClient) return <div className="flex items-center justify-center h-screen text-muted-foreground">Du hast keinen Zugriff auf dieses Projekt.</div>;

  // fetch data for tabs
  const { data: messagesRaw, error: messagesError } = await supabase
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

  const messages = await Promise.all(
    (messagesRaw || []).map(async (m) => ({
      ...m,
      profiles: {
        ...m.profiles,
        signedAvatarUrl: await getAvatarUrl((Array.isArray((m as any)?.profiles) ? (m as any).profiles[0]?.avatar_url : (m as any)?.profiles?.avatar_url) ?? null)
      },
    }))
  );

  const { data: files } = await supabase.storage.from("files").list(id);
  const { data: invoices } = await supabase.from("project_invoices").select("*").eq("project_id", id).order("created_at", { ascending: false });

  // accepted clients (robust, no join)
  const { data: projectClients } = await supabase.from("project_clients").select("client_id").eq("project_id", id);
  let acceptedClients: any[] = [];
  if (projectClients && projectClients.length) {
    const ids = projectClients.map((c: any) => c.client_id);
    const { data: clientProfiles } = await supabase.from("profiles").select("id, name, email, avatar_url").in("id", ids);
    acceptedClients = clientProfiles || [];
  }

  const { data: pendingInvites } = await supabase.from("project_invites").select("id, email, accepted").eq("project_id", id).eq("accepted", false);

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
        isClient={!!isClient}
        messages={messages || []}
        files={files || []}
        invoices={invoices || []}
        acceptedClients={acceptedClients || []}
        pendingInvites={pendingInvites || []}
        user={user_profile}
      />
    </Motion>
  );
}

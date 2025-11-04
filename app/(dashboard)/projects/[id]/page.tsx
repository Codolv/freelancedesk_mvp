// app/projects/[id]/page.tsx
import { getServerSupabaseComponent } from "@/lib/supabase/server";
import { Motion } from "@/components/custom/Motion";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ClientInfoBar } from "./components/ClientInfoBar";
import ProjectTabsAnimated from "./ProjectTabsAnimated";
import { getAvatarUrl } from '../../../../lib/supabase/getAvatarUrl';
import { MarkCompleteButton } from "./components/MarkCompleteButton";
import { getLocale } from "@/lib/i18n/server";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { formatDate } from "@/lib/i18n/date-format";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getServerSupabaseComponent();
  const locale = await getLocale();
  const dict = dictionaries[locale];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <div className="flex items-center justify-center h-screen text-muted-foreground">{dict["signin.title"]}</div>;

  const { data: userProfileRaw } = await supabase.from("profiles").select("id, name, email, avatar_url").eq("id", user.id);
  const userProfile = userProfileRaw?.[0] || null;

  const { data: project } = await supabase.from("projects").select("*").eq("id", id).single();
  if (!project) return <div className="flex items-center justify-center h-screen text-muted-foreground">{dict["projects.title"]} {dict["projects.not.found"]}</div>;

  const isFreelancer = project.user_id === user.id;
  const { data: isClient } = await supabase.from("project_clients").select("id").eq("project_id", id).eq("client_id", user.id).maybeSingle();

   if (!isFreelancer && !isClient) return <div className="flex items-center justify-center h-screen text-muted-foreground">{dict["dashboard.clients"]} {dict["projects.title"].toLowerCase()} {dict["projects.no.access"]}</div>;

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

  interface MessageProfile {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
  }

  interface Message {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    profiles: MessageProfile[];
  }

  interface Todo {
    id: string;
    title: string;
    description: string | null;
    completed: boolean;
    due_date: string | null;
    created_at: string;
    created_by: string;
    profiles: {
      id: string;
      name: string;
      email: string;
      avatar_url: string | null;
    } | null;
  }

  interface MilestoneProfile {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
  }

  interface Milestone {
    id: string;
    title: string;
    description: string | null;
    status: 'pending' | 'in_progress' | 'completed' | 'overdue';
    due_date: string | null;
    target_date: string | null;
    actual_completion_date: string | null;
    order_number: number;
    created_at: string;
    created_by: string;
    profiles: MilestoneProfile | null;
  }

  interface ProjectClient {
    client_id: string;
  }

  interface ProjectInvite {
    id: string;
    email: string;
    accepted: boolean;
  }

  interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
  }

  interface MessageWithAvatar {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    profiles: (MessageProfile & { signedAvatarUrl: string | null }) | null;
  }

  const messages = await Promise.all(
    (messagesRaw || []).map(async (m: Message) => {
      const firstProfile = m.profiles?.[0] || null;
      return {
        ...m,
        profiles: firstProfile ? {
          ...firstProfile,
          signedAvatarUrl: await getAvatarUrl(firstProfile.avatar_url ?? null)
        } : null,
      };
    })
  ) as MessageWithAvatar[];

  // Fetch files directly from the database using the same Supabase client
  const { data: files, error: filesError } = await supabase
    .from("project_files")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const filesData = filesError ? [] : files || [];

  const { data: invoices } = await supabase.from("project_invoices").select("*").eq("project_id", id).order("created_at", { ascending: false });

  // Fetch todos
  const { data: todos } = await supabase
    .from("project_todos")
    .select(`
      *,
      profiles (
        id,
        name,
        email,
        avatar_url
      )
    `)
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  // Fetch milestones
  const { data: milestones } = await supabase
    .from("project_milestones")
    .select(`
      *,
      profiles (
        id,
        name,
        email,
        avatar_url
      )
    `)
    .eq("project_id", id)
    .order("order_number", { ascending: true })
    .order("created_at", { ascending: false });

  interface ProjectClient {
    client_id: string;
  }

  // accepted clients (robust, no join)
  const { data: projectClients } = await supabase.from("project_clients").select("client_id").eq("project_id", id);
  let acceptedClients: UserProfile[] = [];
  if (projectClients && projectClients.length) {
    const ids = projectClients.map((c: ProjectClient) => c.client_id);
    const { data: clientProfiles } = await supabase.from("profiles").select("id, name, email, avatar_url").in("id", ids);
    acceptedClients = clientProfiles || [];
  }

  const { data: pendingInvites } = await supabase.from("project_invites").select("id, email, accepted").eq("project_id", id).eq("accepted", false);

  return (
    <Motion className="w-full max-w-7xl mx-auto py-6 px-4" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      {/* Header (shrink-0 so it doesn't flex) */}
      <div className="space-y-4 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            {project.description && <p className="text-muted-foreground mt-1">{project.description}</p>}
            {project.deadline && <p className="text-sm text-muted-foreground mt-1">{dict["invoice.created"]} {formatDate(project.deadline, locale)}</p>}
          </div>

          {isFreelancer && (
            <div className="flex gap-2">
              <MarkCompleteButton projectId={id} currentStatus={project.status} isFreelancer={isFreelancer} />
              <Button asChild variant="outline"><Link href={`/projects/${id}/edit`}>{dict["invoice.edit"]} {dict["dashboard.projects"]}</Link></Button>
            </div>
          )}
        </div>

        {/* Project Status Badge */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            project.status === 'completed' ? 'bg-green-100 text-green-800' :
            project.status === 'active' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {project.status === 'completed' ? dict["projects.completed"] :
             project.status === 'active' ? dict["projects.active"] : dict["dashboard.settings"]}
          </span>
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
        files={filesData}
        invoices={invoices || []}
        todos={todos || []}
        milestones={milestones || []}
        acceptedClients={acceptedClients || []}
        pendingInvites={pendingInvites || []}
        user={userProfile || null}
      />
    </Motion>
  );
}

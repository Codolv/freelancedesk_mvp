import { getServerSupabaseComponent } from "@/lib/supabase/server";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MessagesTab } from "./components/MessagesTab";
import { FilesTab } from "./components/FilesTab";
import { InvoicesTab } from "./components/InvoicesTab";
import { ClientsTab } from "./components/ClientsTab";
import { ClientInfoBar } from "./components/ClientInfoBar";
import { Motion } from "@/components/custom/Motion";
import InviteClientModal from "@/components/projects/InviteClientModal";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User, MessageSquare, Folder, Wallet } from "lucide-react";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await getServerSupabaseComponent();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        Bitte melde dich an.
      </div>
    );

  // === Fetch project info ===
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project)
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        Projekt nicht gefunden.
      </div>
    );

  // === Determine user role ===
  const isFreelancer = project.user_id === user.id;
  const { data: isClient } = await supabase
    .from("project_clients")
    .select("id")
    .eq("project_id", id)
    .eq("client_id", user.id)
    .maybeSingle();

  if (!isFreelancer && !isClient) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        Du hast keinen Zugriff auf dieses Projekt.
      </div>
    );
  }

  // === Fetch project data ===
  const { data: messages } = await supabase
    .from("project_messages")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const { data: files } = await supabase.storage.from("files").list(id);
  const { data: invoices } = await supabase
    .from("project_invoices")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const { data: acceptedClients } = await supabase
    .from("project_clients")
    .select("client_id, profiles(email)")
    .eq("project_id", id)
    .returns<{ id: string; email: string }[]>();

  const { data: pendingInvites } = await supabase
    .from("project_invites")
    .select("id, email, accepted")
    .eq("project_id", id)
    .eq("accepted", false);


  return (
    <Motion
      className="max-w-5xl mx-auto py-10 space-y-8"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* === Header === */}
      <Motion
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground mt-1">{project.description}</p>
          )}
          {project.deadline && (
            <p className="text-sm text-muted-foreground mt-1">
              Fällig am{" "}
              {new Date(project.deadline).toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
          )}
        </div>

        {isFreelancer && (
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href={`/projects/${id}/edit`}>Projekt bearbeiten</Link>
            </Button>
          </div>
        )}
      </Motion>

      {isFreelancer && (
        <ClientInfoBar
          clients={acceptedClients || []}
          projectId={id}
          isFreelancer={true}
        />
      )}

      <Separator />

      {/* === Tabs === */}
      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Nachrichten
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-2">
            <Folder className="h-4 w-4" /> Dateien
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" /> Rechnungen
          </TabsTrigger>
          {isFreelancer && (
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Kunden
            </TabsTrigger>
          )}
        </TabsList>

        {/* === Messages === */}
        <TabsContent value="messages">
          <MessagesTab
            messages={messages || []}
            projectId={id}
            readOnly={!isFreelancer && !isClient}
          />
        </TabsContent>

        {/* === Files === */}
        <TabsContent value="files">
          <FilesTab
            files={files || []}
            projectId={id}
            canUpload={isFreelancer}
          />
        </TabsContent>

        {/* === Invoices === */}
        <TabsContent value="invoices">
          <InvoicesTab
            invoices={invoices || []}
            projectId={id}
            canManage={isFreelancer}
          />
        </TabsContent>

        {/* === Clients (Freelancer only) === */}
        {isFreelancer && (
          <TabsContent value="clients">
            <ClientsTab
              projectId={id}
              clients={acceptedClients || []}
              invites={pendingInvites || []}
            />
          </TabsContent>
        )}
      </Tabs>
    </Motion>
  );
}

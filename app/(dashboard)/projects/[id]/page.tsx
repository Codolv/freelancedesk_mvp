// app/projects/[id]/page.tsx
import { getServerSupabaseComponent } from "@/lib/supabase/server";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MessagesTab } from "./components/MessagesTab";
import { FilesTab } from "./components/FilesTab";
import { InvoicesTab } from "./components/InvoicesTab";
import { Motion } from "@/components/custom/Motion";
import InviteClientModal from "@/components/projects/InviteClientModal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const supabase = await getServerSupabaseComponent();

  // === Fetch project ===
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  // === Related data ===
  const { data: messages } = await supabase
    .from("project_messages")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const { data: invoices } = await supabase
    .from("project_invoices")
    .select("*")
    .eq("project_id", id);

  // For Supabase storage, `list()` returns file metadata, not data prop
  const { data: files } = await supabase.storage.from("files").list(id);

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Projekt nicht gefunden.
      </div>
    );
  }

  return (
    <Motion
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto py-10 px-4 space-y-8"
    >
      {/* ===== Header ===== */}
      <Motion
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {project.name}
          </h1>

          {project.description && (
            <p className="text-muted-foreground mt-2">{project.description}</p>
          )}

          {project.deadline && (
            <div className="text-sm text-muted-foreground mt-2">
              <span className="font-medium">Fällig am:</span>{" "}
              {new Date(project.deadline).toLocaleDateString("de-DE")}
            </div>
          )}
        </div>

        <InviteClientModal projectId={id} />
      </Motion>

      <Separator className="opacity-40" />

      {/* ===== Tabs Section ===== */}
      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="bg-muted/30 p-1 rounded-xl w-full md:w-auto">
          <TabsTrigger value="messages" className="flex-1 md:flex-none">
            Nachrichten
          </TabsTrigger>
          <TabsTrigger value="files" className="flex-1 md:flex-none">
            Dateien
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex-1 md:flex-none">
            Rechnungen
          </TabsTrigger>
        </TabsList>

        {/* Nachrichten */}
        <TabsContent value="messages">
          <MessagesTab messages={messages || []} projectId={id} />
        </TabsContent>

        {/* Dateien */}
        <TabsContent value="files">
          <FilesTab files={files || []} projectId={id} />
        </TabsContent>

        {/* Rechnungen */}
        <TabsContent value="invoices">
          <InvoicesTab invoices={invoices || []} projectId={id} />
        </TabsContent>
      </Tabs>
    </Motion>
  );
}

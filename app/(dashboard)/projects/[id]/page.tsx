// app/projects/[id]/page.tsx
import { getServerSupabaseComponent } from "@/lib/supabase/server";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MessagesTab } from "./components/MessagesTab";
import { FilesTab } from "./components/FilesTab";
import { InvoicesTab } from "./components/InvoicesTab";
import { Motion } from "@/components/custom/Motion";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getServerSupabaseComponent();

  const { data: project } = await supabase.from("projects").select("*").eq("id", id).single();
  const { data: messages } = await supabase
    .from("project_messages")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });
  const { data: files } = await supabase.storage.from("files").list(id);
  const { data: invoices } = await supabase
    .from("project_invoices")
    .select("*")
    .eq("project_id", id);

  return (
    <Motion
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 max-w-4xl mx-auto py-8"
    >
      {/* Header */}
      <Motion
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project?.name}</h1>
          {project?.description && (
            <p className="text-muted-foreground mt-1">{project.description}</p>
          )}
          {project?.deadline && (
            <div className="text-sm text-muted-foreground mt-1">
              Fällig am:{" "}
              {new Date(project.deadline).toLocaleDateString("de-DE")}
            </div>
          )}
        </div>
      </Motion>

      <Tabs defaultValue="messages">
        <TabsList>
          <TabsTrigger value="messages">Nachrichten</TabsTrigger>
          <TabsTrigger value="files">Dateien</TabsTrigger>
          <TabsTrigger value="invoices">Rechnungen</TabsTrigger>
        </TabsList>

        <TabsContent value="messages">
          <MessagesTab messages={messages || []} projectId={id} />
        </TabsContent>

        <TabsContent value="files">
          <FilesTab files={files || []} projectId={id} />
        </TabsContent>

        <TabsContent value="invoices">
          <InvoicesTab invoices={invoices || []} projectId={id} />
        </TabsContent>
      </Tabs>
    </Motion>
  );
}

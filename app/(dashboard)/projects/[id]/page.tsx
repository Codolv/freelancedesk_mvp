// app/projects/[id]/page.tsx
import { getServerSupabaseComponent } from "@/lib/supabase/server";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MessagesTab } from "./components/MessagesTab";
import { FilesTab } from "./components/FilesTab";
import { InvoicesTab } from "./components/InvoicesTab";

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
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{project?.name ?? "Projekt"}</h1>

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
    </div>
  );
}

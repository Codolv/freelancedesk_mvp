// app/projects/[id]/clients/page.tsx
import { getServerSupabaseComponent } from "@/lib/supabase/server";
import InviteClientModal from "@/components/projects/InviteClientModal";
import Link from "next/link";

export default async function ProjectClientsPage({ params }: { params: { id: string } }) {
  const supabase = await getServerSupabaseComponent();
  const { data: clients } = await supabase
    .from("project_clients")
    .select("id, client_id, created_at, client:auth.users (id, email)")
    .eq("project_id", params.id);

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Kunden für dieses Projekt</h1>
        <InviteClientModal projectId={params.id} />
      </div>

      <div className="grid gap-3">
        {(clients || []).length === 0 && <div className="text-sm text-muted-foreground">Noch keine eingeladenen Kunden.</div>}
        {(clients || []).map((c: any) => (
          <div key={c.id} className="flex items-center justify-between border rounded p-3">
            <div>
              <div className="font-medium">{c.client?.email ?? "(unbekannt)"}</div>
              <div className="text-xs text-muted-foreground">Eingeladen am {new Date(c.created_at).toLocaleDateString('de-DE')}</div>
            </div>
            <div className="flex gap-2">
              <Link href={`/profile/${c.client_id}`} className="text-sm underline">Profil</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

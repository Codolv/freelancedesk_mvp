// app/projects/[id]/clients/page.tsx
import { getServerSupabaseComponent } from "@/lib/supabase/server";
import InviteClientModal from "@/components/projects/InviteClientModal";
import Link from "next/link";
import { formatDate } from "@/lib/i18n/date-format";
import { getLocale } from "@/lib/i18n/server";

interface ClientData {
  id: string;
  client_id: string;
  created_at: string;
  client: {
    id: string;
    email: string;
  } | null;
}

export default async function ProjectClientsPage({ params }: { params: { id: string } }) {
  const supabase = await getServerSupabaseComponent();
  const locale = await getLocale();
  const { data: clients } = await supabase
    .from("project_clients")
    .select("id, client_id, created_at, client:auth.users (id, email)")
    .eq("project_id", params.id) as { data: ClientData[] | null };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Kunden für dieses Projekt</h1>
        <InviteClientModal projectId={params.id} />
      </div>

      <div className="space-y-3">
        {(clients || []).length === 0 && <div className="text-sm text-muted-foreground text-center py-8">Noch keine eingeladenen Kunden.</div>}
        {(clients || []).map((c: ClientData) => (
          <div key={c.id} className="flex items-center justify-between border rounded-lg p-4 hover:bg-muted/20 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{c.client?.email ?? "(unbekannt)"}</div>
              <div className="text-xs text-muted-foreground">Eingeladen am {formatDate(c.created_at, locale)}</div>
            </div>
            <div className="flex gap-2 ml-4">
              <Link href={`/profile/${c.client_id}`} className="text-sm underline text-primary hover:text-primary/80 transition-colors">Profil</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

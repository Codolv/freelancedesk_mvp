// app/projects/[id]/clients/page.tsx
import { getServerSupabaseComponent } from "@/lib/supabase/server";
import { getAvatarUrl } from "@/lib/supabase/getAvatarUrl";
import InviteClientModal from "@/components/projects/InviteClientModal";
import Link from "next/link";
import { formatDate } from "@/lib/i18n/date-format";
import { getLocale } from "@/lib/i18n/server";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ClientData {
  id: string;
  client_id: string;
  created_at: string;
  client: {
    id: string;
    email: string;
    user_metadata: {
      avatar_url?: string;
      full_name?: string;
    } | null;
  } | null;
}

export default async function ProjectClientsPage({ params }: { params: { id: string } }) {
  const supabase = await getServerSupabaseComponent();
  const locale = await getLocale();
  const { data: clients } = await supabase
    .from("project_clients")
    .select("id, client_id, created_at, client:auth.users (id, email, user_metadata)")
    .eq("project_id", params.id) as { data: ClientData[] | null };

  // Create signed URLs for avatars
  const clientsWithSignedAvatars = [];
  for (const c of (clients || [])) {
    const avatarUrl = c.client?.user_metadata?.avatar_url || null;
    const signedAvatarUrl = avatarUrl ? await getAvatarUrl(avatarUrl) : null;
    clientsWithSignedAvatars.push({
      ...c,
      signed_avatar_url: signedAvatarUrl
    });
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Kunden für dieses Projekt</h1>
        <InviteClientModal projectId={params.id} />
      </div>

      <div className="space-y-3">
        {(clients || []).length === 0 && <div className="text-sm text-muted-foreground text-center py-8">Noch keine eingeladenen Kunden.</div>}
        {clientsWithSignedAvatars.map((c: ClientData & { signed_avatar_url: string | null }) => {
          const name = c.client?.user_metadata?.full_name || c.client?.email?.split('@')[0] || 'User';
          return (
            <div key={c.id} className="flex items-center justify-between border rounded-lg p-4 hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  {c.signed_avatar_url ? (
                    <AvatarImage
                      src={c.signed_avatar_url}
                      alt={name}
                    />
                  ) : (
                    <AvatarFallback>
                      {name?.charAt(0)?.toUpperCase() ?? "?"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{c.client?.email ?? "(unbekannt)"}</div>
                  <div className="text-xs text-muted-foreground">Eingeladen am {formatDate(c.created_at, locale)}</div>
                </div>
              </div>
              <div className="flex gap-2 ml-4 flex-shrink-0">
                <Link href={`/profile/${c.client_id}`} className="text-sm underline text-primary hover:text-primary/80 transition-colors">Profil</Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

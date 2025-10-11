// app/invite/[token]/page.tsx
import { getServerSupabaseAction } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Motion } from "@/components/custom/Motion"
import Image from "next/image";

async function acceptInviteServer(token: string) {
  "use server";
  const supabase = await getServerSupabaseAction();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Not logged in — redirect to signin with next param
    redirect(`/signin?next=/invite/${token}`);
  }

  // find invite
  const { data: invite } = await supabase
    .from("project_invites")
    .select("id, project_id, accepted, expires_at")
    .eq("token", token)
    .single();

  if (!invite) throw new Error("Ungültiger Einladungstoken.");

  if (invite.accepted) {
    // already accepted
    redirect(`/projects/${invite.project_id}`);
  }

  if (new Date(invite.expires_at) < new Date()) {
    throw new Error("Der Einladungslink ist abgelaufen.");
  }

  // add to project_clients (ignore conflict)
  await supabase.from("project_clients").insert({
    project_id: invite.project_id,
    client_id: user.id,
  });

  // mark invite accepted
  await supabase.from("project_invites").update({ accepted: true }).eq("id", invite.id);

  redirect(`/projects/${invite.project_id}`);
}

export default async function InvitePage({ params }: { params: { token: string } }) {
  // server-rendered page with a button that calls the server action
  const token = params.token;

  return (
    <Motion
      className="min-h-screen flex flex-col justify-center items-center px-6 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-background dark:to-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Logo */}
      <Motion
        className="flex flex-col items-center mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="FreelanceDesk Logo"
            width={240}
            height={40}
            className="rounded-md"
          />
        </div>
      </Motion>
      <h1 className="text-2xl font-semibold mb-4">Einladung annehmen</h1>
      <p className="mb-6">Klicke unten, um die Einladung anzunehmen und Zugriff auf das Projekt zu erhalten.</p>

      <form action={acceptInviteServer.bind(null, token)}>
        <button type="submit" className="btn btn-primary">Einladung annehmen</button>
      </form>
    </Motion>
  );
}

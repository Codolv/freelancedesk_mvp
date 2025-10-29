// app/invite/[token]/page.tsx
import { getServerSupabaseAction } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Motion } from "@/components/custom/Motion";
import { Button } from "@/components/ui/button";
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

export default async function InvitePage({
  params,
}: {
  params: { token: string };
}) {
  const token = params.token;

  return (
    <Motion
      className="min-h-screen flex flex-col justify-center items-center px-6 bg-gradient-to-br from-background via-muted/30 to-background text-foreground"
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
        <Image
          src="/logo.png"
          alt="FreelanceDesk Logo"
          width={180}
          height={40}
          className="rounded-md"
        />
        <p className="text-muted-foreground mt-2 text-sm">
          Projekt-Einladung • FreelanceDesk
        </p>
      </Motion>

      <Motion
        className="bg-card/80 backdrop-blur-md rounded-2xl shadow-lg border border-border/50 max-w-md w-full p-8 text-center space-y-4"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="text-2xl font-semibold">Einladung annehmen</h1>
        <p className="text-muted-foreground">
          Du wurdest eingeladen, an einem Projekt teilzunehmen. Klicke unten, um
          die Einladung anzunehmen und Zugriff zu erhalten.
        </p>

        <form action={acceptInviteServer.bind(null, token)}>
          <Button
            type="submit"
            size="lg"
            className="w-full mt-4 bg-[hsl(85,30%,35%)] hover:bg-[hsl(85,30%,30%)] text-white transition-all duration-300"
          >
            Einladung annehmen
          </Button>
        </form>
      </Motion>

      <Motion
        className="mt-10 text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        © {new Date().getFullYear()} FreelanceDesk. Alle Rechte vorbehalten.
      </Motion>
    </Motion>
  );
}

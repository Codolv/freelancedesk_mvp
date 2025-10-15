// app/actions/inviteClient.ts
"use server";

import { getServerSupabaseAction } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function resendInvite(inviteId: string) {
  const supabase = await getServerSupabaseAction();
  const { data: invite } = await supabase
    .from("project_invites")
    .select("email, token")
    .eq("id", inviteId)
    .single();

  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  if (!invite) throw new Error("Invite not found");

  await sendInviteEmail(invite.email, invite.token, expiresAt);
}

export async function revokeInvite(inviteId: string) {
  const supabase = await getServerSupabaseAction();
  await supabase.from("project_invites").delete().eq("id", inviteId);
}

async function sendInviteEmail(email: string, token: string, expires_at: string) {
  await resend.emails.send({
    from: process.env.FROM_EMAIL!,
    to: email,
    subject: `Einladung zu FreelanceDesk — Projektzugriff`,
    html: `
      <p>Sie wurden eingeladen, das Projekt auf <strong>FreelanceDesk</strong> anzusehen.</p>
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/invite/${token}">Einladung annehmen</a></p>
        <p>Der Link ist bis ${new Date(expires_at).toLocaleDateString("de-DE")} gültig.</p>
    `,
  });
}

export async function createProjectInvite(projectId: string, email: string) {
  const supabase = await getServerSupabaseAction();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // check caller owns the project
  const { data: project } = await supabase
    .from("projects")
    .select("id, user_id")
    .eq("id", projectId)
    .single();
  if (!project || project.user_id !== user.id) throw new Error("Unauthorized");

  // create token + invite row
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(); // 14 days
  const { error } = await supabase.from("project_invites").insert({
    project_id: projectId,
    email,
    token,
    expires_at: expiresAt,
  });

  if (error) throw error;

  await sendInviteEmail(email, token, expiresAt)

  return { success: true, token };
}

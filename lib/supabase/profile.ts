import { getBrowserSupabase } from "./client";

export async function getProfile() {
  const supabase = getBrowserSupabase();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error) throw error;
  return { ...data, email: user.email };
}

export async function updateProfile(profile: {
  phone?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  avatar_url?: string;
}) {
  const supabase = getBrowserSupabase();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, ...profile, updated_at: new Date().toISOString() });
  if (error) throw error;
}

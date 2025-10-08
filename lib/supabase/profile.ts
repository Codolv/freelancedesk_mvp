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

  const { data: singedUrl, error: urlError } = await supabase.storage
    .from("avatars")
    .createSignedUrl(data.avatar_url, 60 * 60);
  if (urlError) throw urlError
  return { ...data, email: user.email, singedAvatarUrl: singedUrl.signedUrl };
}

export async function updateProfile(profile: {
  name?: string;
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
    .update({name: profile.name, phone: profile.phone, linkedin: profile.linkedin, twitter: profile.twitter, website: profile.website, avatar_url: profile.avatar_url, updated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error) throw error;
}

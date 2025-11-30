import { getBrowserSupabase } from "./client";

export async function getProfileById(id: string) {
  const supabase = getBrowserSupabase();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;

  let signedAvatarUrl = null;
  if (data.avatar_url) {
    const { data: signedUrl, error: urlError } = await supabase.storage
      .from("avatars")
      .createSignedUrl(data.avatar_url, 60 * 60);
    if (!urlError) {
      signedAvatarUrl = signedUrl.signedUrl;
    }
  }
  return { ...data, email: user.email, signedAvatarUrl: signedAvatarUrl };
}

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

  let signedAvatarUrl = null;
  if (data.avatar_url) {
    const { data: signedUrl, error: urlError } = await supabase.storage
      .from("avatars")
      .createSignedUrl(data.avatar_url, 60 * 60);
    if (!urlError) {
      signedAvatarUrl = signedUrl.signedUrl;
    }
  }
  return { ...data, email: user.email, signedAvatarUrl: signedAvatarUrl };
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

import { getBrowserSupabase } from "./client";

interface ProfileUpdateData {
  name?: string;
  phone?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  avatar_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  logo_url?: string;
  company_name?: string;
  custom_css?: string;
}

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
  return { 
    ...data, 
    email: user.email, 
    signedAvatarUrl: signedAvatarUrl 
  };
}

export async function updateProfile(profile: ProfileUpdateData) {
  const supabase = getBrowserSupabase();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error("Not authenticated");
  
  const updateData: {
    [key: string]: string | undefined;
    updated_at: string;
  } = {
    updated_at: new Date().toISOString()
  };
  
  // Only add fields that are provided
  if (profile.name !== undefined) updateData.name = profile.name;
  if (profile.phone !== undefined) updateData.phone = profile.phone;
  if (profile.linkedin !== undefined) updateData.linkedin = profile.linkedin;
  if (profile.twitter !== undefined) updateData.twitter = profile.twitter;
  if (profile.website !== undefined) updateData.website = profile.website;
  if (profile.avatar_url !== undefined) updateData.avatar_url = profile.avatar_url;
  if (profile.primary_color !== undefined) updateData.primary_color = profile.primary_color;
  if (profile.secondary_color !== undefined) updateData.secondary_color = profile.secondary_color;
  if (profile.accent_color !== undefined) updateData.accent_color = profile.accent_color;
  if (profile.logo_url !== undefined) updateData.logo_url = profile.logo_url;
  if (profile.company_name !== undefined) updateData.company_name = profile.company_name;
  if (profile.custom_css !== undefined) updateData.custom_css = profile.custom_css;

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);
  if (error) throw error;
}

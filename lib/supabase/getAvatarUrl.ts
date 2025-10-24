import { getServerSupabaseComponent } from "./server";

export async function getAvatarUrl(path: string | null) {
  if (!path) return null;
  const supabase = await getServerSupabaseComponent();

  const { data } = await supabase.storage
    .from("avatars")
    .createSignedUrl(path, 60 * 60); // valid for 1 hour

  return data?.signedUrl || null;
}


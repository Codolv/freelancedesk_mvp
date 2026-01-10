import { getServerSupabaseComponent } from "./server";

export async function getAvatarUrl(path: string | null) {
  if (!path) return null;
  const supabase = await getServerSupabaseComponent();

  try {
    // Don't encode the path - Supabase expects the raw path
    const { data, error } = await supabase.storage
      .from("avatars")
      .createSignedUrl(path, 60 * 60); // valid for 1 hour

    if (error) {
      console.error('Error creating signed URL for avatar:', error);
      return null;
    }

    return data?.signedUrl || null;
  } catch (error) {
    console.error('Exception creating signed URL for avatar:', error);
    return null;
  }
}

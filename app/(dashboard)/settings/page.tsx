"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { getProfile, updateProfile } from "@/lib/supabase/profile";
import { useT } from "@/lib/i18n/client";

export default function SettingsPage() {
  const { t } = useT();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>({
    avatar_url: "",
    email: "",
    phone: "",
    linkedin: "",
    twitter: "",
    website: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    getProfile().then(setProfile).catch(() => {});
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const supabase = getBrowserSupabase();
    const userData = await supabase.auth.getUser();
    const user = userData.data.user;
    if (!user) return alert("Not authenticated");
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(`${user.id}/${file.name}`, file, { upsert: true });
    if (error) return alert(error.message);
    const url = supabase.storage.from("avatars").getPublicUrl(data.path).data.publicUrl;
    setProfile((p: any) => ({ ...p, avatar_url: url }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(profile);
      setMessage("Profile updated!");
    } catch (e) {
      setMessage("Error updating profile");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    const supabase = getBrowserSupabase();
    await supabase.auth.signOut();
    setMessage(t("settings.logout.success"));
    setLoading(false);
    setTimeout(() => {
      router.replace("/");
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-semibold">{t("dashboard.settings")}</h1>
      <div className="space-y-4 p-4 border rounded-lg bg-white/5">
        <div className="flex items-center gap-4">
          {profile.avatar_url && (
            <img src={profile.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
          )}
          <input type="file" accept="image/*" onChange={handleAvatarUpload} />
        </div>
        <div className="grid gap-2">
          <Label>Email</Label>
          <Input value={profile.email} disabled />
        </div>
        <div className="grid gap-2">
          <Label>Phone</Label>
          <Input value={profile.phone || ""} onChange={e => setProfile((p: any) => ({ ...p, phone: e.target.value }))} />
        </div>
        <div className="grid gap-2">
          <Label>LinkedIn</Label>
          <Input value={profile.linkedin || ""} onChange={e => setProfile((p: any) => ({ ...p, linkedin: e.target.value }))} />
        </div>
        <div className="grid gap-2">
          <Label>Twitter</Label>
          <Input value={profile.twitter || ""} onChange={e => setProfile((p: any) => ({ ...p, twitter: e.target.value }))} />
        </div>
        <div className="grid gap-2">
          <Label>Website</Label>
          <Input value={profile.website || ""} onChange={e => setProfile((p: any) => ({ ...p, website: e.target.value }))} />
        </div>
        <Button onClick={handleSave} disabled={loading} className="w-full">{loading ? "Saving..." : "Save Profile"}</Button>
        {message && <div className="text-green-600 dark:text-green-400 text-sm">{message}</div>}
      </div>
      <Button onClick={handleLogout} disabled={loading} variant="destructive" className="w-full">
        {loading ? "..." : t("settings.logout")}
      </Button>
    </div>
  );
}

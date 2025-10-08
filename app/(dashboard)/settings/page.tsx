"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Motion } from "@/components/custom/Motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { getProfile, updateProfile } from "@/lib/supabase/profile";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
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

  useEffect(() => {
    getProfile().then(setProfile).catch(() => {});
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const supabase = getBrowserSupabase();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return alert("Nicht angemeldet");
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
      setMessage("Profil wurde erfolgreich aktualisiert.");
    } catch (e) {
      setMessage("Fehler beim Aktualisieren des Profils.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    const supabase = getBrowserSupabase();
    await supabase.auth.signOut();
    setMessage("Erfolgreich abgemeldet.");
    setTimeout(() => router.replace("/"), 1000);
  };

  return (
    <Motion
      className="max-w-2xl mx-auto py-10 space-y-8"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Motion
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Einstellungen
        </h1>
        <p className="text-muted-foreground">
          Verwalte dein Profil und persönliche Informationen.
        </p>
      </Motion>

      <Card className="shadow-md border border-border/50 bg-background/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Profilinformationen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Motion
            className="flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {profile.avatar_url ? (
              <Motion
                key={profile.avatar_url}
                src={profile.avatar_url}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover border"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-800" />
            )}
            <div>
              <Label className="block mb-2">Profilbild ändern</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="cursor-pointer"
              />
            </div>
          </Motion>

          <Separator />

          {/* Email */}
          <div className="grid gap-2">
            <Label>Email-Adresse</Label>
            <Input value={profile.email} disabled className="bg-muted" />
          </div>

          {/* Phone */}
          <div className="grid gap-2">
            <Label>Telefonnummer</Label>
            <Input
              value={profile.phone || ""}
              onChange={(e) =>
                setProfile((p: any) => ({ ...p, phone: e.target.value }))
              }
              placeholder="+49 ..."
            />
          </div>

          {/* LinkedIn */}
          <div className="grid gap-2">
            <Label>LinkedIn</Label>
            <Input
              value={profile.linkedin || ""}
              onChange={(e) =>
                setProfile((p: any) => ({ ...p, linkedin: e.target.value }))
              }
              placeholder="https://linkedin.com/in/..."
            />
          </div>

          {/* Twitter */}
          <div className="grid gap-2">
            <Label>Twitter / X</Label>
            <Input
              value={profile.twitter || ""}
              onChange={(e) =>
                setProfile((p: any) => ({ ...p, twitter: e.target.value }))
              }
              placeholder="https://twitter.com/..."
            />
          </div>

          {/* Website */}
          <div className="grid gap-2">
            <Label>Website</Label>
            <Input
              value={profile.website || ""}
              onChange={(e) =>
                setProfile((p: any) => ({ ...p, website: e.target.value }))
              }
              placeholder="https://deine-website.de"
            />
          </div>

          {/* Save Button */}
          <Motion
            className="pt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                "Profil speichern"
              )}
            </Button>
            {message && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                {message}
              </p>
            )}
          </Motion>
        </CardContent>
      </Card>

      <Motion
        className="pt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          onClick={handleLogout}
          variant="destructive"
          disabled={loading}
          className="w-full text-base"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Wird
              abgemeldet...
            </>
          ) : (
            "Abmelden"
          )}
        </Button>
      </Motion>
    </Motion>
  );
}


"use client";

import { getBrowserSupabase } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Motion } from "@/components/custom/Motion"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { getProfile, updateProfile } from "@/lib/supabase/profile";
import { useT } from "@/lib/i18n/client";

interface Profile {
  avatar_url: string;
  email: string;
  phone: string;
  linkedin: string;
  twitter: string;
  website: string;
  name?: string;
  signedAvatarUrl?: string;
}

interface ProfileUpdate {
  avatar_url: string;
  email: string;
  phone: string;
  linkedin: string;
  twitter: string;
  website: string;
  name?: string;
  signedAvatarUrl?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { t } = useT();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    avatar_url: "",
    email: "",
    phone: "",
    linkedin: "",
    twitter: "",
    website: "",
  });

  useEffect(() => {
    getProfile().then(setProfile).catch(() => { });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(profile);
      setMessage(t("settings.logout.success"));
      setEditing(false);
    } catch (e) {
      setMessage(t("dashboard.settings"));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    const supabase = getBrowserSupabase();
    await supabase.auth.signOut();
    setLoading(false);
    setTimeout(() => {
      router.replace("/");
    }, 1000);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const supabase = getBrowserSupabase();
    const userData = await supabase.auth.getUser();
    const user = userData.data.user;
    if (!user) return alert("Not authenticated");

    const { data: list, error: listError } = await supabase.storage.from("avatars").list(user.id);
    if (list) {
      const filesToRemove = list.map((x) => `${user.id}/${x.name}`);
      await supabase.storage.from("avatars").remove(filesToRemove);
    }

    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(`${user.id}/${file.name}`, file, { upsert: true });
    if (error) return alert(error.message);
    setProfile((p: Profile) => ({ ...p, avatar_url: `${user.id}/${file.name}` }));
  };

  return (
    <Motion
      className="max-w-2xl mx-auto py-10 space-y-8"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-3xl font-bold tracking-tight mb-2">{t("dashboard.settings")}</h1>
      <p className="text-muted-foreground mb-6">
        {t("hero.subtitle")}
      </p>

      <Card className="shadow-md border border-border/50 bg-background/80 backdrop-blur-sm">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>{t("dashboard.clients")}</CardTitle>
          {!editing && (
            <div className="flex justify-end gap-3 pt-4">
              <Button onClick={() => setEditing(true)}>{t("invoice.edit")} {t("dashboard.clients")}</Button>
              <Button variant="destructive" onClick={handleLogout}>{t("settings.logout")}</Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            {!editing ? (
              <Motion
                key="view-mode"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  {profile.signedAvatarUrl ? (
                    <motion.img
                      src={profile.signedAvatarUrl}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full object-cover border"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-800" />
                  )}
                  <div>
                    <p className="font-medium">{profile.name}</p>
                    <p className="font-medium">{profile.email}</p>
                    {profile.website && (
                      <a
                        href={profile.website}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {profile.website}
                      </a>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">{t("dashboard.clients")}</p>
                    <p>{profile.phone || t("dashboard.settings")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">LinkedIn</p>
                    <p>{profile.linkedin || t("dashboard.settings")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Twitter / X</p>
                    <p>{profile.twitter || t("dashboard.settings")}</p>
                  </div>
                </div>
              </Motion>
            ) : (
              <Motion
                key="edit-mode"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* Editable Fields */}

                <div className="flex items-center gap-4">
                  {profile.signedAvatarUrl ? (
                    <motion.img
                      src={profile.signedAvatarUrl}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full object-cover border"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-800" />
                  )}
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} />
                </div>

                <div className="grid gap-2">
                  <Label>{t("signin.email")}</Label>
                  <Input value={profile.email} disabled className="bg-muted" />
                </div>

                <div className="grid gap-2">
                  <Label>{t("dashboard.clients")}</Label>
                  <Input
                    value={profile.name || ""}
                    onChange={(e) =>
                      setProfile((p: Profile) => ({ ...p, name: e.target.value }))
                    }
                    placeholder={t("dashboard.clients")}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>{t("dashboard.clients")}</Label>
                  <Input
                    value={profile.phone || ""}
                    onChange={(e) =>
                      setProfile((p: Profile) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="+49 ..."
                  />
                </div>

                <div className="grid gap-2">
                  <Label>LinkedIn</Label>
                  <Input
                    value={profile.linkedin || ""}
                    onChange={(e) =>
                      setProfile((p: Profile) => ({
                        ...p,
                        linkedin: e.target.value,
                      }))
                    }
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Twitter / X</Label>
                  <Input
                    value={profile.twitter || ""}
                    onChange={(e) =>
                      setProfile((p: Profile) => ({
                        ...p,
                        twitter: e.target.value,
                      }))
                    }
                    placeholder="https://twitter.com/..."
                  />
                </div>

                <div className="grid gap-2">
                  <Label>{t("invoice.project")}</Label>
                  <Input
                    value={profile.website || ""}
                    onChange={(e) =>
                      setProfile((p: Profile) => ({
                        ...p,
                        website: e.target.value,
                      }))
                    }
                    placeholder="https://deine-website.de"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setEditing(false)}
                    disabled={loading}
                  >
                    {t("dashboard.settings")}
                  </Button>
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("invoice.edit")}...
                      </>
                    ) : (
                      t("invoice.edit")
                    )}
                  </Button>
                </div>

                {message && (
                  <p className="text-sm text-green-60 dark:text-green-400">
                    {message}
                  </p>
                )}
              </Motion>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </Motion>
  );
}

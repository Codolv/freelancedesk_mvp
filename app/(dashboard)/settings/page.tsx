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

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<any>({
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
      setMessage("Profil wurde erfolgreich aktualisiert.");
      setEditing(false);
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
    setLoading(false);
    setTimeout(() => {
      router.replace("/");
    }, 1000);
  };

  return (
    <Motion
      className="max-w-2xl mx-auto py-10 space-y-8"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-3xl font-bold tracking-tight mb-2">Einstellungen</h1>
      <p className="text-muted-foreground mb-6">
        Verwalte dein Profil und persönliche Informationen.
      </p>

      <Card className="shadow-md border border-border/50 bg-background/80 backdrop-blur-sm">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Profil</CardTitle>
          {!editing && (
            <div className="flex justify-end gap-3 pt-4">
              <Button onClick={() => setEditing(true)}>Profil bearbeiten</Button>
              <Button variant="destructive" onClick={handleLogout}>Ausloggen</Button>
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
                  {profile.singedAvatarUrl ? (
                    <motion.img
                      src={profile.singedAvatarUrl}
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
                    <p className="text-muted-foreground">Telefon</p>
                    <p>{profile.phone || "Nicht angegeben"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">LinkedIn</p>
                    <p>{profile.linkedin || "Nicht angegeben"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Twitter / X</p>
                    <p>{profile.twitter || "Nicht angegeben"}</p>
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
                <div className="grid gap-2">
                  <Label>Email-Adresse</Label>
                  <Input value={profile.email} disabled className="bg-muted" />
                </div>

                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input
                    value={profile.name || ""}
                    onChange={(e) =>
                      setProfile((p: any) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="Name"
                  />
                </div>

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

                <div className="grid gap-2">
                  <Label>LinkedIn</Label>
                  <Input
                    value={profile.linkedin || ""}
                    onChange={(e) =>
                      setProfile((p: any) => ({
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
                      setProfile((p: any) => ({
                        ...p,
                        twitter: e.target.value,
                      }))
                    }
                    placeholder="https://twitter.com/..."
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Website</Label>
                  <Input
                    value={profile.website || ""}
                    onChange={(e) =>
                      setProfile((p: any) => ({
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
                    Abbrechen
                  </Button>
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Speichern...
                      </>
                    ) : (
                      "Speichern"
                    )}
                  </Button>
                </div>

                {message && (
                  <p className="text-sm text-green-600 dark:text-green-400">
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

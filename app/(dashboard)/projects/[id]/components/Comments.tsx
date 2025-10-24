"use client";

import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Motion } from "@/components/custom/Motion";
import ReactMarkdown from "react-markdown";

export function Comments({ messages: initialMessages, projectId }: any) {
  const supabase = getBrowserSupabase();
  const [messages, setMessages] = useState(initialMessages || []);
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  // === Fetch signed avatar URLs ===
  async function getAvatarUrl(path: string | null) {
    if (!path) return null;
    const { data } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60);
    return data?.signedUrl || null;
  }

  // === Enrich messages with profile info and avatar URL ===
  async function enrichMessages(rawMessages: any[]) {
    const userIds = [...new Set(rawMessages.map((m) => m.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("id, name, avatar_url").in("id", userIds);
    const enriched = await Promise.all(
      rawMessages.map(async (m) => {
        const profile = profiles?.find((p) => p.id === m.user_id);
        const signedAvatarUrl = await getAvatarUrl(profile?.avatar_url || null);
        return { ...m, profile: { ...profile, signedAvatarUrl } };
      })
    );
    return enriched;
  }

  // === Initialize messages ===
  useEffect(() => {
    enrichMessages(initialMessages).then(setMessages);
  }, []);

  // === Realtime subscription ===
  useEffect(() => {
    const channel = supabase
      .channel(`project-messages-${projectId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "project_messages", filter: `project_id=eq.${projectId}` },
        async (payload) => {
          const newMsg = payload.new;
          const enriched = await enrichMessages([newMsg]);
          setMessages((prev: any[]) => [enriched[0], ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  // === Post new message ===
  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Optimistic UI
      const optimisticMsg = {
        id: `temp-${Date.now()}`,
        project_id: projectId,
        user_id: user.id,
        content,
        created_at: new Date().toISOString(),
        profile: { name: "Du", signedAvatarUrl: null },
      };
      setMessages((prev: any[]) => [optimisticMsg, ...prev]);
      setContent("");

      // Send to Supabase
      await supabase.from("project_messages").insert({ project_id: projectId, user_id: user.id, content });
    } finally {
      setPosting(false);
    }
  };

  return (
    <Card className="shadow-sm border border-border/50 bg-background/80 backdrop-blur-sm">
      <CardHeader>
        <h2 className="text-xl font-semibold">Nachrichten</h2>
        <p className="text-sm text-muted-foreground">
          Teile Updates und Fortschritte mit deinem Kunden.
        </p>
      </CardHeader>

      <CardContent>
        {/* === Post new message form === */}
        <form onSubmit={handlePost} className="space-y-3 mb-6">
          <Label htmlFor="content">Nachricht (Markdown unterstützt)</Label>
          <Textarea
            id="content"
            name="content"
            rows={4}
            placeholder="Update schreiben..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={posting}
          />
          <Button type="submit" disabled={posting}>
            {posting ? "Posten..." : "Posten"}
          </Button>
        </form>

        {/* === Messages List === */}
        <Motion layout className="space-y-4 overflow-y-auto max-h-[60vh] pr-2">
          {messages.length === 0 && (
            <div className="text-sm text-muted-foreground">Noch keine Nachrichten.</div>
          )}

          {messages.map((m: any, idx: number) => (
            <Motion
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="flex gap-3 items-start border rounded-md p-3 bg-card hover:bg-muted/40 transition"
            >
              {m.profile?.signedAvatarUrl ? (
                <Avatar className="h-9 w-9">
                  <AvatarImage src={m.profiles?.signedAvatarUrl || ""} alt={m.profiles?.name || "U"} />
                  <AvatarFallback>{m.profiles?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-sm font-medium">
                  {m.profile?.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium">{m.profile?.name || "Unbekannt"}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(m.created_at).toLocaleString("de-DE")}
                  </span>
                </div>
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            </Motion>
          ))}
        </Motion>
      </CardContent>
    </Card>
  );
}
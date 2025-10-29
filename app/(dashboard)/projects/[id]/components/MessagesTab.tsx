"use client";

import { useState, useTransition } from "react";
import { addMessage } from "../actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Motion } from "@/components/custom/Motion";
import ReactMarkdown from "react-markdown";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_role: "freelancer" | "client";
}

export function MessagesTab({ messages, projectId }: { messages: Message[]; projectId: string; userRole?: "freelancer" | "client" }) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    const message = formData.get("content")?.toString().trim();
    if (!message) return;
    setContent("");
    startTransition(async () => {
      await addMessage(projectId, message);
    });
  };
  

  return (
    <Card className="shadow-sm border border-border/50 bg-background/80 backdrop-blur-sm">
      <CardHeader>
        <h2 className="text-xl font-semibold">Nachrichten</h2>
        <p className="text-sm text-muted-foreground">
          Kommuniziere mit deinem Kunden oder Freelancer direkt hier im Projekt.
        </p>
      </CardHeader>

      <CardContent>
        {/* Send message form */}
        <form action={handleSubmit} className="space-y-3 mb-8">
          <Label htmlFor="content">Nachricht (Markdown unterstützt)</Label>
          <Textarea
            id="content"
            name="content"
            rows={3}
            placeholder="Nachricht schreiben..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isPending}
          />
          <Button type="submit" disabled={isPending || !content.trim()}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Senden...
              </>
            ) : (
              "Senden"
            )}
          </Button>
        </form>

        {/* Message list */}
        <div className="space-y-4">
          {(messages || []).length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-6">
              Noch keine Nachrichten vorhanden.
            </div>
          )}

          {(messages || []).map((m: Message, idx: number) => {
            const isFreelancer = m.sender_role === "freelancer";
            return (
              <Motion
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={cn(
                  "flex flex-col max-w-lg",
                  isFreelancer ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div
                  className={cn(
                    "p-3 rounded-xl border text-sm w-fit max-w-[80%] shadow-sm transition-all",
                    isFreelancer
                      ? "bg-primary/20 border-primary/40"
                      : "bg-muted/40 border-border/50"
                  )}
                >
                  <ReactMarkdown>
                    {m.content}
                  </ReactMarkdown>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {isFreelancer ? "Freelancer" : "Kunde"} •{" "}
                  {new Date(m.created_at).toLocaleString("de-DE")}
                </div>
              </Motion>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

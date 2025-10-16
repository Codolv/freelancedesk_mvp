"use client";

import { useState, useRef } from "react";
import { useTransition } from "react";
import { addMessage } from "../actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Motion } from "@/components/custom/Motion";
import ReactMarkdown from "react-markdown";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export function Comments({ projectId, messages = [], user }: any) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const formData = new FormData();
    formData.append("content", content);
    startTransition(() => {
      addMessage(projectId, formData);
    });

    setContent("");
  };

  return (
    <div className="flex flex-col h-[70vh] max-h-[70vh] border rounded-lg bg-card/60 backdrop-blur-sm overflow-hidden">
      {/* === Message List === */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">Noch keine Kommentare.</p>
        ) : (
          messages.map((m: any, i: number) => (
            <Motion
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex gap-3 group"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={m.user_avatar_url || ""} alt={m.sender_role || "U"} />
                <AvatarFallback>{m.sender_role?.[0]?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">{m.sender_role || "Unbekannt"}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(m.created_at), "dd.MM.yyyy HH:mm", { locale: de })}
                  </span>
                </div>

                <div className="mt-1 prose prose-sm dark:prose-invert text-sm leading-relaxed">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>

                {/* Hover actions like edit/delete */}
                {m.user_id === user?.id && (
                  <div className="opacity-0 group-hover:opacity-100 transition text-xs mt-1 flex gap-2">
                    <button className="text-blue-600 hover:underline">Bearbeiten</button>
                    <button className="text-red-600 hover:underline">Löschen</button>
                  </div>
                )}
                <Separator className="mt-3" />
              </div>
            </Motion>
          ))
        )}
      </div>

      {/* === Comment Input === */}
      <div className="border-t p-4 bg-background sticky bottom-0">
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Kommentar hinzufügen... (Markdown unterstützt)"
            className="min-h-[80px] resize-none focus:min-h-[120px] transition-all duration-300"
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending || !content.trim()}>
              {isPending ? "Wird gesendet..." : "Posten"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

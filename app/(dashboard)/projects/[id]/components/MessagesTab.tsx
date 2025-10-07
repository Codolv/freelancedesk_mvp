// app/projects/[id]/components/MessagesTab.tsx
"use client";

import { useState } from "react";
import { addMessage } from "../actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import ReactMarkdown from "react-markdown";

export function MessagesTab({ messages, projectId }: any) {
  const [content, setContent] = useState("");

  return (
    <div className="grid gap-3">
      <form
        action={async (formData) => {
          await addMessage(projectId, formData);
          setContent("");
        }}
        className="grid gap-2 max-w-2xl"
      >
        <Label htmlFor="content">Nachricht (Markdown unterstützt)</Label>
        <Textarea
          id="content"
          name="content"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Update schreiben..."
        />
        <Button type="submit">Posten</Button>
      </form>

      <div className="grid gap-3">
        {messages.length === 0 && (
          <div className="opacity-70 text-sm">Noch keine Nachrichten.</div>
        )}
        {messages.map((m: any) => (
          <div key={m.id} className="rounded-lg border border-white/15 p-4 bg-white/5">
            <div className="text-xs opacity-70 mb-2">
              {new Date(m.created_at).toLocaleString("de-DE")}
            </div>
            <ReactMarkdown>{m.content}</ReactMarkdown>
          </div>
        ))}
      </div>
    </div>
  );
}

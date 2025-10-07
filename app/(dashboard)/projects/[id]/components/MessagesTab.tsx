// app/projects/[id]/components/MessagesTab.tsx
"use client";

import { useState } from "react";
import { addMessage } from "../actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Motion } from "@/components/custom/Motion";
import ReactMarkdown from "react-markdown";

export function MessagesTab({ messages, projectId }: any) {
  const [content, setContent] = useState("");

  return (
    <Card className="shadow-sm border border-border/50 bg-background/80 backdrop-blur-sm">
            <CardHeader>
              <h2 className="text-xl font-semibold">Nachrichten</h2>
              <p className="text-sm text-muted-foreground">
                Teile Updates und Fortschritte mit deinem Kunden.
              </p>
            </CardHeader>
            <CardContent>
              <form
                action={addMessage.bind(null, projectId)}
                className="space-y-3 mb-6"
              >
                <Label htmlFor="content">Nachricht (Markdown unterstützt)</Label>
                <Textarea
                  id="content"
                  name="content"
                  rows={4}
                  placeholder="Update schreiben..."
                />
                <Button type="submit">Posten</Button>
              </form>

              <Motion
                layout
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {(messages || []).length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    Noch keine Nachrichten.
                  </div>
                )}
                {(messages || []).map((m: any, idx: number) => (
                  <Motion
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="rounded-lg border border-border/50 p-4 bg-card"
                  >
                    <div className="text-xs text-muted-foreground mb-2">
                      {new Date(m.created_at).toLocaleString("de-DE")}
                    </div>
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </Motion>
                ))}
              </Motion>
            </CardContent>
          </Card>
  );
}

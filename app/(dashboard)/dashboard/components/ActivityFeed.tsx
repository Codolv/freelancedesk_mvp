"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { formatDistanceToNow } from "date-fns";

export default function ActivityFeed({ messages }: { messages: any[] }) {
  return (
    <Card className="bg-background/80 border-border/60 backdrop-blur-sm">
      <CardHeader>
        <h3 className="text-lg font-semibold">Letzte Aktivitäten</h3>
        <p className="text-sm text-muted-foreground">
          Die letzten Nachrichten deiner Projekte
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">Noch keine Aktivitäten.</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className="border rounded-md p-3 bg-card">
            <ReactMarkdown>{m.content}</ReactMarkdown>
            <div className="text-xs text-muted-foreground mt-1">
              {m.projects?.name
                ? `Projekt: ${m.projects.name} • `
                : ""}
              {formatDistanceToNow(new Date(m.created_at), {
                addSuffix: true,
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

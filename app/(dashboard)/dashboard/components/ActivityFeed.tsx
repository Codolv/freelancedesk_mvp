"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { formatDistanceToNow } from "date-fns";
import { useT } from "@/lib/i18n/client";

interface Message {
  id: string;
  content: string;
  created_at: string;
  projects?: {
    name: string;
  }[];
}

export default function ActivityFeed({ messages }: { messages: Message[] }) {
  const { t } = useT();
  return (
    <Card className="bg-background/80 border-border/60 backdrop-blur-sm">
      <CardHeader>
        <h3 className="text-lg font-semibold">{t("dashboard.activity")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("dashboard.project.messages")}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("dashboard.no.activity")}</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className="border rounded-md p-3 bg-card">
            <ReactMarkdown>{m.content}</ReactMarkdown>
            <div className="text-xs text-muted-foreground mt-1">
              {m.projects?.[0]?.name
                ? `${t("dashboard.project")}: ${m.projects[0].name} • `
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

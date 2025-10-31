"use client";

import { Motion } from "@/components/custom/Motion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  text: string;
  at: Date;
}

export default function ActivityFeed({ initialData }: { initialData?: ActivityItem[] }) {
  const activities = initialData || [
    { id: "a1", text: "Rechnung #24 wurde bezahlt.", at: new Date(Date.now() - 1000 * 60 * 60 * 24) },
    { id: "a2", text: "Julia hat eine Datei hochgeladen (Projekt: Website Relaunch).", at: new Date(Date.now() - 1000 * 60 * 60 * 48) },
    { id: "a3", text: "Neues Projekt 'Brand Redesign' erstellt.", at: new Date(Date.now() - 1000 * 60 * 60 * 72) },
  ];

 return (
    <Motion initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="">
      <Card className="bg-background/80 border-border/60 backdrop-blur-sm">
        <CardHeader>
          <h3 className="text-lg font-semibold">Letzte Aktivitäten</h3>
          <p className="text-sm text-muted-foreground">Feed der letzten Änderungen</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activities.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-olive-600 mt-2" />
                <div>
                  <div className="text-sm font-medium">{a.text}</div>
                  <div className="text-xs text-muted-foreground">{formatDistanceToNow(a.at, { addSuffix: true, locale: undefined })}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Motion>
  );
}

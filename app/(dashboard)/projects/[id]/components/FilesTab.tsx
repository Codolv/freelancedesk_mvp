// app/projects/[id]/components/FilesTab.tsx
"use client";

import { uploadFile } from "../actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Motion } from "@/components/custom/Motion";

export function FilesTab({ files, projectId }: any) {
  return (
    <Card className="shadow-sm border border-border/50 bg-background/80 backdrop-blur-sm">
            <CardHeader>
              <h2 className="text-xl font-semibold">Dateien</h2>
              <p className="text-sm text-muted-foreground">
                Lade Dateien hoch und teile sie mit deinem Kunden.
              </p>
            </CardHeader>
            <CardContent>
              <form
                action={uploadFile.bind(null, projectId)}
                className="flex items-center gap-3 mb-4"
              >
                <Input type="file" name="file" />
                <Button type="submit">Hochladen</Button>
              </form>

              <div className="space-y-2">
                {(files || []).length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    Noch keine Dateien.
                  </div>
                )}
                {(files || []).map((f: any, idx: number) => (
                  <Motion
                    key={f.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between text-sm border rounded-md p-3 hover:bg-muted/50 transition-colors"
                  >
                    <span className="truncate">{f.name}</span>
                    <a
                      className="text-blue-600 hover:text-blue-800 underline"
                      target="_blank"
                      rel="noreferrer"
                      href={`https://<YOUR_SUPABASE_URL>/storage/v1/object/public/files/${projectId}/${f.name}`}
                    >
                      Download
                    </a>
                  </Motion>
                ))}
              </div>
            </CardContent>
          </Card>
  );
}

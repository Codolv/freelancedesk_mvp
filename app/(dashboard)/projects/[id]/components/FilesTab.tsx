"use client";

import { useState, useTransition, useEffect } from "react";
import { uploadFile, deleteFile, getFileUrl } from "../actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Motion } from "@/components/custom/Motion";
import { Loader2, Trash2, Upload, FileIcon, Download } from "lucide-react";

export function FilesTab({ files: initialFiles, projectId }: any) {
  const [files, setFiles] = useState(initialFiles || []);
  const [fileUrls, setFileUrls] = useState<Record<string, string | undefined>>({});
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);

  // Fetch signed/public URLs
  useEffect(() => {
    (async () => {
      const urls: Record<string, string | undefined> = {};
      for (const f of files) {
        try {
          const url = await getFileUrl(`${projectId}/${f.name}`);
          urls[f.name] = url;
        } catch (err) {
          console.error("Error fetching file URL:", err);
        }
      }
      setFileUrls(urls);
    })();
  }, [files, projectId]);

  // Handle upload
  const handleUpload = async (formData: FormData) => {
    setUploading(true);
    startTransition(async () => {
      try {
        const newFile = await uploadFile(projectId, formData);
        if (newFile) {
          setFiles((prev) => [newFile, ...prev]);
        }
      } catch (err) {
        console.error("Upload failed:", err);
      } finally {
        setUploading(false);
      }
    });
  };

  // Handle delete
  const handleDelete = async (fileName: string) => {
    startTransition(async () => {
      try {
        await deleteFile(projectId, fileName);
        setFiles((prev) => prev.filter((f: any) => f.name !== fileName));
      } catch (err) {
        console.error("Delete failed:", err);
      }
    });
  };

  // Utility for formatting file size
  const formatSize = (bytes: number) => {
    if (!bytes) return "-";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
  };

  return (
    <Card className="shadow-sm border border-border/50 bg-background/80 backdrop-blur-sm">
      <CardHeader>
        <h2 className="text-xl font-semibold">Dateien</h2>
        <p className="text-sm text-muted-foreground">
          Lade Dateien hoch und teile sie mit deinem Kunden.
        </p>
      </CardHeader>
      <CardContent>
        {/* Upload form */}
        <form
          action={handleUpload}
          className="flex items-center gap-3 mb-6"
        >
          <Input
            type="file"
            name="file"
            disabled={uploading || isPending}
          />
          <Button type="submit" disabled={uploading || isPending}>
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Hochladen...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" /> Hochladen
              </>
            )}
          </Button>
        </form>

        {/* File list */}
        <div className="rounded-md border border-border/50 divide-y divide-border/50">
          {files.length === 0 && (
            <div className="text-sm text-muted-foreground p-4 text-center">
              Noch keine Dateien vorhanden.
            </div>
          )}

          {files.map((f: any, idx: number) => (
            <Motion
              key={f.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-3 truncate">
                <FileIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="truncate">
                  <div className="font-medium truncate">{f.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {f.last_modified
                      ? new Date(f.last_modified).toLocaleDateString("de-DE")
                      : "–"}{" "}
                    • {formatSize(f.metadata?.size || f.size || 0)}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                {fileUrls[f.name] && (
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <a
                      href={fileUrls[f.name]}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive/90"
                  onClick={() => handleDelete(f.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Motion>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

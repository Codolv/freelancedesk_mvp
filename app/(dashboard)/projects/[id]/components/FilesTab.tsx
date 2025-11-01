"use client";

import { useState, useTransition, useEffect } from "react";
import { uploadFile, deleteFile } from "../actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Motion } from "@/components/custom/Motion";
import { Loader2, Trash2, Upload, FileIcon, Download } from "lucide-react";

interface FileDownload {
  id: string;
  project_id: string;
  file_name: string;
  user_id: string;
  downloaded_at: string;
  created_at: string;
}

interface FileItem {
  name: string;
  size?: number;
  last_modified?: number;
  metadata?: {
    size?: number;
  };
}

interface DownloadInfo {
  count: number;
  lastDownloaded: string | null;
  hasDownloads: boolean;
}

export function FilesTab({ files: initialFiles, projectId }: { files: FileItem[]; projectId: string }) {
  const [files, setFiles] = useState<FileItem[]>(initialFiles || []);
  const [fileDownloads, setFileDownloads] = useState<Record<string, FileDownload[]>>({});
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);

  // Handle upload
  const handleUpload = async (formData: FormData) => {
    setUploading(true);
    startTransition(async () => {
      try {
        const newFile = await uploadFile(projectId, formData);
        if (newFile) {
          setFiles((prev: FileItem[]) => [newFile, ...prev]);
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
        setFiles((prev: FileItem[]) => prev.filter((f: FileItem) => f.name !== fileName));
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

  // Format download information
  const getDownloadInfo = (fileName: string): DownloadInfo => {
    const downloads = fileDownloads[fileName] || [];
    if (downloads.length === 0) {
      return { count: 0, lastDownloaded: null, hasDownloads: false };
    }
    const lastDownload = downloads.reduce((latest: FileDownload, current: FileDownload) => 
      new Date(current.downloaded_at) > new Date(latest.downloaded_at) ? current : latest
    );
    return { count: downloads.length, lastDownloaded: lastDownload.downloaded_at, hasDownloads: true };
  };

  return (
    <Card className="shadow-sm border border-border/50 bg-background/80 backdrop-blur-sm">
      <CardHeader>
        <h2 className="text-xl font-semibold">Dateien</h2>
        <p className="text-sm text-muted-foreground">
          Lade Dateien hoch und teile sie mit deinem Kunden. Downloads werden verfolgt.
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

          {files.map((f: FileItem, idx: number) => {
            const downloadInfo = getDownloadInfo(f.name);
            return (
              <Motion
                key={f.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors bg-white"
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
                      {downloadInfo.count > 0 && (
                        <span className="ml-2 text-blue-600">
                          • {downloadInfo.count}x herunterladen
                          {downloadInfo.lastDownloaded && (
                            <span className="block text-xs">
                              Zuletzt: {new Date(downloadInfo.lastDownloaded).toLocaleDateString("de-DE")}{" "}
                              {new Date(downloadInfo.lastDownloaded).toLocaleTimeString("de-DE", { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <a
                      href={`/api/files/${projectId}/${f.name}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
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
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

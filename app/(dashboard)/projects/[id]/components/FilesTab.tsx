"use client";

import { useState, useTransition } from "react";
import { uploadFile, deleteFile } from "../actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Motion } from "@/components/custom/Motion";
import { Loader2, Trash2, Upload, FileIcon, Download, Eye, History } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { PreviewModal } from "@/components/ui/PreviewModal";
import { FileVersionHistory } from "./FileVersionHistory";

interface FileDownload {
  id: string;
  project_id: string;
  file_name: string;
  user_id: string;
  downloaded_at: string;
  created_at: string;
}

interface FileItem {
  id: string;
  name: string;
  path: string;
  size_bytes?: number;
  mime_type?: string;
  description?: string;
  uploaded_by: string;
  version?: number;
  created_at: string;
  updated_at: string;
}

interface DownloadInfo {
  count: number;
  lastDownloaded: string | null;
  hasDownloads: boolean;
}

export function FilesTab({ files: initialFiles, projectId, canUpload = true }: { files: FileItem[]; projectId: string; canUpload?: boolean }) {
  const { t } = useT();
  const [files, setFiles] = useState<FileItem[]>(initialFiles || []);
  const [fileDownloads, setFileDownloads] = useState<Record<string, FileDownload[]>>({});
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState<{[key: string]: boolean}>({});

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

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "–";
    return new Date(dateString).toLocaleDateString();
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

  const toggleVersionHistory = (fileName: string) => {
    setShowVersionHistory(prev => ({
      ...prev,
      [fileName]: !prev[fileName]
    }));
  };

  return (
    <>
      <Card className="shadow-sm border border-border/50 bg-background/80 backdrop-blur-sm">
        <CardHeader>
          <h2 className="text-xl font-semibold">{t("dashboard.files")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("project.files.description")}
          </p>
        </CardHeader>
        <CardContent>
          {/* Upload form */}
          {canUpload && (
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
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("project.uploading")}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" /> {t("project.upload")}
                  </>
                )}
              </Button>
            </form>
          )}

          {/* File list */}
          <div className="rounded-md border border-border/50 divide-y divide-border/50">
            {files.length === 0 && (
              <div className="text-sm text-muted-foreground p-4 text-center">
                {t("project.no.files")}
              </div>
            )}

            {files.map((f: FileItem, idx: number) => {
              const downloadInfo = getDownloadInfo(f.name);
              return (
                <div key={f.name}>
                  <Motion
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors bg-white"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <FileIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="truncate">
                        <div className="font-medium truncate">{f.name}
                          {f.version && f.version > 1 && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              v{f.version}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {f.created_at
                            ? formatDate(f.created_at)
                            : "–"}{" "}
                          • {formatSize(f.size_bytes || 0)}
                          {downloadInfo.count > 0 && (
                            <span className="ml-2 text-blue-600">
                              • {downloadInfo.count}x {t("project.downloads")}
                              {downloadInfo.lastDownloaded && (
                                <span className="block text-xs">
                                  {t("project.last.downloaded")}: {new Date(downloadInfo.lastDownloaded).toLocaleDateString()}{" "}
                                  {new Date(downloadInfo.lastDownloaded).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 items-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => {
                          setPreviewFile(f);
                          setPreviewOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => toggleVersionHistory(f.name)}
                      >
                        <History className="h-4 w-4" />
                      </Button>
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
                  
                  {/* Version History Section */}
                  {showVersionHistory[f.name] && (
                    <div className="px-4 py-3 bg-muted/20 border-t border-border/50">
                      <FileVersionHistory
                        projectId={projectId}
                        fileName={f.name}
                        currentVersion={f.version || 1}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {previewFile && (
        <PreviewModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          fileName={previewFile.name}
          projectId={projectId}
          fileSize={previewFile.size_bytes || 0}
          mimeType={previewFile.mime_type}
        />
      )}
    </>
  );
}

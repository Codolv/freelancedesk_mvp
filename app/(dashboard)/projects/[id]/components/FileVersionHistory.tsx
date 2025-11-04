'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Motion } from '@/components/custom/Motion';
import { Download, Clock, User, FileIcon } from 'lucide-react';
import { useT } from '@/lib/i18n/client';

interface FileVersion {
  id: string;
  project_file_id: string;
  version_number: number;
  file_path: string;
  size_bytes?: number;
  mime_type?: string;
  created_at: string;
  created_by: string;
  createdBy: {
    id: string;
    name?: string;
    email?: string;
  };
}

interface FileVersionHistoryProps {
  projectId: string;
  fileName: string;
  currentVersion: number;
}

export function FileVersionHistory({ projectId, fileName, currentVersion }: FileVersionHistoryProps) {
  const { t } = useT();
  const [versions, setVersions] = useState<FileVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVersions();
  }, [projectId, fileName]);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/files/${projectId}/${fileName}/versions`);
      if (!response.ok) {
        throw new Error('Failed to fetch versions');
      }
      const data = await response.json();
      setVersions(data.versions || []);
    } catch (err) {
      setError('Failed to load version history');
      console.error('Error fetching versions:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "-";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className="shadow-sm border border-border/50 bg-background/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t("dashboard.file.versions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">{t("loading")}...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-sm border border-border/50 bg-background/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t("dashboard.file.versions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-border/50 bg-background/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg">{t("dashboard.file.versions")}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("project.file.versions.description")}
        </p>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border/50 divide-y divide-border/50">
          {versions.length === 0 ? (
            <div className="text-sm text-muted-foreground p-4 text-center">
              {t("project.no.file.versions")}
            </div>
          ) : (
            versions.map((version, idx) => (
              <Motion
                key={version.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors bg-white"
              >
                <div className="flex items-center gap-3 truncate">
                  <FileIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="truncate">
                    <div className="font-medium truncate">
                      {fileName} - v{version.version_number}
                      {version.version_number === currentVersion && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {t("project.current.version")}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-2 items-center">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(version.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        {formatSize(version.size_bytes || 0)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {version.createdBy.name || version.createdBy.email || 'Unknown'}
                      </span>
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
                      href={`/api/files/${projectId}/${fileName}/versions/${version.id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </Motion>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

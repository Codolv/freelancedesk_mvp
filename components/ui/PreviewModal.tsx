'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, FileIcon, Image as ImageIcon, FileText, FileCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PreviewModalProps {
 isOpen: boolean;
  onClose: () => void;
  fileName: string;
 projectId: string;
  fileSize?: number;
  mimeType?: string;
}

export function PreviewModal({ 
  isOpen, 
  onClose, 
  fileName, 
  projectId, 
  fileSize,
  mimeType 
}: PreviewModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getFileType = (fileName: string, mimeType?: string): 'image' | 'pdf' | 'text' | 'code' | 'unsupported' => {
    const lowerFileName = fileName.toLowerCase();
    const lowerMimeType = mimeType?.toLowerCase() || '';

    // Image types
    if (/\.(jpg|jpeg|png|gif|webp|svg)$/.test(lowerFileName) || 
        lowerMimeType.startsWith('image/')) {
      return 'image';
    }

    // PDF
    if (lowerFileName.endsWith('.pdf') || lowerMimeType === 'application/pdf') {
      return 'pdf';
    }

    // Text files
    if (/\.(txt|md|csv)$/.test(lowerFileName) || 
        ['text/plain', 'text/markdown', 'text/csv'].includes(lowerMimeType)) {
      return 'text';
    }

    // Code files
    if (/\.(js|ts|jsx|tsx|css|scss|html|json|xml|sql|py|java|cpp|c|php|rb|go|rs)$/.test(lowerFileName) ||
        lowerMimeType.includes('application/json') ||
        lowerMimeType.includes('application/xml')) {
      return 'code';
    }

    return 'unsupported';
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <ImageIcon className="h-8 w-8 text-blue-500" />;
      case 'pdf':
        return <FileIcon className="h-8 w-8 text-red-500" />;
      case 'text':
      case 'code':
        return <FileCode className="h-8 w-8 text-green-500" />;
      default:
        return <FileIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  const fetchPreviewUrl = async () => {
    if (!fileName || !projectId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch signed URL for preview (same as download but for preview)
      const response = await fetch(`/api/files/${projectId}/${fileName}`);
      if (!response.ok) {
        throw new Error('Failed to fetch file preview');
      }

      // For now, we'll use the same URL as download, but we could modify the API
      // to return a preview-specific URL if needed
      setPreviewUrl(response.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file preview');
      console.error('Preview error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && fileName && projectId) {
      fetchPreviewUrl();
    } else {
      setPreviewUrl(null);
      setLoading(false);
      setError(null);
    }
  }, [isOpen, fileName, projectId]);

  const fileType = previewUrl ? getFileType(fileName, mimeType) : 'unsupported';

  const renderPreviewContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <FileIcon className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold text-destructive mb-2">Preview Unavailable</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">File: {fileName}</p>
        </div>
      );
    }

    if (fileType === 'image' && previewUrl) {
      return (
        <div className="flex items-center justify-center h-full p-4">
          <img
            src={previewUrl}
            alt={fileName}
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            onError={() => setError('Failed to load image')}
          />
        </div>
      );
    }

    if (fileType === 'pdf' && previewUrl) {
      return (
        <div className="w-full h-full">
          <iframe
            src={previewUrl}
            className="w-full h-full min-h-[600px] border-0 rounded-lg"
            title={`Preview of ${fileName}`}
          />
        </div>
      );
    }

    if ((fileType === 'text' || fileType === 'code') && previewUrl) {
      return (
        <div className="w-full h-full overflow-auto">
          <iframe
            src={previewUrl}
            className="w-full h-full min-h-[600px] border-0 rounded-lg"
            title={`Preview of ${fileName}`}
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        {getFileIcon(fileType)}
        <h3 className="text-lg font-semibold mt-4 mb-2">Preview Not Available</h3>
        <p className="text-muted-foreground text-center">
          This file type cannot be previewed directly in the browser.<br />
          Please download the file to view it.
        </p>
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm font-mono">{fileName}</p>
          {fileSize && (
            <p className="text-xs text-muted-foreground mt-1">
              {(fileSize / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] w-full h-[90vh] p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {getFileIcon(fileType)}
              <span className="truncate max-w-xs">{fileName}</span>
            </div>
            <span className="text-xs text-muted-foreground ml-auto">
              {fileSize ? `${(fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={previewUrl || 'loading'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              {renderPreviewContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-4 border-t flex justify-end">
          <Button onClick={onClose} variant="outline">
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

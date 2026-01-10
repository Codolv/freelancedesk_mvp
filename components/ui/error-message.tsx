'use client';

import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
 showRetry?: boolean;
  retryText?: string;
  details?: string;
  className?: string;
  titleGerman?: string;
  messageGerman?: string;
  retryTextGerman?: string;
}

export function ErrorMessage({
  title = 'Error',
  message,
  onRetry,
  showRetry = false,
  retryText = 'Try Again',
  details,
  className = '',
  titleGerman,
  messageGerman,
  retryTextGerman
}: ErrorMessageProps) {
  const currentTitle = titleGerman || title;
  const currentMessage = messageGerman || message;
 const currentRetryText = retryTextGerman || retryText;

  return (
    <div className={`bg-destructive/10 border border-destructive/20 rounded-lg p-6 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="h-6 w-6 text-destructive mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-destructive mb-2">{currentTitle}</h3>
          <p className="text-destructive/80 mb-3">{currentMessage}</p>
          
          {details && (
            <details className="text-sm text-destructive/70 mt-3">
              <summary className="cursor-pointer font-medium">Fehlerdetails</summary>
              <pre className="mt-2 p-3 bg-destructive/5 rounded text-xs whitespace-pre-wrap break-words">
                {details}
              </pre>
            </details>
          )}
          
          {showRetry && onRetry && (
            <Button
              onClick={onRetry}
              variant="destructive"
              size="sm"
              className="mt-4 flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              {currentRetryText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface LoadingErrorMessageProps {
  error: Error;
  onRetry?: () => void;
  title?: string;
  message?: string;
  titleGerman?: string;
  messageGerman?: string;
}

export function LoadingErrorMessage({
  error,
  onRetry,
  title = 'Failed to Load',
  message = 'There was an error loading this content. Please try again.',
  titleGerman,
  messageGerman
}: LoadingErrorMessageProps) {
  return (
    <ErrorMessage
      title={title}
      message={message}
      onRetry={onRetry}
      showRetry={!!onRetry}
      details={error.message || error.toString()}
      titleGerman={titleGerman}
      messageGerman={messageGerman}
    />
  );
}

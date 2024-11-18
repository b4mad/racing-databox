import { useState, useCallback } from 'react';
import { logger } from '../utils/logger';

export type ErrorSeverity = 'error' | 'warning' | 'info';

interface ErrorState {
  message: string;
  severity: ErrorSeverity;
  permanent?: boolean;
}

type LoggerContext = 'paddock' | 'api' | 'telemetry' | 'analysis';

export function useErrorHandler(loggerContext: LoggerContext = 'api') {
  const [errorState, setErrorState] = useState<ErrorState | null>(null);

  const handleError = useCallback((err: unknown, context: string, options?: {
    severity?: ErrorSeverity,
    permanent?: boolean
  }) => {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    const fullMessage = `${context}: ${message}`;

    logger[loggerContext]('Error:', fullMessage);

    setErrorState({
      message: fullMessage,
      severity: options?.severity || 'error',
      permanent: options?.permanent
    });

    if (process.env.NODE_ENV === 'development') {
      console.error(err);
    }
  }, [loggerContext]);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  return {
    error: errorState?.message || null,
    errorState,
    handleError,
    clearError
  };
}

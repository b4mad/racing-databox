import { useCallback } from 'react';
import { useError } from '../contexts/ErrorContext';
import { logger } from '../utils/logger';

export type ErrorSeverity = 'error' | 'warning' | 'info';

type LoggerContext = 'paddock' | 'api' | 'telemetry' | 'analysis';

export function useErrorHandler(loggerContext: LoggerContext = 'api') {
  const { errorState, handleError: contextHandleError, clearError } = useError();

  const handleError = useCallback((err: unknown, context: string, options?: {
    severity?: ErrorSeverity,
    permanent?: boolean
  }) => {
    logger[loggerContext]('Error:', context);
    contextHandleError(err, context, options);
  }, [contextHandleError, loggerContext]);

  return {
    error: errorState?.message || null,
    errorState,
    handleError,
    clearError
  };
}

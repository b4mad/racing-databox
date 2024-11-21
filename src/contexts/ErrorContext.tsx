import { createContext, useContext, useState, useCallback } from 'react';
import { ErrorSeverity } from '../hooks/useErrorHandler';
import { logger } from '../utils/logger';

interface ErrorState {
  message: string;
  severity: ErrorSeverity;
  permanent?: boolean;
}

interface ErrorContextType {
  errorState: ErrorState | null;
  handleError: (err: unknown, context: string, options?: {
    severity?: ErrorSeverity,
    permanent?: boolean
  }) => void;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const [errorState, setErrorState] = useState<ErrorState | null>(null);

  const handleError = useCallback((err: unknown, context: string, options?: {
    severity?: ErrorSeverity,
    permanent?: boolean
  }) => {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    const fullMessage = `${context}: ${message}`;

    logger.api('Error:', fullMessage);

    setErrorState({
      message: fullMessage,
      severity: options?.severity || 'error',
      permanent: options?.permanent
    });

    if (process.env.NODE_ENV === 'development') {
      console.error(err);
    }
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  return (
    <ErrorContext.Provider value={{ errorState, handleError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}

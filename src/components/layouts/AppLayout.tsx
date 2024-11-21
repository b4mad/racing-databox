import { ErrorDisplay } from '../ErrorDisplay';
import { useErrorHandler } from '../../hooks/useErrorHandler';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { error, errorState, clearError } = useErrorHandler('paddock');

  console.log('AppLayout error state:', { error, errorState }); // Debug log

  return (
    <>
      <ErrorDisplay
        error={error}
        severity={errorState?.severity}
        onClose={clearError}
      />
      {children}
    </>
  );
}

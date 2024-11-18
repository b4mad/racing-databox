import { Alert, Snackbar, AlertTitle } from '@mui/material';

interface ErrorDisplayProps {
  error: string | null;
  severity?: 'error' | 'warning' | 'info';
  onClose?: () => void;
  // If permanent is true, shows as an Alert instead of Snackbar
  permanent?: boolean;
}

export function ErrorDisplay({ error, severity = 'error', onClose, permanent = false }: ErrorDisplayProps) {
  if (!error) return null;

  const alertContent = (
    <Alert
      severity={severity}
      onClose={onClose}
    >
      <AlertTitle>{severity === 'error' ? 'Error' : 'Warning'}</AlertTitle>
      {error}
    </Alert>
  );

  if (permanent) {
    return alertContent;
  }

  return (
    <Snackbar
      open={!!error}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      {alertContent}
    </Snackbar>
  );
}

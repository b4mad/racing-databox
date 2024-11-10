import { createContext, useState, ReactNode, useCallback } from 'react';
import { TelemetryPoint } from '../services/types';

interface TelemetryCache {
  [lapId: number]: TelemetryPoint[];
}

interface TelemetryContextType {
  telemetryCache: TelemetryCache;
  getTelemetry: (lapId: number) => TelemetryPoint[] | undefined;
  setTelemetry: (lapId: number, data: TelemetryPoint[]) => void;
  clearTelemetry: (lapId: number) => void;
  clearAllTelemetry: () => void;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export function TelemetryProvider({ children }: { children: ReactNode }) {
  const [telemetryCache, setTelemetryCache] = useState<TelemetryCache>({});

  const getTelemetry = useCallback((lapId: number) => {
    return telemetryCache[lapId];
  }, [telemetryCache]);

  const setTelemetry = useCallback((lapId: number, data: TelemetryPoint[]) => {
    setTelemetryCache(prev => ({
      ...prev,
      [lapId]: data
    }));
  }, []);

  const clearTelemetry = useCallback((lapId: number) => {
    setTelemetryCache(prev => {
      const newCache = { ...prev };
      delete newCache[lapId];
      return newCache;
    });
  }, []);

  const clearAllTelemetry = useCallback(() => {
    setTelemetryCache({});
  }, []);

  return (
    <TelemetryContext.Provider value={{
      telemetryCache,
      getTelemetry,
      setTelemetry,
      clearTelemetry,
      clearAllTelemetry,
    }}>
      {children}
    </TelemetryContext.Provider>
  );
}

export { TelemetryContext };

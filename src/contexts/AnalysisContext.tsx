import { createContext, useContext, ReactNode } from 'react';
import { AnalysisData, TelemetryCacheEntry } from '../services/types';
import { ZoomState } from '../components/types';
import { useAnalysisState } from '../hooks/useAnalysisState';

interface AnalysisContextType {
  loading: boolean;
  analysisData?: AnalysisData;
  lapsData: { [lapId: number]: TelemetryCacheEntry };
  lapIds: (number | null)[] | null | undefined;
  handleLapSelect: (lapId: number) => void;
  zoomState: ZoomState;
  setZoomRange: (startMeters: number, endMeters: number) => void;
  setLoading: (loading: boolean) => void;
  setAnalysisData: (data: AnalysisData) => void;
  setLapIds: (ids: number[] | undefined) => void;
  setLapsData: React.Dispatch<React.SetStateAction<{ [lapId: number]: TelemetryCacheEntry }>>;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const analysisState = useAnalysisState();

  return (
    <AnalysisContext.Provider value={analysisState}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysisContext() {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysisContext must be used within an AnalysisProvider');
  }
  return context;
}

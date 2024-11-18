import { useState } from 'react';
import { DelimitedNumericArrayParam, useQueryParam } from 'use-query-params';
import { AnalysisData, TelemetryCacheEntry } from '../services/types';
import { useZoomState } from './useZoomState';
import { logger } from '../utils/logger';

interface AnalysisState {
  loading: boolean;
  analysisData?: AnalysisData;
  lapsData: { [lapId: number]: TelemetryCacheEntry };
  lapIds: (number | null)[] | null | undefined;
}

interface AnalysisStateActions {
  setLoading: (loading: boolean) => void;
  setAnalysisData: (data: AnalysisData) => void;
  setLapsData: React.Dispatch<React.SetStateAction<{ [lapId: number]: TelemetryCacheEntry }>>;
  setLapIds: (lapIds: number[] | undefined) => void;
  handleLapSelect: (lapId: number) => void;
}

export function useAnalysisState() {
  // Core state
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<AnalysisData>();
  const [lapsData, setLapsData] = useState<{ [lapId: number]: TelemetryCacheEntry }>({});
  const [lapIds, setLapIdsParam] = useQueryParam('laps', DelimitedNumericArrayParam);
  // Ensure we only work with number[] | undefined internally
  const setLapIds = (ids: number[] | undefined) => {
    setLapIdsParam(ids ?? null);
  };

  // Initialize zoom state based on laps
  const { zoomState, setZoomRange } = useZoomState({
    lapsData,
    firstLapId: lapIds?.[0]
  });

  const handleLapSelect = (lapId: number) => {
    const currentLapIds = lapIds?.filter((id): id is number => typeof id === 'number') ?? [];
    logger.analysis('Current lapIds:', currentLapIds);

    if (!currentLapIds.includes(lapId)) {
      logger.analysis(`Lap ${lapId} selected`);
      setLapIds([...currentLapIds, lapId]);
      logger.analysis('New lapIds:', [...currentLapIds, lapId]);
    }
  };

  const state: AnalysisState = {
    loading,
    analysisData,
    lapsData,
    lapIds
  };

  const actions: AnalysisStateActions = {
    setLoading,
    setAnalysisData,
    setLapsData,
    setLapIds,
    handleLapSelect
  };

  return {
    ...state,
    ...actions,
    zoomState,
    setZoomRange
  };
}

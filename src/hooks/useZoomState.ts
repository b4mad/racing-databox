import { useCallback } from 'react';
import { NumberParam, useQueryParam } from 'use-query-params';
import { ZoomState } from '../components/types';
import { TelemetryCacheEntry } from '../services/types';

interface UseZoomStateProps {
  lapsData: { [lapId: number]: TelemetryCacheEntry };
  firstLapId?: number | null;
}

export function useZoomState({ lapsData, firstLapId }: UseZoomStateProps) {
  const [zoomStart, setZoomStart] = useQueryParam('zoomStart', NumberParam);
  const [zoomEnd, setZoomEnd] = useQueryParam('zoomEnd', NumberParam);

  // Current zoom state
  const zoomState: ZoomState = {
    left: zoomStart,
    right: zoomEnd,
    top: 0,
    bottom: 0
  };

  const setZoomRange = useCallback((startMeters: number, endMeters: number) => {
    if (!firstLapId) return;

    const firstLapEntry = lapsData[firstLapId];
    if (!firstLapEntry?.points.length) return;

    const maxDistance = firstLapEntry.points[firstLapEntry.points.length - 1].distance;

    const start = Math.max(0, Math.min(startMeters, maxDistance));
    const end = Math.max(0, Math.min(endMeters, maxDistance));

    setZoomStart(start);
    setZoomEnd(end);
  }, [lapsData, firstLapId, setZoomStart, setZoomEnd]);

  return {
    zoomState,
    setZoomRange
  };
}

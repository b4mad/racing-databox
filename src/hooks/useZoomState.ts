import { useEffect } from 'react';
import { NumberParam, useQueryParam } from 'use-query-params';
import { ZoomState } from '../components/types';
import { TelemetryCacheEntry } from '../services/types';

interface UseZoomStateProps {
  lapsData: { [lapId: number]: TelemetryCacheEntry };
}

export function useZoomState({ lapsData }: UseZoomStateProps) {
  const [zoomStart, setZoomStart] = useQueryParam('zoomStart', NumberParam);
  const [zoomEnd, setZoomEnd] = useQueryParam('zoomEnd', NumberParam);

  // Current zoom state
  const zoomState: ZoomState = {
    left: zoomStart,
    right: zoomEnd,
    top: 0,
    bottom: 0
  };

  const setZoomRange = (start: number, end: number) => {
    setZoomStart(start);
    setZoomEnd(end);
  };

  useEffect(() => {
    // When lapsData changes, check if we have a first lap to set initial zoom
    const lapIds = Object.keys(lapsData);
    if (lapIds.length > 0) {
      const firstLapId = parseInt(lapIds[0]);
      const firstLapEntry = lapsData[firstLapId];

      if (firstLapEntry?.points.length && (zoomStart === undefined || zoomEnd === undefined)) {
        const maxDistance = firstLapEntry.points[firstLapEntry.points.length - 1].distance;
        setZoomRange(0, maxDistance);
      }
    }
  }, [lapsData, zoomStart, zoomEnd]);

  return {
    zoomState,
    setZoomRange
  };
}

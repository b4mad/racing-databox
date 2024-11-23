import { useEffect } from 'react';
import { TelemetryCacheEntry } from '../services/types';
import { useTelemetry } from './useTelemetry';
import { useErrorHandler } from './useErrorHandler';
import { getLapColor } from '../utils/colors';
import { logger } from '../utils/logger';

interface UseTelemetryLoaderParams {
  lapIds?: (number | null)[] | null | undefined;
  lapsData: { [lapId: number]: TelemetryCacheEntry };
  setLapsData: React.Dispatch<React.SetStateAction<{ [lapId: number]: TelemetryCacheEntry }>>;
}

export function useTelemetryLoader({
  lapIds,
  lapsData,
  setLapsData
}: UseTelemetryLoaderParams) {
  const { getTelemetryForLap } = useTelemetry();
  const { handleError } = useErrorHandler('telemetry');

  useEffect(() => {
    async function loadTelemetryData() {
      logger.loader(`useTelemetryLoader: fetching data for laps ${lapIds}`);

      if (!lapIds?.length) return;

      // Get missing lap IDs without referencing lapsData in effect deps
      const missingLapIds = lapIds.filter((lapId): lapId is number => {
        return typeof lapId === 'number' && !lapsData[lapId];
      });

      if (missingLapIds.length === 0) return;

      try {
        const telemetryUpdates: { [key: number]: TelemetryCacheEntry } = {};
        // Get reference lap data (first valid lap)
        const referenceLapId = lapIds.find(id => id !== null);
        const referenceLapData = referenceLapId ? lapsData[referenceLapId]?.points : undefined;

        const promises = missingLapIds.map(async (lapId) => {
          const entry = await getTelemetryForLap(lapId);
          const lapIndex = lapIds.indexOf(lapId);

          // Calculate delta for each point
          entry.points = entry.points.map(point => {
            // If no reference lap exists or this is the reference lap, delta is 0
            if (!referenceLapData || lapId === referenceLapId) {
              return { ...point, delta: 0 };
            }

            // Find closest point in reference lap by distance
            const refPoint = referenceLapData.find(ref =>
              Math.abs(ref.distance - point.distance) < 0.1
            );
            return {
              ...point,
              delta: refPoint ? point.lapTime - refPoint.lapTime : 0
            };
          });

          telemetryUpdates[lapId] = {
            ...entry,
            color: getLapColor(lapIndex)
          };

          logger.analysis(`Loaded telemetry for lap ${lapId}`);
          return entry;
        });

        await Promise.all(promises);

        if (Object.keys(telemetryUpdates).length > 0) {
          setLapsData(prev => ({
            ...prev,
            ...telemetryUpdates
          }));
        }
      } catch (error) {
        handleError(error, 'Failed to load telemetry data');
      }
    }

    loadTelemetryData();
  }, [lapIds]);
}

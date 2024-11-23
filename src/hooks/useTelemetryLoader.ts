import { useEffect } from 'react';
import { TelemetryCacheEntry, TelemetryPoint } from '../services/types';
import { useTelemetry } from './useTelemetry';
import { useErrorHandler } from './useErrorHandler';
import { getLapColor } from '../utils/colors';
import { logger } from '../utils/logger';

interface UseTelemetryLoaderParams {
  lapIds?: (number | null)[] | null | undefined;
  lapsData: { [lapId: number]: TelemetryCacheEntry };
  setLapsData: React.Dispatch<React.SetStateAction<{ [lapId: number]: TelemetryCacheEntry }>>;
}

function calculateDelta(referenceLap: TelemetryCacheEntry, comparisonLap: TelemetryCacheEntry): TelemetryPoint[] {
  const result: TelemetryPoint[] = [];
  let refIndex = 0;

  // For each point in the comparison lap
  for (let i = 0; i < comparisonLap.points.length; i++) {
    const compPoint = comparisonLap.points[i];

    // Advance through reference points until we find one past our current distance
    while (refIndex < referenceLap.points.length - 1 &&
           referenceLap.points[refIndex].distance < compPoint.distance) {
      refIndex++;
    }

    // Find the best matching point (either current or previous index)
    let bestRefPoint = referenceLap.points[refIndex];

    result.push({
      ...compPoint,
      delta: compPoint.lapTime - bestRefPoint.lapTime
    });
  }

  return result;
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
        const promises = missingLapIds.map(async (lapId) => {
          const entry = await getTelemetryForLap(lapId);
          const lapIndex = lapIds.indexOf(lapId);

          telemetryUpdates[lapId] = {
            ...entry,
            color: getLapColor(lapIndex)
          };

          logger.analysis(`Loaded telemetry for lap ${lapId}`);
          return entry;
        });

        await Promise.all(promises);

        // Use the first lap in lapIds as reference
        const referenceLapId = lapIds[0];
        logger.analysis(`Reference lap: ${referenceLapId}`);
        if (referenceLapId && typeof referenceLapId === 'number') {
          const referenceLap = lapsData[referenceLapId] || telemetryUpdates[referenceLapId];

          // Calculate deltas for all new laps
          Object.keys(telemetryUpdates).forEach(lapIdStr => {
            const lapId = parseInt(lapIdStr, 10);
            if (lapId !== referenceLapId) {
              telemetryUpdates[lapId].points = calculateDelta(referenceLap, telemetryUpdates[lapId]);
            }
          });
        }

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

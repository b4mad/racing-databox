import { useEffect } from 'react';
import { TelemetryCacheEntry } from '../services/types';
import { useTelemetry } from './useTelemetry';
import { useErrorHandler } from './useErrorHandler';
import { getLapColor } from '../utils/colors';
import { logger } from '../utils/logger';

interface UseTelemetryLoaderParams {
  lapIds?: number[];
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
      if (!lapIds?.length) return;

      // Skip if we already have all the telemetry data for these laps
      const missingLapIds = lapIds.filter(
        lapId => typeof lapId === 'number' && !lapsData[lapId]
      );
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

        // Only update state if we have new data
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
  }, [lapIds, getTelemetryForLap, handleError, lapsData, setLapsData]);
}

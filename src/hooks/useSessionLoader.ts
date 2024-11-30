import { useEffect } from 'react';
import { useSession } from './useSession';
import { useErrorHandler } from './useErrorHandler';
import { AnalysisData, PaddockSegment } from '../services/types';
import { logger } from '../utils/logger';

interface UseSessionLoaderParams {
  sessionId: string;
  lapIds?: (number | null)[] | null | undefined;
  analysisData?: AnalysisData;
  setLoading: (loading: boolean) => void;
  setAnalysisData: (data: AnalysisData) => void;
  setLapIds: (ids: number[] | undefined) => void;
}

export function useSessionLoader({
  sessionId,
  lapIds,
  analysisData,
  setLoading,
  setAnalysisData,
  setLapIds
}: UseSessionLoaderParams) {
  const { fetchSession, fetchLandmarks, fetchLap, getSegments } = useSession();
  const { handleError, clearError } = useErrorHandler('paddock');

  // Combined effect for session loading and updates
  useEffect(() => {
    logger.loader(`useSessionLoader: loading/updating session ${sessionId} and laps ${lapIds}`);
    if (!sessionId) return;

    const loadSessionAndData = async () => {
      try {
        setLoading(true);

        let session = analysisData?.session;
        let landmarks = analysisData?.landmarks;
        // Ensure we have the base session data
        if (!session || session.sessionId !== sessionId) {
          session = await fetchSession(sessionId);
          // Set initial lap if we have laps and none are currently selected
          if (session.laps.length > 0 && !lapIds?.length) {
            setLapIds([session.laps[0].id]);
            return; // Exit here as setLapIds will trigger this effect again
          }

          landmarks = await fetchLandmarks(session.track.id);
          if (!landmarks) {
            throw new Error('Failed to load landmarks');
          }
        }


        // If we have lapIds, process them
        if (lapIds?.length) {
          const sessionLaps = session.laps.filter(lap =>
            lapIds.includes(lap.id)
          );

          const segmentsByLapId: { [lapId: number]: PaddockSegment[] } = {};

          // Get missing laps
          const missingLapIds = lapIds.filter((id): id is number =>
            id !== null && !sessionLaps.find(lap => lap.id === id)
          );

          if (missingLapIds.length) {
            const fetchedLapsAndSegments = await Promise.all(
              missingLapIds.map(async id => {
                const [lap, segments] = await Promise.all([
                  fetchLap(id),
                  getSegments(id)
                ]);
                return { lap, segments };
              })
            );

            sessionLaps.push(...fetchedLapsAndSegments.map(item => item.lap));
            fetchedLapsAndSegments.forEach(item => {
              segmentsByLapId[item.lap.id] = item.segments;
            });
            logger.loader('useSessionLoader: fetched missing laps', fetchedLapsAndSegments);
          }

          // Update the existing analysis data
          let updatedData : AnalysisData = {
            session,
            driver: session.driver,
            car: session.car,
            track: session.track,
            game: session.game,
            laps: sessionLaps,
            landmarks: landmarks,
            segments: segmentsByLapId
          };
          logger.loader('useSessionLoader Analysis data:', updatedData);
          setAnalysisData(updatedData);
        }

        clearError();
      } catch (err) {
        handleError(err, 'Failed to load session data');
      } finally {
        setLoading(false);
      }
    };

    loadSessionAndData();
  }, [sessionId, lapIds]);
}

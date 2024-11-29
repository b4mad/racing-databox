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
  const { getSession, fetchSession, getLandmarks, fetchLandmarks, fetchLap, getSegments } = useSession();
  const { handleError, clearError } = useErrorHandler('paddock');

  // Effect 1: Initial session and landmarks loading
  useEffect(() => {
    logger.loader('useSessionLoader: loading session data ' + sessionId);
    if (!sessionId) return;
    let mounted = true;

    const loadSession = async () => {
      try {
        setLoading(true);
        const session = await fetchSession(sessionId);
        if (!mounted) return;

        const landmarks = await fetchLandmarks(session.track.id);
        if (!mounted) return;

        if (!landmarks) {
          throw new Error('Failed to load landmarks');
        }

        // Set initial lap only if we have laps and none are currently selected
        if (session.laps.length > 0 && !lapIds?.length) {
          setLapIds([session.laps[0].id]);
        }

        clearError();
      } catch (err) {
        if (mounted) {
          handleError(err, 'Failed to load session data');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSession();
    return () => { mounted = false; };
  }, [sessionId]);

  // Effect 2: Update analysis data when session or lapIds change
  useEffect(() => {
    logger.loader(`useSessionLoader: updating analysis data for session ${sessionId} and laps ${lapIds}`);
    if (!sessionId || !lapIds?.length) return;

    const session = getSession(sessionId);
    if (!session) return;

    const landmarks = analysisData?.landmarks || getLandmarks(session.track.id);

    const sessionLaps = session.laps.filter(lap =>
      lapIds.includes(lap.id)
    );

    const segmentsByLapId: { [lapId: number]: PaddockSegment[] } = analysisData?.segments ?? {};

    // Now get the remaining laps via fetchLap
    const missingLapIds = lapIds.filter((id): id is number =>
      id !== null && !sessionLaps.find(lap => lap.id === id)
    );
    if (missingLapIds.length) {
      const fetchMissingLaps = async () => {
        try {
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

          // Preserve existing segments and add new ones
          fetchedLapsAndSegments.forEach(item => {
            segmentsByLapId[item.lap.id] = item.segments;
          });
          logger.loader('useSessionLoader: fetched missing laps', fetchedLapsAndSegments);

          const data: AnalysisData = {
            session,
            driver: session.driver,
            car: session.car,
            track: session.track,
            game: session.game,
            laps: sessionLaps,
            landmarks: landmarks,
            segments: segmentsByLapId
          };
          logger.loader('useSessionLoader Analysis data:', data);
          setAnalysisData(data);
        } catch (err) {
          handleError(err, 'Failed to load additional laps');
        }
      };
      fetchMissingLaps();
      return;
    }

    // If no missing laps to fetch, set the analysis data immediately
    const data: AnalysisData = {
      session,
      driver: session.driver,
      car: session.car,
      track: session.track,
      game: session.game,
      laps: sessionLaps,
      landmarks: landmarks,
      segments: segmentsByLapId
    }
    logger.loader('useSessionLoader Analysis data:', data);

    setAnalysisData(data);
  }, [sessionId, lapIds]);
}

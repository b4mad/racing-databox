import { useEffect } from 'react';
import { useSession } from './useSession';
import { useErrorHandler } from './useErrorHandler';
import { logger } from '../utils/logger';
import { AnalysisData } from '../services/types';

interface UseSessionLoaderParams {
  sessionId: string;
  lapIds?: number[];
  setLoading: (loading: boolean) => void;
  setAnalysisData: (data: AnalysisData) => void;
  setLapIds: (ids: number[] | undefined) => void;
}

export function useSessionLoader({
  sessionId,
  lapIds,
  setLoading,
  setAnalysisData,
  setLapIds
}: UseSessionLoaderParams) {
  const { getSession, fetchSession, getLandmarks, fetchLandmarks } = useSession();
  const { handleError, clearError } = useErrorHandler('session-loader');

  // Effect for loading session and landmarks
  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        const session = await fetchSession(sessionId);

        // Fetch landmarks for the track right after getting session
        const landmarks = await fetchLandmarks(session.track.id);

        if (!landmarks) {
          throw new Error('Failed to load landmarks');
        } else {
          logger.analysis('Loaded landmarks:', landmarks);
        }

        if (session.laps.length > 0) {
          // If no lap is set in URL, use first lap
          const initialLapIds = lapIds?.length ? lapIds : [session.laps[0].id];
          setLapIds(initialLapIds);
          logger.analysis('Initial lapIds:', initialLapIds);
        }

        clearError();
      } catch (err) {
        handleError(err, 'Failed to load session data');
        if (process.env.NODE_ENV === 'development') {
          throw err;
        }
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [sessionId]);

  // Effect for building analysis data
  useEffect(() => {
    if (!sessionId) return;

    // Get the session
    const session = getSession(sessionId);
    if (!session?.laps) {
      logger.analysis('Session or laps not yet loaded');
      return;
    }

    // Get the landmarks
    const landmarks = getLandmarks(session.track.id);
    if (!landmarks) {
      logger.analysis('Landmarks not yet loaded');
      return;
    }

    // Only proceed if we have both lapIds and filtered laps
    const filteredLaps = session.laps.filter(lap =>
      lapIds?.includes(lap.id)
    );
    if (!filteredLaps.length) {
      logger.analysis('No matching laps found');
      return;
    }

    // Now we can safely build the analysis data
    const data: AnalysisData = {
      laps: filteredLaps,
      session: session,
      car: session.car,
      track: session.track,
      game: session.game,
      landmarks: landmarks,
      driver: session.driver
    };

    logger.analysis('Analysis data built successfully:', data);
    setAnalysisData(data);
  }, [sessionId, lapIds, getSession, getLandmarks]);
}

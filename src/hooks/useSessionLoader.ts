import { useEffect } from 'react';
import { useSession } from './useSession';
import { useErrorHandler } from './useErrorHandler';
import { AnalysisData } from '../services/types';

interface UseSessionLoaderParams {
  sessionId: string;
  lapIds?: (number | null)[] | null | undefined;
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
  const { handleError, clearError } = useErrorHandler('paddock');

  // Effect 1: Initial session and landmarks loading
  useEffect(() => {
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
    if (!sessionId || !lapIds?.length) return;

    const session = getSession(sessionId);
    if (!session?.laps) return;

    const landmarks = getLandmarks(session.track.id);
    if (!landmarks) return;

    const filteredLaps = session.laps.filter(lap =>
      lapIds.includes(lap.id)
    );
    if (!filteredLaps.length) return;

    setAnalysisData({
      laps: filteredLaps,
      session,
      car: session.car,
      track: session.track,
      game: session.game,
      landmarks,
      driver: session.driver
    });
  }, [sessionId, lapIds]);
}

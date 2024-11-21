import { createContext, useCallback, useState, ReactNode } from 'react';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { PaddockService } from '../services/PaddockService';
import { PaddockSession, PaddockCar, PaddockDriver, PaddockTrack, PaddockLap, TrackLandmarks } from '../services/types';


interface SessionContextType {
  // List view state
  sessions: PaddockSession[];
  fetchLap: (lapId: number) => Promise<PaddockLap>;
  cars: PaddockCar[];
  drivers: PaddockDriver[];
  tracks: PaddockTrack[];
  fetchLandmarks: (trackId: number) => Promise<TrackLandmarks>;
  getLandmarks: (trackId: number) => TrackLandmarks | undefined;
  getLaps: (trackId: number, carId: number) => PaddockLap[] | undefined;
  fetchLaps: (trackId: number, carId: number) => Promise<PaddockLap[]>;
  loading: boolean;
  error: string | null;
  hasNextPage: boolean;
  endCursor?: string;
  fetchSessions: (isInitialLoad?: boolean) => Promise<void>;
  fetchMoreSessions: () => Promise<void>;
  selectedCar: number | null | undefined;
  selectedDriver: number | null | undefined;
  selectedTrack: number | null | undefined;
  setSelectedCar: (id: number | null | undefined) => void;
  setSelectedDriver: (id: number | null | undefined) => void;
  setSelectedTrack: (id: number | null | undefined) => void;

  // Individual session operations
  getSession: (sessionId: string) => PaddockSession | undefined;
  fetchSession: (sessionId: string) => Promise<PaddockSession>;
}

export const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [sessions, setSessions] = useState<PaddockSession[]>([]);
  const [cars, setCars] = useState<PaddockCar[]>([]);
  const [drivers, setDrivers] = useState<PaddockDriver[]>([]);
  const [tracks, setTracks] = useState<PaddockTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const { error, handleError } = useErrorHandler('paddock');
  const [hasNextPage, setHasNextPage] = useState(false);
  const [endCursor, setEndCursor] = useState<string>();
  const [selectedCar, setSelectedCar] = useState<number | null>();
  const [selectedDriver, setSelectedDriver] = useState<number | null>();
  const [selectedTrack, setSelectedTrack] = useState<number | null>();
  const [landmarksCache, setLandmarksCache] = useState<{ [trackId: number]: TrackLandmarks }>({});
  const [lapsCache, setLapsCache] = useState<{ [key: string]: PaddockLap[] }>({});

  const getLapsCacheKey = useCallback((trackId: number, carId: number) => `${trackId}-${carId}`, []);

  const fetchSessions = useCallback(async (isInitialLoad = false) => {
    try {
      const paddockService = new PaddockService();

      if (isInitialLoad) {
        const [sessionsData, carsData, driversData, tracksData] = await Promise.all([
          paddockService.getSessions(20, undefined, {
            driverId: selectedDriver ?? undefined,
            carId: selectedCar ?? undefined,
            trackId: selectedTrack ?? undefined
          }),
          paddockService.getAllCars(10),
          paddockService.getAllDrivers(10),
          paddockService.getAllTracks(10)
        ]);
        const filteredSessions = sessionsData.items.filter(session => session.laps.length > 0);
        setSessions(filteredSessions);
        setHasNextPage(sessionsData.hasNextPage);
        setEndCursor(sessionsData.endCursor);
        setCars(carsData);
        setDrivers(driversData);
        setTracks(tracksData);
      } else {
        const sessionsData = await paddockService.getSessions(20, undefined, {
          driverId: selectedDriver ?? undefined,
          carId: selectedCar ?? undefined,
          trackId: selectedTrack ?? undefined
        });
        setSessions(sessionsData.items);
        setHasNextPage(sessionsData.hasNextPage);
        setEndCursor(sessionsData.endCursor);
      }
    } catch (err) {
      handleError(err, 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [selectedDriver, selectedCar, selectedTrack]);

  const fetchMoreSessions = useCallback(async () => {
    try {
      const paddockService = new PaddockService();
      const moreData = await paddockService.getSessions(20, endCursor, {
        driverId: selectedDriver ?? undefined,
        carId: selectedCar ?? undefined,
        trackId: selectedTrack ?? undefined
      });
      const filteredMoreSessions = moreData.items.filter(session => session.laps.length > 0);
      setSessions(prev => [...prev, ...filteredMoreSessions]);
      setHasNextPage(moreData.hasNextPage);
      setEndCursor(moreData.endCursor);
    } catch (err) {
      handleError(err, 'Failed to load more sessions');
    }
  }, [endCursor, selectedDriver, selectedCar, selectedTrack]);

  const getSession = useCallback((sessionId: string) => {
    return sessions.find(session => session.sessionId === sessionId);
  }, [sessions]);


  const getLandmarks = useCallback((trackId: number): TrackLandmarks | undefined => {
    return landmarksCache[trackId];
  }, [landmarksCache]);

  const fetchLandmarks = useCallback(async (trackId: number): Promise<TrackLandmarks> => {
    try {
      // Return cached landmarks if available
      if (landmarksCache[trackId]) {
        return landmarksCache[trackId];
      }

      const paddockService = new PaddockService();
      const landmarks = await paddockService.getLandmarks(trackId);

      // Cache the results
      setLandmarksCache(prev => ({
        ...prev,
        [trackId]: landmarks
      }));

      return landmarks;
    } catch (err) {
      handleError(err, 'Failed to load landmarks');
      throw err;
    }
  }, [landmarksCache]);

  const fetchSession = useCallback(async (sessionId: string): Promise<PaddockSession> => {
    // First try to find the session in our list
    let session = getSession(sessionId);

    // If not found, fetch it
    if (!session) {
      const paddockService = new PaddockService();
      const response = await paddockService.getSessions(1, undefined, { sessionId });
      if (response.items.length === 0) {
        throw new Error(`Session ${sessionId} not found`);
      }
      session = response.items[0];

      // Add to sessions list if session exists
      if (session) {
        setSessions(prev => {
          const newSessions = [...prev, session].filter((s): s is PaddockSession => s !== undefined);
          return newSessions;
        });
      }
    }

    if (!session) {
      throw new Error(`Failed to load session ${sessionId}`);
    }

    return session;
  }, []);

  const getLaps = useCallback((trackId: number, carId: number) => {
    return lapsCache[getLapsCacheKey(trackId, carId)];
  }, [lapsCache, getLapsCacheKey]);

  const fetchLaps = useCallback(async (trackId: number, carId: number) => {
    const cacheKey = getLapsCacheKey(trackId, carId);
    if (lapsCache[cacheKey]) {
      return lapsCache[cacheKey];
    }

    const paddockService = new PaddockService();
    const laps = await paddockService.getLaps(trackId, carId);

    setLapsCache(prev => ({
      ...prev,
      [cacheKey]: laps
    }));

    return laps;
  }, [lapsCache, getLapsCacheKey]);

  const fetchLap = useCallback(async (lapId: number): Promise<PaddockLap> => {
    const paddockService = new PaddockService();
    const laps = await paddockService.getLaps(null, null, 1, lapId); // trackId and carId are ignored when lapId is provided
    if (!laps || laps.length === 0) {
      throw new Error(`Lap ${lapId} not found`);
    }
    return laps[0];
  }, []);

  return (
    <SessionContext.Provider
      value={{
        sessions,
        cars,
        fetchLap,
        drivers,
        tracks,
        loading,
        error,
        hasNextPage,
        endCursor,
        fetchSessions,
        fetchMoreSessions,
        selectedCar,
        selectedDriver,
        selectedTrack,
        setSelectedCar,
        setSelectedDriver,
        setSelectedTrack,
        getSession,
        fetchSession,
        fetchLandmarks,
        getLandmarks,
        getLaps,
        fetchLaps,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

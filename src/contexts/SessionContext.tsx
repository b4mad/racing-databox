import { createContext, useCallback, useState, ReactNode } from 'react';
import { PaddockService } from '../services/PaddockService';
import { createTelemetryService } from '../services/TelemetryService';
import { PaddockSession, PaddockCar, PaddockDriver, PaddockTrack, SessionData, TrackLandmarks } from '../services/types';

interface CachedSession {
  paddockData: PaddockSession;
  sessionData: SessionData;
  landmarks?: TrackLandmarks;
  loading: boolean;
  error: string | null;
}

interface SessionContextType {
  // List view state
  sessions: PaddockSession[];
  cars: PaddockCar[];
  drivers: PaddockDriver[];
  tracks: PaddockTrack[];
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

  // Individual session cache
  getSession: (sessionId: string) => CachedSession | undefined;
  fetchSession: (sessionId: string) => Promise<CachedSession>;
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
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [endCursor, setEndCursor] = useState<string>();
  const [selectedCar, setSelectedCar] = useState<number | null>();
  const [selectedDriver, setSelectedDriver] = useState<number | null>();
  const [selectedTrack, setSelectedTrack] = useState<number | null>();

  // Session cache
  const [sessionCache, setSessionCache] = useState<Map<string, CachedSession>>(new Map());

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
        setSessions(sessionsData.items);
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
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      if (process.env.NODE_ENV === 'development') {
        throw err;
      }
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
      setSessions(prev => [...prev, ...moreData.items]);
      setHasNextPage(moreData.hasNextPage);
      setEndCursor(moreData.endCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more sessions');
      if (process.env.NODE_ENV === 'development') {
        throw err;
      }
    }
  }, [endCursor, selectedDriver, selectedCar, selectedTrack]);

  const getSession = useCallback((sessionId: string) => {
    return sessionCache.get(sessionId);
  }, [sessionCache]);

  const findSessionInList = useCallback((sessionId: string): PaddockSession | undefined => {
    return sessions.find(session => session.sessionId === sessionId);
  }, [sessions]);

  const fetchSession = useCallback(async (sessionId: string): Promise<CachedSession> => {
    // Return cached data if available
    const cached = sessionCache.get(sessionId);
    if (cached && !cached.loading && !cached.error) {
      return cached;
    }

    // Set loading state
    setSessionCache(prev => new Map(prev).set(sessionId, {
      ...cached,
      loading: true,
      error: null
    } as CachedSession));

    try {
      const telemetryService = createTelemetryService();
      const paddockService = new PaddockService();

      // First try to find the session in our list
      let paddockData = findSessionInList(sessionId);
      
      // If not found, fetch it
      if (!paddockData) {
        const response = await paddockService.getSessions(1, undefined, { sessionId });
        if (response.items.length === 0) {
          throw new Error(`Session ${sessionId} not found`);
        }
        paddockData = response.items[0];
      }

      const [sessionData, landmarks] = await Promise.all([
        telemetryService.getSessionData(sessionId),
        paddockData.track?.id ? paddockService.getLandmarks(paddockData.track.id) : undefined
      ]);

      const cachedSession: CachedSession = {
        paddockData,
        sessionData,
        landmarks,
        loading: false,
        error: null
      };

      setSessionCache(prev => new Map(prev).set(sessionId, cachedSession));
      return cachedSession;

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load session data';
      const errorState: CachedSession = {
        ...cached,
        loading: false,
        error: errorMsg
      } as CachedSession;

      setSessionCache(prev => new Map(prev).set(sessionId, errorState));
      throw err;
    }
  }, []);

  return (
    <SessionContext.Provider
      value={{
        sessions,
        cars,
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
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

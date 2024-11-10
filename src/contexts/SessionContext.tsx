import { createContext, useCallback, useState, ReactNode } from 'react';
import { PaddockService } from '../services/PaddockService';
import { createTelemetryService } from '../services/TelemetryService';
import { PaddockSession, PaddockCar, PaddockDriver, PaddockTrack, TelemetryPoint } from '../services/types';

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
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [endCursor, setEndCursor] = useState<string>();
  const [selectedCar, setSelectedCar] = useState<number | null>();
  const [selectedDriver, setSelectedDriver] = useState<number | null>();
  const [selectedTrack, setSelectedTrack] = useState<number | null>();


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
    return sessions.find(session => session.sessionId === sessionId);
  }, [sessions]);


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

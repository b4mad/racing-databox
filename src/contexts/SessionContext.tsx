import { createContext, useCallback, useState, ReactNode, useRef } from 'react';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { PaddockService } from '../services/PaddockService';
import { PaddockSession, PaddockCar, PaddockDriver, PaddockTrack, PaddockLap, TrackLandmarks, PaddockSegment } from '../services/types';


interface SessionContextType {
  // List view state
  sessions: PaddockSession[];
  fetchLap: (lapId: number) => Promise<PaddockLap>;
  cars: PaddockCar[];
  drivers: PaddockDriver[];
  tracks: PaddockTrack[];
  fetchLandmarks: (trackId: number) => Promise<TrackLandmarks>;
  getLandmarks: (trackId: number) => TrackLandmarks | undefined;
  fetchLaps: (trackId: number, carId: number) => Promise<PaddockLap[]>;
  getSegments: (lapId: number) => Promise<PaddockSegment[]>;
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
  const paddockService = useRef(new PaddockService());

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
  const [lapsCache, setLapsCache] = useState<{ [lapId: number]: PaddockLap }>({});

  const fetchSessions = useCallback(async (isInitialLoad = false) => {
    try {

      if (isInitialLoad) {
        const [sessionsData, carsData, driversData, tracksData] = await Promise.all([
          paddockService.current.getSessions(20, undefined, {
            driverId: selectedDriver ?? undefined,
            carId: selectedCar ?? undefined,
            trackId: selectedTrack ?? undefined
          }),
          paddockService.current.getAllCars(10),
          paddockService.current.getAllDrivers(10),
          paddockService.current.getAllTracks(10)
        ]);
        const filteredSessions = sessionsData.items.filter(session => session.laps.length > 0);
        setSessions(filteredSessions);
        setHasNextPage(sessionsData.hasNextPage);
        setEndCursor(sessionsData.endCursor);
        setCars(carsData);
        setDrivers(driversData);
        setTracks(tracksData);
      } else {
        const sessionsData = await paddockService.current.getSessions(20, undefined, {
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
      const moreData = await paddockService.current.getSessions(20, endCursor, {
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


  const getLandmarks = useCallback((trackId: number): TrackLandmarks | undefined => {
    return landmarksCache[trackId];
  }, [landmarksCache]);

  const fetchLandmarks = useCallback(async (trackId: number): Promise<TrackLandmarks> => {
    try {
      // Return cached landmarks if available
      if (landmarksCache[trackId]) {
        return landmarksCache[trackId];
      }

      const landmarks = await paddockService.current.getLandmarks(trackId);

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

  const getSession = useCallback((sessionId: string) => {
    return sessions.find(session => session.sessionId === sessionId);
  }, [sessions]);

  const fetchSession = useCallback(async (sessionId: string): Promise<PaddockSession> => {
    // First try to find the session in our list
    let session = getSession(sessionId);

    // If not found, fetch it
    if (!session) {
      const response = await paddockService.current.getSessions(1, undefined, { sessionId });
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

  const fetchLaps = useCallback(async (trackId: number, carId: number) => {
    const laps = await paddockService.current.getLaps({ trackId, carId });

    // Cache each lap individually by its ID
    setLapsCache(prev => {
      const newCache = { ...prev };
      laps.forEach(lap => {
        newCache[lap.id] = lap;
      });
      return newCache;
    });

    return laps;
  }, []);

  const getSegments = useCallback(async (lapId: number): Promise<PaddockSegment[]> => {
    try {
      return await paddockService.current.getSegments(lapId);
    } catch (err) {
      handleError(err, 'Failed to load segments');
      throw err;
    }
  }, []);

  const fetchLap = useCallback(async (lapId: number): Promise<PaddockLap> => {
    // Check cache first
    if (lapsCache[lapId]) {
      return lapsCache[lapId];
    }

    const laps = await paddockService.current.getLaps({ id: lapId, limit: 1 }); // trackId and carId are optional
    if (!laps || laps.length === 0) {
      throw new Error(`Lap ${lapId} not found`);
    }

    // Cache the fetched lap
    setLapsCache(prev => ({
      ...prev,
      [lapId]: laps[0]
    }));

    return laps[0];
  }, [lapsCache]);

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
        fetchLaps,
        getSegments,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

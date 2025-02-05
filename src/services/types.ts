export interface TelemetryPoint {
    distance: number;
    speed: number;
    throttle: number;
    brake: number;
    handbrake: number;
    gear: number;
    steeringAngle: number;
    lapTime: number;
    delta: number;  // Time difference from reference lap
    lapNumber: number;
    position?: {
        x: number;
        y: number;
        z: number;
    };
    rotation?: {
        yaw: number;
        pitch: number;
        roll: number;
    };
}

export interface ProcessedTelemetryData {
    points: TelemetryPoint[];
    mapDataAvailable: boolean;
}

export interface RawTelemetryData {
    columns: string[];
    data: number[][];
}

export interface AnalysisData {
    laps: PaddockLap[];
    session: PaddockSession;
    car: PaddockCar;
    track: PaddockTrack;
    game: PaddockGame;
    landmarks?: TrackLandmarks;
    driver: PaddockDriver;
    segments?: { [lapId: number]: PaddockSegment[] };
}


export interface PaginatedResponse<T> {
    items: T[];
    totalCount: number;
    hasNextPage: boolean;
    endCursor?: string;
}

export interface TelemetryService {
    getLapData(lapId: number): Promise<ProcessedTelemetryData>;
}

export interface PaddockLap {
    id: number;
    number: number;
    time: number;
    valid: boolean;
    length?: number;
    completed: boolean;
    officialTime: number;
    session?: PaddockSession;
    telemetry?: TelemetryPoint[];
}

export interface PaddockCar {
    id: number;
    name?: string;
}

export interface PaddockDriver {
    id: number;
    name?: string;
}

export interface PaddockGame {
    id: number;
    name?: string;
}

export interface PaddockSessionType {
    id: number;
    type?: string;
}

export interface PaddockTrack {
    id: number;
    name?: string;
}

export interface PaddockSession {
    id: number;
    sessionId: string;
    car: PaddockCar;
    driver: PaddockDriver;
    game: PaddockGame;
    sessionType: PaddockSessionType;
    track: PaddockTrack;
    laps: PaddockLap[];
}


export interface PaddockLandmark {
    id: number;
    name: string;
    start: number;
    end: number | null;
    kind: 'turn' | 'segment';
}

export interface TrackLandmarks {
    turns: PaddockLandmark[];
    segments: PaddockLandmark[];
}

export interface PaddockTrack {
    id: number;
    name?: string;
}

export interface PaddockGame {
    id: number;
    name?: string;
}

export interface TelemetryCacheEntry {
    points: TelemetryPoint[];
    mapDataAvailable: boolean;
    color?: string;
}

export interface PaddockSegment {
    id: number;
    accelerationPoint: number;
    apex: number;
    brakeApplicationRate: number;
    brakePressure: number;
    brakeReleaseRate: number;
    brakingPoint: number;
    coastingTime: number;
    cornerSpeed: number;
    entrySpeed: number;
    exitSpeed: number;
    gear: number;
    kind: string;
    landmarkId: number;
    lapId: number;
    launchWheelSlipTime: number;
    liftOffPoint: number;
    throttleApplicationRate: number;
    throttleLift: number;
    throttleReleaseRate: number;
}

export interface TelemetryCache {
    [lapId: number]: TelemetryCacheEntry;
}

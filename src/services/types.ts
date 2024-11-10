export interface TelemetryPoint {
    distance: number;
    speed: number;
    throttle: number;
    brake: number;
    handbrake: number;
    gear: number;
    steeringAngle: number;
    lapTime: number;
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

export interface SessionInformation {
    laps: number[];
    mapDataAvailable: boolean;
    lapDetails: PaddockLap[];
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

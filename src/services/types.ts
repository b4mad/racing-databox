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

export interface SessionData {
    laps: number[];
    telemetryByLap: Map<number, TelemetryPoint[]>;
    mapDataAvailable: boolean;
}

export interface SessionInformation {
    laps: number[];
    mapDataAvailable: boolean;
    lapDetails: PaddockLap[];
}


export interface TelemetryService {
    getLapData(lapNumber: number): Promise<ProcessedTelemetryData>;
    getSessionData(sessionId: string): Promise<SessionData>;
}

export interface PaddockLap {
    id: number;
    number: number;
    time: number;
    valid: boolean;
    length?: number;
    session?: PaddockSession;
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

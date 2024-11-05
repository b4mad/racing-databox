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

export interface PaddockLap {
    number: number;
    time: number;
    valid: boolean;
}

export interface PaddockCar {
    name: string;
}

export interface PaddockDriver {
    name: string;
}

export interface PaddockGame {
    name: string;
}

export interface PaddockSessionType {
    type: string;
}

export interface PaddockTrack {
    name: string;
}

export interface PaddockSession {
    sessionId: string;
    car: PaddockCar;
    driver: PaddockDriver;
    game: PaddockGame;
    sessionType: PaddockSessionType;
    track: PaddockTrack;
}

export interface PaddockSessionData {
    laps: PaddockLap[];
    session: PaddockSession;
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

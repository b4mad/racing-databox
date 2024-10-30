export interface TelemetryPoint {
    distance: number;
    speed: number;
    throttle: number;
    brake: number;
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
}

export interface TelemetryService {
    getLapData(lapNumber: number): Promise<ProcessedTelemetryData>;
    getSessionData(sessionId: string): Promise<SessionData>;
}

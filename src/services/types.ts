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

export interface TelemetryService {
    getLapData(lapNumber: number): Promise<ProcessedTelemetryData>;
}

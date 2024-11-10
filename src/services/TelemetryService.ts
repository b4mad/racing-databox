import { RawTelemetryData, ProcessedTelemetryData, TelemetryPoint, TelemetryService } from './types';

function parseTelemetryData(rawData: RawTelemetryData): {
    telemetryLaps: number[];
    telemetryData: TelemetryPoint[];
    mapDataAvailable: boolean;
} {
    // Find column indexes
    const distanceIndex = rawData.columns.indexOf('DistanceRoundTrack');
    const speedIndex = rawData.columns.indexOf('SpeedMs');
    const throttleIndex = rawData.columns.indexOf('Throttle');
    const brakeIndex = rawData.columns.indexOf('Brake');
    const gearIndex = rawData.columns.indexOf('Gear');
    const handbrakeIndex = rawData.columns.indexOf('Handbrake');
    const steeringIndex = rawData.columns.indexOf('SteeringAngle');
    const lapTimeIndex = rawData.columns.indexOf('CurrentLapTime');
    const lapNumberIndex = rawData.columns.indexOf('CurrentLap');
    const posXIndex = rawData.columns.indexOf('WorldPosition_x');
    const posYIndex = rawData.columns.indexOf('WorldPosition_y');
    const posZIndex = rawData.columns.indexOf('WorldPosition_z');
    const yawIndex = rawData.columns.indexOf('Yaw');
    const pitchIndex = rawData.columns.indexOf('Pitch');
    const rollIndex = rawData.columns.indexOf('Roll');

    const mapDataAvailable = posXIndex !== -1 && posYIndex !== -1 && posZIndex !== -1;

    // Extract unique lap numbers and sort them
    const telemetryLaps = [...new Set(rawData.data.map(row => row[lapNumberIndex]))];
    telemetryLaps.sort((a, b) => a - b);

    const telemetryData: TelemetryPoint[] = rawData.data.map(row => {
        const point: TelemetryPoint = {
            distance: row[distanceIndex],
            speed: row[speedIndex] * 3.6, // Convert m/s to km/h
            throttle: row[throttleIndex] * 100, // Convert to percentage
            brake: row[brakeIndex] * 100, // Convert to percentage
            handbrake: row[handbrakeIndex] * 100, // Convert to percentage
            gear: row[gearIndex] - 1,
            steeringAngle: row[steeringIndex],
            lapTime: row[lapTimeIndex],
            lapNumber: row[lapNumberIndex],
        };

        if (mapDataAvailable) {
            point.position = {
                x: row[posXIndex],
                y: row[posYIndex],
                z: row[posZIndex]
            };
            point.rotation = {
                yaw: row[yawIndex],
                pitch: row[pitchIndex],
                roll: row[rollIndex]
            };
        }

        return point;
    });

    return {
        telemetryLaps,
        telemetryData,
        mapDataAvailable
    };
}

export class ApiTelemetryService implements TelemetryService {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async getLapData(lapId: number): Promise<ProcessedTelemetryData> {
        const response = await fetch(`${this.baseUrl}/lap/${lapId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch telemetry data: ${response.statusText}`);
        }
        const rawData = await response.json();
        const { telemetryData, mapDataAvailable } = parseTelemetryData(rawData);
        return {
            points: telemetryData,
            mapDataAvailable
        };
    }

}

export function createTelemetryService(): TelemetryService {
    return new ApiTelemetryService('/api');
}

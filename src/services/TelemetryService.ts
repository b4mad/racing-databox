import { RawTelemetryData, ProcessedTelemetryData, TelemetryPoint, TelemetryService, SessionData } from './types';
import mockData from '../mock-data/lap-1.json';

function parseTelemetryData(rawData: RawTelemetryData): ProcessedTelemetryData {
    // Find column indexes
    const distanceIndex = rawData.columns.indexOf('DistanceRoundTrack');
    const speedIndex = rawData.columns.indexOf('SpeedMs');
    const throttleIndex = rawData.columns.indexOf('Throttle');
    const brakeIndex = rawData.columns.indexOf('Brake');
    const gearIndex = rawData.columns.indexOf('Gear');
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

    const points: TelemetryPoint[] = rawData.data.map(row => {
        const point: TelemetryPoint = {
            distance: row[distanceIndex],
            speed: row[speedIndex] * 3.6, // Convert m/s to km/h
            throttle: row[throttleIndex] * 100, // Convert to percentage
            brake: row[brakeIndex] * 100, // Convert to percentage
            gear: row[gearIndex],
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
        points,
        mapDataAvailable
    };
}

export class MockTelemetryService implements TelemetryService {
    async getLapData(lapNumber: number): Promise<ProcessedTelemetryData> {
        await new Promise(resolve => setTimeout(resolve, 500));
        return parseTelemetryData(mockData as RawTelemetryData);
    }

    async getSessionData(sessionId: string): Promise<SessionData> {
        const { points, mapDataAvailable } = await this.getLapData(1);
        return {
            laps: [1],
            telemetryByLap: new Map([[1, points]]),
            mapDataAvailable
        };
    }
}

export class ApiTelemetryService implements TelemetryService {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async getLapData(lapNumber: number): Promise<ProcessedTelemetryData> {
        const response = await fetch(`${this.baseUrl}/lap/${lapNumber}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch telemetry data: ${response.statusText}`);
        }
        const rawData = await response.json();
        return parseTelemetryData(rawData);
    }

    async getSessionData(sessionId: string): Promise<SessionData> {
        const response = await fetch(`${this.baseUrl}/session/${sessionId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch session data: ${response.statusText}`);
        }
        const rawData = await response.json();
        const { telemetryLaps, telemetryData, mapDataAvailable } = parseTelemetryData(rawData);

        // Organize telemetry data by lap
        const telemetryByLap = new Map();
        telemetryLaps.forEach(lap => {
            telemetryByLap.set(lap, telemetryData.filter(item => item.lapNumber === lap));
        });

        return {
            laps: telemetryLaps,
            telemetryByLap,
            mapDataAvailable
        };
    }
}

export function createTelemetryService(): TelemetryService {
    if (false && import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        return new MockTelemetryService();
    }
    return new ApiTelemetryService(import.meta.env.VITE_API_BASE_URL || '');
}

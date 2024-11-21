import { PaddockService } from '../services/PaddockService';
import * as fs from 'fs';
import * as path from 'path';

// Create and export the shared paddockService instance
export const paddockService = new PaddockService('http://telemetry.b4mad.racing:30050/graphql');

// Create and export the fixtures directory path
export const fixturesDir = path.join(__dirname, 'fixtures');

// Ensure fixtures directory exists
if (!fs.existsSync(fixturesDir)){
    fs.mkdirSync(fixturesDir, { recursive: true });
}

// Helper to save test responses
export const saveTestResponse = (testName: string | undefined, response: any) => {
    if (testName && response) {
        const sanitizedTestName = testName.replace(/\s+/g, '_');
        const fixturePath = path.join(fixturesDir, `${sanitizedTestName}.json`);
        fs.writeFileSync(fixturePath, JSON.stringify(response, null, 2));
    }
};

// Helper to sanitize session data for serialization
export const sanitizeSessionForSerialization = (session: any) => {
    return {
        ...session,
        laps: session.laps.map((lap: any) => {
            const { session: _, ...lapWithoutSession } = lap;
            return lapWithoutSession;
        })
    };
};

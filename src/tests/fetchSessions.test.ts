import { PaddockService } from '../services/PaddockService';
import { PaddockSession, PaddockLap } from '../services/types';
import * as fs from 'fs';
import * as path from 'path';

describe('fetchSessions', () => {
    const paddockService = new PaddockService('http://telemetry.b4mad.racing:30050/graphql');

    // Create fixtures directory if it doesn't exist
    const fixturesDir = path.join(__dirname, 'fixtures');
    if (!fs.existsSync(fixturesDir)){
        fs.mkdirSync(fixturesDir, { recursive: true });
    }

    // Store test responses
    let currentResponse: any = null;

    // Save responses after each test
    afterEach(async () => {
        const testInfo = expect.getState().currentTestName;
        if (testInfo && currentResponse) {
            const testName = testInfo.replace(/\s+/g, '_');
            const fixturePath = path.join(fixturesDir, `${testName}.json`);
            const sanitizedResponse = {
                ...currentResponse,
                items: currentResponse.items.map(sanitizeSessionForSerialization)
            };
            fs.writeFileSync(fixturePath, JSON.stringify(sanitizedResponse, null, 2));
        }
        currentResponse = null;
    });

    it('should fetch sessions for driver ID 10', async function() {
        const sessions = await paddockService.getSessions(10, undefined, { driverId: 10 });
        currentResponse = sessions;

        // Verify we got some sessions back
        expect(sessions.items.length).toBeGreaterThan(0);

        // Check the structure of each session
        sessions.items.forEach((session: PaddockSession) => {
            expect(session).toHaveProperty('sessionId');
            expect(session).toHaveProperty('driver');
            expect(session.driver.id).toBe(10);
            expect(session).toHaveProperty('car');
            expect(session).toHaveProperty('laps');
            expect(Array.isArray(session.laps)).toBe(true);
        });
    }, 10000); // Increase timeout to 10s for API call

    it('should fetch sessions with default limit when no driver ID specified', async function() {
        const sessions = await paddockService.getSessions(10);
        currentResponse = sessions;

        expect(sessions.items.length).toBeLessThanOrEqual(10);
        expect(sessions.items.length).toBeGreaterThan(0);

        sessions.items.forEach((session: PaddockSession) => {
            expect(session).toHaveProperty('sessionId');
            expect(session).toHaveProperty('driver');
            expect(session).toHaveProperty('car');
            expect(session).toHaveProperty('laps');
        });
    }, 10000);

    it('should include valid lap data in sessions', async function() {
        const sessions = await paddockService.getSessions(5, '10');
        currentResponse = sessions;

        sessions.items.forEach((session: PaddockSession) => {
            session.laps.forEach((lap: PaddockLap) => {
                expect(lap).toHaveProperty('number');
                expect(lap).toHaveProperty('time');
                expect(lap).toHaveProperty('valid');
                expect(typeof lap.number).toBe('number');
                expect(typeof lap.time).toBe('number');
                expect(typeof lap.valid).toBe('boolean');
            });
        });
    }, 10000);
});
function sanitizeSessionForSerialization(session: any) {
    return {
        ...session,
        laps: session.laps.map((lap: any) => {
            const { session: _, ...lapWithoutSession } = lap;
            return lapWithoutSession;
        })
    };
}

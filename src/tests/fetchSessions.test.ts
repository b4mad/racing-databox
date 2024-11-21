import { PaddockSession, PaddockLap } from '../services/types';
import { paddockService, saveTestResponse, sanitizeSessionForSerialization } from './testUtils';
// At the top of src/tests/fetchSessions.test.ts
import debug from 'debug';
debug.enable('paddock:*'); // Enable all paddock namespaces
// At the top of src/tests/fetchSessions.test.ts
// process.env.NODE_ENV = 'development';

describe('fetchSessions', () => {
    let currentResponse: any = null;

    afterEach(async () => {
        if (currentResponse) {
            const sanitizedResponse = {
                ...currentResponse,
                items: currentResponse.items.map(sanitizeSessionForSerialization)
            };
            saveTestResponse(expect.getState().currentTestName, sanitizedResponse);
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

describe('fetchLaps', () => {
    let currentResponse: any = null;

    afterEach(async () => {
        if (currentResponse) {
            saveTestResponse(expect.getState().currentTestName, currentResponse);
        }
        currentResponse = null;
    });

    it('should fetch first 2 laps for car ID 4408', async function() {
        const laps = await paddockService.getLaps({ carId: 4408, limit: 2 });
        currentResponse = laps;

        // Verify we got exactly 2 laps
        expect(laps.length).toBe(2);

        // Check the structure of each lap
        laps.forEach((lap) => {
            expect(lap).toHaveProperty('id');
            expect(lap).toHaveProperty('time');
            expect(lap).toHaveProperty('valid');
            expect(lap).toHaveProperty('session');

            // Verify session exists and has expected structure
            expect(lap.session).toBeDefined();
            if (lap.session) {
                // Verify the car ID matches what we requested
                expect(lap.session.car.id).toBe(4408);

                // Check session structure
                expect(lap.session).toHaveProperty('sessionId');
                expect(lap.session).toHaveProperty('driver');
                expect(lap.session).toHaveProperty('game');
                expect(lap.session).toHaveProperty('sessionType');
                expect(lap.session).toHaveProperty('track');
            }
        });
    }, 10000); // Increase timeout to 10s for API call
});

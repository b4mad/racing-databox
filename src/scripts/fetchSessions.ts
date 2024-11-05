import { PaddockService } from '../services/PaddockService';

async function main() {
    try {
        const paddockService = new PaddockService('http://telemetry.b4mad.racing:30050/graphql');
        const sessions = await paddockService.getSessions(undefined, 10);
        console.log('Available sessions:');
        for (const session of sessions) {
            if (!session) continue;
            try {
                const sessionData = await paddockService.getSessionData(session.sessionId);
                console.log('\nSession:', {
                    id: session.sessionId,
                    start: new Date(session.start).toLocaleString(),
                    end: new Date(session.end).toLocaleString(),
                    details: sessionData
                });
            } catch (sessionError) {
                console.warn(`Warning: Could not fetch details for session ${session.sessionId}:`, sessionError);
            }
        }
    } catch (error) {
        console.error('Error fetching sessions:', error);
        process.exit(1);
    }
}

main();

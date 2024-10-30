import { PaddockService } from '../services/PaddockService';

async function main() {
    try {
        const paddockService = new PaddockService('http://telemetry.b4mad.racing:30050/graphql');
        const sessions = await paddockService.getSessions(undefined, 10);
        console.log('Available sessions:');
        sessions.forEach(session => console.log(session));
    } catch (error) {
        console.error('Error fetching sessions:', error);
        process.exit(1);
    }
}

main();

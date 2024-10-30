import { PaddockService } from '../services/PaddockService';

async function main() {
    try {
        const paddockService = new PaddockService('http://telemetry.b4mad.racing:30050/graphql');
        const sessionData = await paddockService.getSessionData('1730284531');
        console.log('Session Data:');
        console.log('Session:', sessionData.session);
        console.log('Laps:', sessionData.laps);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        process.exit(1);
    }
}

main();

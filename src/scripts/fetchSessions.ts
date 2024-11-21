import { PaddockService } from '../services/PaddockService';
import * as util from 'util';

const main = async () => {
    try {
        const paddockService = new PaddockService('http://telemetry.b4mad.racing:30050/graphql');
        const { items: sessions } = await paddockService.getSessions(10, undefined, { driverId: 10 }); // limit 10, driverId 10
        console.log('Available sessions:');
        for (const session of sessions) {
            console.log('\nSession:', util.inspect(session, { depth: 10, colors: true }));
        }
    } catch (error) {
        console.error('Error fetching sessions:', error);
        process.exit(1);
    }
};

main();

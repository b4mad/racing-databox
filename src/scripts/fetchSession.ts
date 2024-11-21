import { PaddockService } from '../services/PaddockService';
import * as util from 'util';

const main = async () => {
    try {
        const paddockService = new PaddockService('http://telemetry.b4mad.racing:30050/graphql');
        const sessionId = '1729092115'; // RBR
        // const sessionId = '1730913437'; // RaceRoom

        const { items: sessions } = await paddockService.getSessions(10, undefined, { sessionId });

        console.log('Session Data:');
        for (const session of sessions) {
            console.log('\nSession Info:', session.sessionId);
            console.log('Session Laps:', session.laps);

            // Use track and car info to fetch additional laps
            if (session.track?.id && session.car?.id) {
                const additionalLaps = await paddockService.getLaps({
                    trackId: session.track.id,
                    carId: session.car.id,
                    limit: 10 // Fetch last 10 laps
                });
                console.log('\nAdditional laps for this car/track combination:');
                console.log(util.inspect(additionalLaps, {depth: null, colors: true}));
            }
        }
    } catch (error) {
        console.error('Error fetching sessions:', error);
        process.exit(1);
    }
};

main();

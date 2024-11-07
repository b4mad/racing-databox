import { PaddockService } from '../services/PaddockService';
import * as util from 'util';

const main = async () => {
    try {
        const paddockService = new PaddockService('http://telemetry.b4mad.racing:30050/graphql');
        const sessionId = '1729092115'; // RBR
        // const sessionId = '1730913437'; // RaceRoom

        const sessionDataArray = await paddockService.getSessionData(sessionId);

        console.log('Session Data:');
        for (const sessionData of sessionDataArray) {
            console.log('\nSession Info:', sessionData.session);
            console.log('Session Laps:', sessionData.laps);

            // Use track and car info to fetch additional laps
            if (sessionData.session.track?.id && sessionData.session.car?.id) {
                const additionalLaps = await paddockService.getLaps(
                    sessionData.session.track.id,
                    sessionData.session.car.id,
                    10 // Fetch last 10 laps
                );
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

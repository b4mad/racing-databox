import { PaddockService } from '../services/PaddockService';

async function main() {
    try {
        const paddockService = new PaddockService('http://telemetry.b4mad.racing:30050/graphql');
        const games = await paddockService.getGames();
        console.log('Available games:');
        games.forEach(game => console.log(`- ${game.name}`));
    } catch (error) {
        console.error('Error fetching games:', error);
        process.exit(1);
    }
}

main();

import { ApolloClient, InMemoryCache, gql, NormalizedCacheObject } from '@apollo/client';
import { logger } from '../utils/logger';
import { TrackLandmarks, PaddockLandmark, PaddockLap, PaddockSession, PaddockCar, PaddockDriver } from './types';

export class PaddockService {
    private client: ApolloClient<NormalizedCacheObject>;

    constructor(endpoint?: string) {
        logger.paddock('PaddockService initializing...');

        const defaultEndpoint = process.env.NODE_ENV === 'development'
            ? '/graphql'
            : '/graphql';

        const uri = typeof window !== 'undefined'
            ? new URL(endpoint || defaultEndpoint, window.location.origin).toString()
            : endpoint || defaultEndpoint;

        logger.paddock('Creating Apollo Client with endpoint: %s', uri);

        this.client = new ApolloClient({
            uri,
            cache: new InMemoryCache(),
            defaultOptions: {
                query: {
                    errorPolicy: 'all',
                }
            }
        });
    }

    private async executeQuery(query: any, variables?: any) {
        logger.paddock('Executing GraphQL query: %O', {
            query: query.loc?.source.body,
            variables
        });

        try {
            const result = await this.client.query({ query, variables });
            logger.paddock('Query result: %O', result);
            return result;
        } catch (error) {
            logger.paddock('GraphQL query failed: %O', {
                error,
                query: query.loc?.source.body,
                variables
            });
            throw error;
        }
    }

    async getAllDrivers(limit: number = 10): Promise<PaddockDriver[]> {
        const { data } = await this.executeQuery(gql`
            query GetAllDrivers($limit: Int!) {
                allTelemetryDrivers(first: $limit) {
                    nodes {
                        id
                        name
                    }
                }
            }
        `, { limit });
        return data.allTelemetryDrivers.nodes;
    }

    async getAllCars(limit: number = 10): Promise<PaddockCar[]> {
        const { data } = await this.executeQuery(gql`
            query GetAllCars($limit: Int!) {
                allTelemetryCars(first: $limit) {
                    nodes {
                        id
                        name
                    }
                }
            }
        `, { limit });
        return data.allTelemetryCars.nodes;
    }

    async getCar(carId: number) {
        logger.paddock('Fetching car with id %d', carId);
        const { data } = await this.executeQuery(gql`
            query GetCar($carId: BigInt!) {
                telemetryCarById(id: $carId) {
                    id
                    name
                }
            }
        `, { carId });
        return data.telemetryCarById;
    }

    async getDriver(driverId: number) {
        logger.paddock('Fetching driver with id %d', driverId);
        const { data } = await this.executeQuery(gql`
            query GetDriver($driverId: BigInt!) {
                telemetryDriverById(id: $driverId) {
                    id
                    name
                }
            }
        `, { driverId });
        return data.telemetryDriverById;
    }

    async getTrack(trackId: number) {
        logger.paddock('Fetching track with id %d', trackId);
        const { data } = await this.executeQuery(gql`
            query GetTrack($trackId: BigInt!) {
                telemetryTrackById(id: $trackId) {
                    id
                    name
                }
            }
        `, { trackId });
        return data.telemetryTrackById;
    }

    async getGame(gameId: number) {
        logger.paddock('Fetching game with id %d', gameId);
        const { data } = await this.executeQuery(gql`
            query GetGame($gameId: BigInt!) {
                telemetryGameById(id: $gameId) {
                    id
                    name
                }
            }
        `, { gameId });
        return data.telemetryGameById;
    }

    async getSessionType(sessionTypeId: number) {
        logger.paddock('Fetching session type with id %d', sessionTypeId);
        const { data } = await this.executeQuery(gql`
            query GetSessionType($sessionTypeId: BigInt!) {
                telemetrySessiontypeById(id: $sessionTypeId) {
                    id
                    type
                }
            }
        `, { sessionTypeId });
        return data.telemetrySessiontypeById;
    }

    async getGames(): Promise<Array<{ name: string }>> {
        const { data } = await this.executeQuery(gql`
            query GetGames {
                allTelemetryGames {
                    nodes {
                        name
                    }
                }
            }
        `);
        return data.allTelemetryGames.nodes;
    }

    async getSessions(limit: number = 10, driverId?: number | null, carId?: number | null, trackId?: number | null): Promise<Array<PaddockSession>> {
        logger.paddock('Fetching sessions with limit %d, driverId %s, carId %s, trackId %s', limit, driverId, carId, trackId);
        const { data } = await this.executeQuery(gql`
            query GetSessions($limit: Int!, $driverId: BigInt, $carId: BigInt, $trackId: BigInt) {
                allTelemetrySessions(
                    first: $limit
                    condition: { driverId: $driverId, carId: $carId, trackId: $trackId }
                ) {
                    edges {
                        node {
                            carId
                            driverId
                            end
                            gameId
                            id
                            sessionId
                            sessionTypeId
                            start
                            trackId
                            telemetryLapsBySessionId {
                                nodes {
                                    id
                                    length
                                    number
                                    start
                                    carId
                                    completed
                                    created
                                    end
                                    fastLapId
                                    modified
                                    valid
                                    trackId
                                    time
                                }
                            }
                        }
                    }
                }
            }
        `, { limit, driverId, carId, trackId });

        const sessions = await Promise.all(data.allTelemetrySessions.edges.map(async (edge: any): Promise<PaddockSession> => {
            const node = edge.node;
            let carId = node.carId;

            // If carId is undefined, try to get it from the first lap
            if (!carId && node.telemetryLapsBySessionId.nodes.length > 0) {
                carId = node.telemetryLapsBySessionId.nodes[0].carId;
            }

            // Fetch details for all entities
            const [carDetails, driverDetails, trackDetails, gameDetails, sessionTypeDetails] = await Promise.all([
                carId ? await this.getCar(carId) : null,
                node.driverId ? await this.getDriver(node.driverId) : null,
                node.trackId ? await this.getTrack(node.trackId) : null,
                node.gameId ? await this.getGame(node.gameId) : null,
                node.sessionTypeId ? await this.getSessionType(node.sessionTypeId) : null,
            ]);

            return {
                id: node.id,
                sessionId: node.sessionId,
                car: {
                    id: Number(carId),
                    name: carDetails?.name
                },
                driver: {
                    id: Number(node.driverId),
                    name: driverDetails?.name
                },
                game: {
                    id: Number(node.gameId),
                    name: gameDetails?.name
                },
                sessionType: {
                    id: Number(node.sessionTypeId),
                    type: sessionTypeDetails?.type
                },
                track: {
                    id: Number(node.trackId),
                    name: trackDetails?.name
                },
                laps: node.telemetryLapsBySessionId.nodes.map((lap: any) => ({
                    id: Number(lap.id),
                    number: lap.number,
                    time: lap.time,
                    valid: lap.valid,
                    length: lap.length,
                    start: lap.start,
                    end: lap.end
                }))
            };
        }));
        return sessions;
    }

    async getLandmarks(id: number): Promise<TrackLandmarks> {
        const { data } = await this.executeQuery(gql`
            query GetLandmarks($id: BigInt!) {
                allTelemetryLandmarks(
                    condition: { trackId: $id }
                ) {
                    edges {
                        node {
                            id
                            name
                            start
                            end
                            kind
                        }
                    }
                }
            }
        `, { id });

        const landmarks = data.allTelemetryLandmarks.edges.map((edge: any) => edge.node);

        // Sort all landmarks by start position
        const sortedLandmarks = landmarks.sort((a: PaddockLandmark, b: PaddockLandmark) =>
            a.start - b.start
        );

        // Split into turns and segments
        return {
            turns: sortedLandmarks.filter((l: PaddockLandmark) => l.kind === 'turn'),
            segments: sortedLandmarks.filter((l: PaddockLandmark) => l.kind === 'segment')
        };
    }

    async getLaps(trackId: number, carId: number, limit: number = 10): Promise<PaddockLap[]> {
        const { data } = await this.executeQuery(gql`
            query GetLaps($trackId: BigInt!, $carId: BigInt!, $limit: Int!) {
                allTelemetryLaps(
                    orderBy: TIME_DESC
                    condition: {trackId: $trackId, carId: $carId}
                    first: $limit
                ) {
                    edges {
                        node {
                            id
                            length
                            time
                            valid
                            telemetryCarByCarId {
                                name
                                id
                            }
                            telemetryTrackByTrackId {
                                id
                                name
                            }
                            telemetrySessionBySessionId {
                                sessionId
                                telemetryDriverByDriverId {
                                    id
                                    name
                                }
                                telemetryGameByGameId {
                                    id
                                    name
                                }
                                telemetrySessiontypeBySessionTypeId {
                                    id
                                    type
                                }
                            }
                        }
                    }
                }
            }
        `, { trackId, carId, limit });

        return data.allTelemetryLaps.edges.map((edge: any) => {
            const car = {
                id: edge.node.telemetryCarByCarId.id,
                name: edge.node.telemetryCarByCarId.name
            };
            const sessionNode = edge.node.telemetrySessionBySessionId;
            return {
                id: edge.node.id,
                length: edge.node.length,
                time: edge.node.time,
                valid: edge.node.valid,
                session: {
                    sessionId: sessionNode.sessionId,
                    car,
                    driver: sessionNode.telemetryDriverByDriverId,
                    game: sessionNode.telemetryGameByGameId,
                    sessionType: sessionNode.telemetrySessiontypeBySessionTypeId,
                    track: edge.node.telemetryTrackByTrackId
                }
            };
        });
    }

    async getSessionData(sessionId: string): Promise<PaddockSession[]> {
        const { data } = await this.executeQuery(gql`
            query GetSessionData($sessionId: String!) {
                allTelemetrySessions(
                    condition: { sessionId: $sessionId }
                ) {
                    nodes {
                        id
                        sessionId
                        telemetryLapsBySessionId {
                            nodes {
                                id
                                number
                                time
                                valid
                                length
                            }
                        }
                        telemetryCarByCarId {
                            id
                            name
                        }
                        telemetryDriverByDriverId {
                            id
                            name
                        }
                        telemetryGameByGameId {
                            id
                            name
                        }
                        telemetrySessiontypeBySessionTypeId {
                            id
                            type
                        }
                        telemetryTrackByTrackId {
                            id
                            name
                        }
                    }
                }
            }
        `, { sessionId });

        const sessions = data.allTelemetrySessions.nodes;

        if (!sessions || sessions.length === 0) {
            throw new Error(`Session ${sessionId} not found`);
        }

        return sessions.map((session: any): PaddockSession => {
            // First create the session without laps
            const sessionBase = {
                sessionId: session.sessionId,
                id: session.id,
                car: {
                    id: session.telemetryCarByCarId?.id || 0,
                    name: session.telemetryCarByCarId?.name || 'Unknown'
                },
                driver: {
                    id: session.telemetryDriverByDriverId?.id || 0,
                    name: session.telemetryDriverByDriverId?.name
                },
                game: {
                    id: session.telemetryGameByGameId?.id || 0,
                    name: session.telemetryGameByGameId?.name
                },
                sessionType: {
                    id: session.telemetrySessiontypeBySessionTypeId?.id || 0,
                    type: session.telemetrySessiontypeBySessionTypeId?.type
                },
                track: {
                    id: session.telemetryTrackByTrackId?.id || 0,
                    name: session.telemetryTrackByTrackId?.name
                },
                laps: []
            };

            // Then create the laps array with reference to the session
            const laps = session.telemetryLapsBySessionId.nodes.map((lap: any): PaddockLap => ({
                id: lap.id,
                number: lap.number,
                time: lap.time,
                valid: lap.valid,
                length: lap.length,
                session: sessionBase
            }));

            // Finally combine them
            const paddockSession: PaddockSession = {
                ...sessionBase,
                laps
            };

            return paddockSession;
        });
    }

}

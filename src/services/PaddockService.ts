import { ApolloClient, InMemoryCache, gql, NormalizedCacheObject } from '@apollo/client';
import { logger } from '../utils/logger';
import { TrackLandmarks, PaddockLandmark, PaddockLap, PaddockSession, PaddockCar, PaddockDriver } from './types';
import { log } from 'console';

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

    async getSessions(limit: number = 10, driverId?: number | null): Promise<Array<PaddockSession>> {
        logger.paddock('Fetching sessions with limit %d and driverId %s', limit, driverId);
        const { data } = await this.executeQuery(gql`
            query GetSessions($limit: Int!, $driverId: BigInt) {
                allTelemetrySessions(
                    first: $limit
                    condition: { driverId: $driverId }
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
        `, { limit, driverId });

        const sessions = await Promise.all(data.allTelemetrySessions.edges.map(async (edge: any): Promise<PaddockSession> => {
            const node = edge.node;
            let carId = node.carId;

            // If carId is undefined, try to get it from the first lap
            if (!carId && node.telemetryLapsBySessionId.nodes.length > 0) {
                carId = node.telemetryLapsBySessionId.nodes[0].carId;
            }

            // Only fetch car details if we have a valid carId
            const carDetails = carId ? await this.getCar(carId) : null;

            return {
                id: node.id,
                sessionId: node.sessionId,
                car: {
                    id: carId,
                    name: carDetails?.name
                },
                driver: {
                    id: Number(node.driverId),
                    name: undefined
                },
                game: {
                    id: node.gameId,
                    name: undefined
                },
                sessionType: {
                    id: node.sessionTypeId,
                    type: undefined
                },
                track: {
                    id: node.trackId,
                    name: undefined
                },
                laps: node.telemetryLapsBySessionId.nodes.map((lap: any) => ({
                    id: lap.id,
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

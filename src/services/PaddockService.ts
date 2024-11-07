import { ApolloClient, InMemoryCache, gql, NormalizedCacheObject } from '@apollo/client';
import { logger } from '../utils/logger';
import { PaddockSessionData, TrackLandmarks, PaddockLandmark, PaddockLap, PaddockSession } from './types';

export class PaddockService {
    private client: ApolloClient<NormalizedCacheObject>;

    constructor(endpoint?: string) {
        console.log('PaddockService constructor called');
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

    async getSessions(groupBy?: string, limit: number = 10): Promise<Array<any>> {
        const { data } = await this.executeQuery(gql`
            query GetSessions($limit: Int!) {
                allTelemetrySessions(first: $limit) {
                    nodes {
                        sessionId
                        start
                        end
                        ${groupBy ? 'count' : ''}
                    }
                }
            }
        `, { limit });
        return data.allTelemetrySessions.nodes;
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

    async getSessionData(sessionId: string): Promise<PaddockSessionData[]> {
        const { data } = await this.executeQuery(gql`
            query GetSessionData($sessionId: String!) {
                allTelemetrySessions(
                    condition: { sessionId: $sessionId }
                ) {
                    nodes {
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

        return sessions.map((session: any): PaddockSessionData => {
            const paddockSession: PaddockSession = {
                sessionId: session.sessionId,
                car: {
                    id: session.telemetryCarByCarId?.id || 0,
                    name: session.telemetryCarByCarId?.name || 'Unknown'
                },
                driver: {
                    id: session.telemetryDriverByDriverId?.id || 0,
                    name: session.telemetryDriverByDriverId?.name || 'Unknown'
                },
                game: {
                    id: session.telemetryGameByGameId?.id || 0,
                    name: session.telemetryGameByGameId?.name || 'Unknown'
                },
                sessionType: {
                    id: session.telemetrySessiontypeBySessionTypeId?.id || 0,
                    type: session.telemetrySessiontypeBySessionTypeId?.type || 'Unknown'
                },
                track: {
                    id: session.telemetryTrackByTrackId?.id || 0,
                    name: session.telemetryTrackByTrackId?.name || 'Unknown'
                }
            };

            const laps: PaddockLap[] = session.telemetryLapsBySessionId.nodes.map((lap: any): PaddockLap => ({
                id: lap.id,
                number: lap.number,
                time: lap.time,
                valid: lap.valid,
                length: lap.length,
                session: paddockSession
            }));

            return {
                session: paddockSession,
                laps
            };
        });
    }

}

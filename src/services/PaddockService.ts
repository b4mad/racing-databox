import { ApolloClient, InMemoryCache, gql, NormalizedCacheObject } from '@apollo/client';
import { logger } from '../utils/logger';
import { PaddockSessionData, TrackLandmarks, PaddockLandmark } from './types';

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
                                number
                                time
                                valid
                                telemetryTrackByTrackId {
                                    id
                                    name
                                }
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

        // // For now, just use the first session
        // const session = sessions[0];

        // const laps = session.telemetryLapsBySessionId.nodes.map((lap: any) => ({
        //     number: lap.number,
        //     time: lap.time,
        //     valid: lap.valid
        // }));

        return sessions.map((session: {
            sessionId: string;
            telemetryCarByCarId: { name: string } | null;
            telemetryDriverByDriverId: { name: string };
            telemetryGameByGameId: { name: string };
            telemetrySessiontypeBySessionTypeId: { type: string };
            telemetryTrackByTrackId: { name: string; id: string } | null;
            telemetryLapsBySessionId: {
                nodes: Array<{
                    number: number;
                    time: number;
                    valid: boolean;
                    telemetryTrackByTrackId?: { name: string };
                }>;
            };
        }) => ({
            session: {
                ...session,
                car: session.telemetryCarByCarId || { name: 'Unknown' },
                driver: session.telemetryDriverByDriverId,
                game: session.telemetryGameByGameId,
                sessionType: session.telemetrySessiontypeBySessionTypeId,
                track: session.telemetryTrackByTrackId ||
                       (session.telemetryLapsBySessionId.nodes[0]?.telemetryTrackByTrackId ?? null)
            },
            laps: session.telemetryLapsBySessionId.nodes.map((lap: any) => ({
                number: lap.number,
                time: lap.time,
                valid: lap.valid
            }))
        }));
    }

}

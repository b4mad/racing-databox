import { ApolloClient, InMemoryCache, gql, NormalizedCacheObject } from '@apollo/client';
import { PaddockSessionData } from './types';

export class PaddockService {
    private client: ApolloClient<NormalizedCacheObject>;

    constructor(endpoint?: string) {
        const defaultEndpoint = process.env.NODE_ENV === 'development'
            ? '/graphql'
            : '/graphql';

        const uri = typeof window !== 'undefined'
            ? new URL(endpoint || defaultEndpoint, window.location.origin).toString()
            : endpoint || defaultEndpoint;

        this.client = new ApolloClient({
            uri,
            cache: new InMemoryCache()
        });
    }

    async getGames(): Promise<Array<{ name: string }>> {
        const { data } = await this.client.query({
            query: gql`
                query GetGames {
                    allTelemetryGames {
                        nodes {
                            name
                        }
                    }
                }
            `
        });
        return data.allTelemetryGames.nodes;
    }

    async getSessions(groupBy?: string, limit: number = 10): Promise<Array<any>> {
        const { data } = await this.client.query({
            query: gql`
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
            `,
            variables: { limit }
        });
        return data.allTelemetrySessions.nodes;
    }

    async getSessionData(sessionId: string): Promise<PaddockSessionData[]> {
        const { data } = await this.client.query({
            query: gql`
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
                                }
                            }
                            telemetryCarByCarId {
                                name
                            }
                            telemetryDriverByDriverId {
                                name
                            }
                            telemetryGameByGameId {
                                name
                            }
                            telemetrySessiontypeBySessionTypeId {
                                type
                            }
                            telemetryTrackByTrackId {
                                name
                            }
                        }
                    }
                }
            `,
            variables: { sessionId }
        });

        const sessions = data.allTelemetrySessions.nodes;

        if (!sessions || sessions.length === 0) {
            throw new Error(`Session ${sessionId} not found`);
        }

        // For now, just use the first session
        const session = sessions[0];

        const laps = session.telemetryLapsBySessionId.nodes.map((lap: any) => ({
            number: lap.number,
            time: lap.time,
            valid: lap.valid
        }));

        return sessions.map(session => ({
            session: {
                ...session,
                car: session.telemetryCarByCarId,
                driver: session.telemetryDriverByDriverId,
                game: session.telemetryGameByGameId,
                sessionType: session.telemetrySessiontypeBySessionTypeId,
                track: session.telemetryTrackByTrackId
            },
            laps: session.telemetryLapsBySessionId.nodes.map((lap: any) => ({
                number: lap.number,
                time: lap.time,
                valid: lap.valid
            }))
        }));
    }

}

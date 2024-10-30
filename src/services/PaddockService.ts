import { ApolloClient, InMemoryCache, gql, NormalizedCacheObject } from '@apollo/client';
import { SessionData, TelemetryPoint, ProcessedTelemetryData, PaddockSessionData } from './types';

export class PaddockService {
    private client: ApolloClient<NormalizedCacheObject>;

    constructor(endpoint: string = '/graphql') {
        const uri = typeof window !== 'undefined'
            ? new URL(endpoint, window.location.origin).toString()
            : endpoint;

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

    async getSessionData(sessionId: string): Promise<PaddockSessionData> {
        const { data } = await this.client.query({
            query: gql`
                query GetSessionData($sessionId: String!) {
                    allTelemetrySessions(
                        condition: { sessionId: $sessionId }
                        first: 1
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
                        }
                    }
                }
            `,
            variables: { sessionId }
        });

        const session = data.allTelemetrySessions.nodes[0];

        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }

        const laps = session.telemetryLapsBySessionId.nodes.map((lap: any) => ({
            number: lap.number,
            time: lap.time,
            valid: lap.valid
        }));

        return {
            session,
            laps
        };
    }

    async getLapData(lapNumber: number): Promise<ProcessedTelemetryData> {
        const { data } = await this.client.query({
            query: gql`
                query GetLapData($lapNumber: Int!) {
                    telemetryLapBySessionIdAndStart(number: $lapNumber) {
                        data
                    }
                }
            `,
            variables: { lapNumber }
        });

        const lap = data.telemetryLapBySessionIdAndStart;

        if (!lap) {
            throw new Error(`Lap ${lapNumber} not found`);
        }

        const points: TelemetryPoint[] = [];

        return {
            points,
            mapDataAvailable: false
        };
    }
}

import { ApolloClient, InMemoryCache, gql, NormalizedCacheObject } from '@apollo/client';
import { SessionData, TelemetryPoint, ProcessedTelemetryData } from './types';

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

    async getSessions(groupBy?: string): Promise<Array<any>> {
        const { data } = await this.client.query({
            query: gql`
                query GetSessions {
                    allTelemetrySessions {
                        nodes {
                            sessionId
                            start
                            end
                            ${groupBy ? 'count' : ''}
                        }
                    }
                }
            `
        });
        return data.allTelemetrySessions.nodes;
    }

    async getSessionData(sessionId: string): Promise<SessionData> {
        const { data } = await this.client.query({
            query: gql`
                query GetSessionData($sessionId: String!) {
                    telemetrySessionByDriverIdAndSessionIdAndSessionTypeIdAndGameId(sessionId: $sessionId) {
                        telemetryLapsBySessionId {
                            nodes {
                                number
                                time
                                valid
                                data
                            }
                        }
                    }
                }
            `,
            variables: { sessionId }
        });

        const session = data.telemetrySessionByDriverIdAndSessionIdAndSessionTypeIdAndGameId;

        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }

        const laps = session.telemetryLapsBySessionId.nodes.map((lap: any) => lap.number);
        const telemetryByLap = new Map();

        session.telemetryLapsBySessionId.nodes.forEach((lap: any) => {
            const points: TelemetryPoint[] = [];
            telemetryByLap.set(lap.number, points);
        });

        return {
            laps,
            telemetryByLap,
            mapDataAvailable: false
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

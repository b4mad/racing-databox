import { ApolloClient, InMemoryCache, gql, NormalizedCacheObject } from '@apollo/client';
import { logger } from '../utils/logger';
import { TrackLandmarks, PaddockLandmark, PaddockLap, PaddockSession, PaddockCar, PaddockDriver, PaddockTrack, PaddockGame, PaddockSessionType, PaginatedResponse, PaddockSegment } from './types';

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
                allTelemetryDrivers(
                    first: $limit
                    orderBy: NAME_ASC
                ) {
                    nodes {
                        id
                        name
                    }
                }
            }
        `, { limit });
        return data.allTelemetryDrivers.nodes;
    }

    async getAllTracks(limit: number = 10): Promise<PaddockTrack[]> {
        const { data } = await this.executeQuery(gql`
            query GetAllTracks($limit: Int!) {
                allTelemetryTracks(first: $limit) {
                    nodes {
                        id
                        name
                    }
                }
            }
        `, { limit });
        return data.allTelemetryTracks.nodes;
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

    async getCar(carId: number): Promise<PaddockCar> {
        logger.paddock('Fetching car with id %d', carId);
        const { data } = await this.executeQuery(gql`
            query GetCar($carId: BigInt!) {
                telemetryCarById(id: $carId) {
                    id
                    name
                }
            }
        `, { carId });
        return {
            id: Number(data.telemetryCarById.id),
            name: data.telemetryCarById.name
        };
    }

    async getDriver(driverId: number): Promise<PaddockDriver> {
        logger.paddock('Fetching driver with id %d', driverId);
        const { data } = await this.executeQuery(gql`
            query GetDriver($driverId: BigInt!) {
                telemetryDriverById(id: $driverId) {
                    id
                    name
                }
            }
        `, { driverId });
        return {
            id: Number(data.telemetryDriverById.id),
            name: data.telemetryDriverById.name
        };
    }

    async getTrack(trackId: number): Promise<PaddockTrack> {
        logger.paddock('Fetching track with id %d', trackId);
        const { data } = await this.executeQuery(gql`
            query GetTrack($trackId: BigInt!) {
                telemetryTrackById(id: $trackId) {
                    id
                    name
                }
            }
        `, { trackId });
        return {
            id: Number(data.telemetryTrackById.id),
            name: data.telemetryTrackById.name
        };
    }

    async getGame(gameId: number): Promise<PaddockGame> {
        logger.paddock('Fetching game with id %d', gameId);
        const { data } = await this.executeQuery(gql`
            query GetGame($gameId: BigInt!) {
                telemetryGameById(id: $gameId) {
                    id
                    name
                }
            }
        `, { gameId });
        return {
            id: Number(data.telemetryGameById.id),
            name: data.telemetryGameById.name
        };
    }

    async getSessionType(sessionTypeId: number): Promise<PaddockSessionType> {
        logger.paddock('Fetching session type with id %d', sessionTypeId);
        const { data } = await this.executeQuery(gql`
            query GetSessionType($sessionTypeId: BigInt!) {
                telemetrySessiontypeById(id: $sessionTypeId) {
                    id
                    type
                }
            }
        `, { sessionTypeId });
        return {
            id: Number(data.telemetrySessiontypeById.id),
            type: data.telemetrySessiontypeById.type
        };
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

    async getSessions(
        first: number = 20,
        after?: string,
        filters?: {
            driverId?: number | null,
            carId?: number | null,
            trackId?: number | null,
            sessionId?: string
        }
    ): Promise<PaginatedResponse<PaddockSession>> {
        logger.paddock('Fetching sessions with first %d, after %s, filters %O', first, after, filters);
        const { data } = await this.executeQuery(gql`
            query GetSessions($first: Int!, $after: Cursor, $driverId: BigInt, $carId: BigInt, $trackId: BigInt, $sessionId: String) {
                allTelemetrySessions(
                    orderBy: END_DESC
                    first: $first
                    after: $after
                    condition: { driverId: $driverId, carId: $carId, trackId: $trackId, sessionId: $sessionId }
                ) {
                    totalCount
                    pageInfo {
                        hasNextPage
                        endCursor
                    }
                    edges {
                        node {
                            id
                            sessionId
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
                            telemetryLapsBySessionId {
                                nodes {
                                    id
                                    completed
                                    officialTime
                                    length
                                    number
                                    time
                                    valid
                                    start
                                    end
                                }
                            }
                        }
                    }
                }
            }
        `, { first, after, driverId: filters?.driverId, carId: filters?.carId, trackId: filters?.trackId, sessionId: filters?.sessionId });

        if (!data.allTelemetrySessions) {
            return {
                items: [],
                totalCount: 0,
                hasNextPage: false,
                endCursor: undefined
            };
        }

        const { edges = [], totalCount = 0, pageInfo = {} } = data.allTelemetrySessions;
        const { hasNextPage, endCursor } = pageInfo;
        const sessions = edges?.map((edge: any): PaddockSession => {
            const node = edge.node;
            // Create the session object first
            const session: PaddockSession = {
                id: node.id,
                sessionId: node.sessionId,
                car: {
                    id: Number(node.telemetryCarByCarId?.id),
                    name: node.telemetryCarByCarId?.name
                },
                driver: {
                    id: Number(node.telemetryDriverByDriverId?.id),
                    name: node.telemetryDriverByDriverId?.name
                },
                game: {
                    id: Number(node.telemetryGameByGameId?.id),
                    name: node.telemetryGameByGameId?.name
                },
                sessionType: {
                    id: Number(node.telemetrySessiontypeBySessionTypeId?.id),
                    type: node.telemetrySessiontypeBySessionTypeId?.type
                },
                track: {
                    id: Number(node.telemetryTrackByTrackId?.id),
                    name: node.telemetryTrackByTrackId?.name
                },
                laps: [] // Initialize empty array, will be filled below
            };

            // Now set the laps with reference back to the parent session
            session.laps = node.telemetryLapsBySessionId.nodes.map((lap: any) => ({
                id: Number(lap.id),
                number: lap.number,
                time: lap.time,
                valid: lap.valid,
                length: lap.length,
                start: lap.start,
                end: lap.end,
                session: session // Reference to the parent session
            }));

            return session;
        });
        // logger.paddock('Fetched %d sessions', sessions.length);
        // logger.paddock('Total session count: %d', totalCount);
        // logger.paddock('Has next page: %s', hasNextPage);
        // logger.paddock('End cursor: %s', hasNextPage ? endCursor : undefined);
        return {
            items: sessions,
            totalCount,
            hasNextPage,
            endCursor: hasNextPage ? endCursor : undefined
        };
    }

    async getSegments(lapId: number): Promise<PaddockSegment[]> {
        logger.paddock('Fetching segments for lap %d', lapId);
        const { data } = await this.executeQuery(gql`
            query GetSegments($lapId: BigInt!) {
                allTelemetrySegments(
                    condition: { lapId: $lapId }
                ) {
                    edges {
                        node {
                            id
                            accelerationPoint
                            apex
                            brakeApplicationRate
                            brakePressure
                            brakeReleaseRate
                            brakingPoint
                            coastingTime
                            cornerSpeed
                            entrySpeed
                            exitSpeed
                            gear
                            kind
                            landmarkId
                            lapId
                            launchWheelSlipTime
                            liftOffPoint
                            throttleApplicationRate
                            throttleLift
                            throttleReleaseRate
                        }
                    }
                }
            }
        `, { lapId });

        return data.allTelemetrySegments.edges.map((edge: any) => ({
            id: Number(edge.node.id),
            accelerationPoint: edge.node.accelerationPoint,
            apex: edge.node.apex,
            brakeApplicationRate: edge.node.brakeApplicationRate,
            brakePressure: edge.node.brakePressure,
            brakeReleaseRate: edge.node.brakeReleaseRate,
            brakingPoint: edge.node.brakingPoint,
            coastingTime: edge.node.coastingTime,
            cornerSpeed: edge.node.cornerSpeed,
            entrySpeed: edge.node.entrySpeed,
            exitSpeed: edge.node.exitSpeed,
            gear: edge.node.gear,
            kind: edge.node.kind,
            landmarkId: Number(edge.node.landmarkId),
            lapId: Number(edge.node.lapId),
            launchWheelSlipTime: edge.node.launchWheelSlipTime,
            liftOffPoint: edge.node.liftOffPoint,
            throttleApplicationRate: edge.node.throttleApplicationRate,
            throttleLift: edge.node.throttleLift,
            throttleReleaseRate: edge.node.throttleReleaseRate
        }));
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

    async getLaps({
        trackId = undefined,
        carId = undefined,
        limit = 10,
        id = undefined
    }: {
        trackId?: number | null,
        carId?: number | null,
        limit?: number,
        id?: number | null
    }): Promise<PaddockLap[]> {
        const { data } = await this.executeQuery(gql`
            query GetLaps($trackId: BigInt, $carId: BigInt, $id: BigInt, $limit: Int!) {
                allTelemetryLaps(
                    orderBy: TIME_DESC
                    condition: {trackId: $trackId, carId: $carId, id: $id}
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
        `, { trackId, carId, id, limit });

        return data.allTelemetryLaps.edges.map((edge: any) => {
            const car = {
                id: Number(edge.node.telemetryCarByCarId.id),
                name: edge.node.telemetryCarByCarId.name
            };
            const sessionNode = edge.node.telemetrySessionBySessionId;
            return {
                id: Number(edge.node.id),
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


}

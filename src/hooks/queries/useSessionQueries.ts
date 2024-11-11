import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { PaddockService } from '../../services/PaddockService'
import { createTelemetryService } from '../../services/TelemetryService'
import { PaginatedResponse, PaddockSession } from '../../services/types'

const paddockService = new PaddockService()

export function useSessionsList(filters?: {
  driverId?: number | null
  carId?: number | null
  trackId?: number | null
}) {
  return useInfiniteQuery<PaginatedResponse<PaddockSession>>({
    queryKey: ['sessions', filters],
    queryFn: ({ pageParam = undefined }) => paddockService.getSessions(20, pageParam as string | undefined, filters),
    getNextPageParam: (lastPage) => lastPage.endCursor,
    initialPageParam: undefined as string | undefined,
  })
}

export function useSession(sessionId: string) {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => paddockService.getSessions(1, undefined, { sessionId })
      .then(response => response.items[0]),
    enabled: !!sessionId,
  })
}

export function useTelemetryData(sessionId: string, lapId: number) {
  const telemetryService = createTelemetryService()
  return useQuery({
    queryKey: ['telemetry', sessionId, lapId],
    queryFn: () => telemetryService.getLapData(lapId),
    enabled: !!sessionId && !!lapId,
  })
}

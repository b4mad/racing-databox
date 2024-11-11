import { useQuery } from '@tanstack/react-query'
import { createTelemetryService } from '../../services/TelemetryService'

const telemetryService = createTelemetryService()

export function useTelemetryData(lapId: number) {
  return useQuery({
    queryKey: ['telemetry', lapId],
    queryFn: () => telemetryService.getLapData(lapId),
    enabled: !!lapId,
  })
}

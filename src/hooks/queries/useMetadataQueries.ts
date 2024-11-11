import { useQuery } from '@tanstack/react-query'
import { PaddockService } from '../../services/PaddockService'

const paddockService = new PaddockService()

export function useMetadata() {
  const cars = useQuery({
    queryKey: ['cars'],
    queryFn: () => paddockService.getAllCars(),
  })

  const drivers = useQuery({
    queryKey: ['drivers'],
    queryFn: () => paddockService.getAllDrivers(),
  })

  const tracks = useQuery({
    queryKey: ['tracks'],
    queryFn: () => paddockService.getAllTracks(),
  })

  return { cars, drivers, tracks }
}

import { Box } from '@mui/material';
import { PaddockCar, PaddockDriver, PaddockTrack } from '../services/types';
import { EntitySelect } from './EntitySelect';

interface SessionsViewNavProps {
  cars: PaddockCar[];
  selectedCar?: number | undefined | null;
  onCarChange: (carId: number | undefined) => void;
  drivers: PaddockDriver[];
  selectedDriver?: number | undefined | null;
  onDriverChange: (driverId: number | undefined) => void;
  tracks: PaddockTrack[];
  selectedTrack?: number | undefined | null;
  onTrackChange: (trackId: number | undefined) => void;
}

export function SessionsViewNav({
  cars,
  selectedCar,
  onCarChange,
  drivers,
  selectedDriver,
  onDriverChange,
  tracks,
  selectedTrack,
  onTrackChange
}: SessionsViewNavProps) {
  return (
    <Box sx={{ display: 'flex', gap: 2, py: 2 }}>
      <EntitySelect
        entities={drivers}
        selectedId={selectedDriver}
        onChange={onDriverChange}
        label="Driver"
        getDisplayName={(driver) => driver.name || `Driver #${driver.id}`}
      />
      <EntitySelect
        entities={cars}
        selectedId={selectedCar}
        onChange={onCarChange}
        label="Car"
        getDisplayName={(car) => car.name || `Car #${car.id}`}
      />
      <EntitySelect
        entities={tracks}
        selectedId={selectedTrack}
        onChange={onTrackChange}
        label="Track"
        getDisplayName={(track) => track.name || `Track #${track.id}`}
      />
    </Box>
  );
}

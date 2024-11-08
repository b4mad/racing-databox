import { Box } from '@mui/material';
import { PaddockCar, PaddockDriver } from '../services/types';
import { EntitySelect } from './EntitySelect';

interface SessionsViewNavProps {
  cars: PaddockCar[];
  selectedCar?: number | undefined | null;
  onCarChange: (carId: number | undefined) => void;
  drivers: PaddockDriver[];
  selectedDriver?: number | undefined | null;
  onDriverChange: (driverId: number | undefined) => void;
}

export function SessionsViewNav({
  cars,
  selectedCar,
  onCarChange,
  drivers,
  selectedDriver,
  onDriverChange
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
    </Box>
  );
}

import { Box } from '@mui/material';
import { PaddockCar, PaddockDriver } from '../services/types';
import { EntitySelect } from './EntitySelect';

interface SessionsViewNavProps {
  cars: PaddockCar[];
  selectedCar?: number;
  onCarChange: (carId: number | undefined) => void;
  drivers: PaddockDriver[];
  selectedDriver?: number;
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
        entities={cars}
        selectedId={selectedCar}
        onChange={onCarChange}
        label="Car"
        getDisplayName={(car) => car.name || `Car #${car.id}`}
      />
      <EntitySelect
        entities={drivers}
        selectedId={selectedDriver}
        onChange={onDriverChange}
        label="Driver"
        getDisplayName={(driver) => driver.name || `Driver #${driver.id}`}
      />
    </Box>
  );
}

import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { PaddockCar, PaddockDriver } from '../services/types';

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
      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel id="car-select-label">Car</InputLabel>
        <Select
          labelId="car-select-label"
          value={selectedCar || ''}
          label="Car"
          onChange={(e) => onCarChange(e.target.value ? Number(e.target.value) : undefined)}
        >
          <MenuItem value="">
            <em>All Cars</em>
          </MenuItem>
          {cars.map((car) => (
            <MenuItem key={car.id} value={car.id}>
              {car.name || `Car #${car.id}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel id="driver-select-label">Driver</InputLabel>
        <Select
          labelId="driver-select-label"
          value={selectedDriver || ''}
          label="Driver"
          onChange={(e) => onDriverChange(e.target.value ? Number(e.target.value) : undefined)}
        >
          <MenuItem value="">
            <em>All Drivers</em>
          </MenuItem>
          {drivers.map((driver) => (
            <MenuItem key={driver.id} value={driver.id}>
              {driver.name || `Driver #${driver.id}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

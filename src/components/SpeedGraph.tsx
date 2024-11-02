import { TelemetryPoint } from '../services/types';
import { LineGraph } from './LineGraph';

interface SpeedGraphProps {
  currentLapData: TelemetryPoint[];
}

export function SpeedGraph({ currentLapData }: SpeedGraphProps) {
  return (
    <LineGraph
      data={currentLapData}
      dataKey="speed"
      name="Speed"
      unit="km/h"
      color="#2196f3"
    />
  );
}

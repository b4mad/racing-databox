import { TelemetryPoint } from '../services/types';
import { ChartMapScatter } from './ChartMapScatter';
import { ZoomState } from './types';

interface MapProps {
  data: TelemetryPoint[];
  zoomState?: ZoomState;
}

export function MapScatter({ data, zoomState }: MapProps) {
  return <ChartMapScatter data={data} zoomState={zoomState} />;
}

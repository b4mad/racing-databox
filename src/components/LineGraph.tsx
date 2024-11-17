import { TelemetryPoint, TelemetryCacheEntry } from '../services/types';
import { ZoomState } from './types';
import { ChartLineGraph } from './ChartLineGraph';

interface DataKeyConfig {
  key: keyof TelemetryPoint;
  name: string;
  color: string;
}

interface BaseGraphProps {
  lapsData: { [lapNumber: number]: TelemetryCacheEntry };
  zoomState: ZoomState;
  showBrush?: boolean;
  onZoomChange?: (startMeters: number, endMeters: number) => void;
}

interface LineGraphProps extends BaseGraphProps {
  dataKeys: DataKeyConfig[];
  unit?: string;
  stepLine?: boolean;
  title?: string;
}

const GRAPH_CONFIGS = {
  speed: {
    dataKeys: [{ key: "speed" as keyof TelemetryPoint, name: "Speed", color: "#2196f3" }],
    unit: " km/h"
  },
  pedals: {
    dataKeys: [
      { key: "throttle" as keyof TelemetryPoint, name: "Throttle", color: "#4caf50" },
      { key: "brake" as keyof TelemetryPoint, name: "Brake", color: "#f44336" },
      { key: "handbrake" as keyof TelemetryPoint, name: "Handbrake", color: "#ff9800" }
    ],
    unit: "%"
  },
  gear: {
    dataKeys: [{ key: "gear" as keyof TelemetryPoint, name: "Gear", color: "#9c27b0" }],
    unit: "",
    stepLine: true
  }
};

export function SpeedGraph(props: BaseGraphProps) {
  return <LineGraph {...props} {...GRAPH_CONFIGS.speed} />;
}

export function PedalsGraph(props: BaseGraphProps) {
  return <LineGraph {...props} {...GRAPH_CONFIGS.pedals} />;
}

export function GearGraph(props: BaseGraphProps) {
  return <LineGraph {...props} {...GRAPH_CONFIGS.gear} />;
}

export function LineGraph({ lapsData, dataKeys, unit = '', stepLine = false, title, zoomState, onZoomChange }: LineGraphProps) {
  return (
    <ChartLineGraph
      lapsData={lapsData}
      dataKeys={dataKeys}
      unit={unit}
      stepLine={stepLine}
      title={title}
      zoomState={zoomState}
      onZoomChange={onZoomChange}
    />
  );
}

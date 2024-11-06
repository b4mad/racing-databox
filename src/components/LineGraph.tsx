import { TelemetryPoint } from '../services/types';
import { ZoomState } from './types';
import { ChartLineGraph } from './ChartLineGraph';

interface DataKeyConfig {
  key: keyof TelemetryPoint;
  name: string;
  color: string;
}

interface BaseGraphProps {
  currentLapData: TelemetryPoint[];
  syncId?: string;
  zoomState: ZoomState;
  showBrush?: boolean;
}

interface LineGraphProps extends BaseGraphProps {
  data: TelemetryPoint[];
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
  return <LineGraph {...props} data={props.currentLapData} {...GRAPH_CONFIGS.speed} />;
}

export function PedalsGraph(props: BaseGraphProps) {
  return <LineGraph {...props} data={props.currentLapData} {...GRAPH_CONFIGS.pedals} />;
}

export function GearGraph(props: BaseGraphProps) {
  return <LineGraph {...props} data={props.currentLapData} {...GRAPH_CONFIGS.gear} />;
}

export function LineGraph({ data, dataKeys, unit = '', stepLine = false, title, syncId, zoomState }: LineGraphProps) {
  return (
    <ChartLineGraph
      data={data}
      dataKeys={dataKeys}
      unit={unit}
      stepLine={stepLine}
      title={title}
      syncId={syncId}
      zoomState={zoomState}
    />
  );
}

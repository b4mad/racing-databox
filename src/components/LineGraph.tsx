import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts';
import { TelemetryPoint } from '../services/types';
import { ZoomState } from './types';

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

export function LineGraph({ data, dataKeys, unit = '', stepLine = false, title, syncId, showBrush, zoomState }: LineGraphProps) {
  return (
    <div className="graph-container" style={{ width: '100%', height: '200px', position: 'relative' }}>
      {title && <div style={{ position: 'absolute', left: 20, top: 10, fontSize: '1em' }}>{title}</div>}
      <ResponsiveContainer width="100%" height="85%">
        <LineChart
          data={data}
          margin={{ top: 40, right: 20, bottom: 5, left: 20 }}
          syncId={syncId}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e0e0e0"
            strokeOpacity={0.5}
          />
          <XAxis
            dataKey="distance"
            name="Distance"
            unit="m"
            domain={[zoomState.left, zoomState.right]}
            type="number"
            allowDataOverflow
          />
          <YAxis
            unit={unit}
            domain={[0, dataKeys[0].key === 'speed' ? 250 : 'auto']}
            allowDataOverflow={true}
          />
          <Tooltip
            cursor={{ stroke: 'red', strokeWidth: 1 }}
            content={() => null}
            position={{ x: 0, y: 0 }}
          />
          <Legend />
          {dataKeys.map((config) => (
            <Line
              key={config.key}
              type={stepLine ? "stepAfter" : "monotone"}
              dataKey={config.key}
              stroke={config.color}
              strokeWidth={1.5}
              name={config.name}
              dot={false}
              isAnimationActive={false}
            />
          ))}
          {showBrush && (
            <Brush
              dataKey="distance"
              height={30}
              stroke="#8884d8"
              startIndex={Math.floor(typeof zoomState.left === 'number' ? zoomState.left : 0)}
              endIndex={Math.floor(typeof zoomState.right === 'number' ? zoomState.right : data.length - 1)}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

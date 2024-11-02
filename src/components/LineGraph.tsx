import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TelemetryPoint } from '../services/types';

interface DataKeyConfig {
  key: keyof TelemetryPoint;
  name: string;
  color: string;
}

interface LineGraphProps {
  data: TelemetryPoint[];
  dataKeys: DataKeyConfig[];
  unit?: string;
  stepLine?: boolean;
  title?: string;
}

interface CurrentValueDisplayProps {
  value: number;
  label: string;
  unit: string;
}

function CurrentValueDisplay({ value, label, unit }: CurrentValueDisplayProps) {
  return (
    <div style={{ 
      position: 'absolute', 
      right: 20, 
      top: 10,
      fontSize: '1.2em'
    }}>
      {label}: <span style={{ borderBottom: '2px solid #2196f3' }}>{value}{unit}</span>
    </div>
  );
}

export function SpeedGraph({ currentLapData }: { currentLapData: TelemetryPoint[] }) {
  return (
    <LineGraph
      data={currentLapData}
      dataKeys={[
        { key: "speed", name: "Speed", color: "#2196f3" }
      ]}
      unit=" km/h"
      title="Speed in kph"
    />
  );
}

export function PedalsGraph({ currentLapData }: { currentLapData: TelemetryPoint[] }) {
  return (
    <LineGraph
      data={currentLapData}
      dataKeys={[
        { key: "throttle", name: "Throttle", color: "#4caf50" },
        { key: "brake", name: "Brake", color: "#f44336" },
        { key: "handbrake", name: "Handbrake", color: "#ff9800" }
      ]}
      unit="%"
    />
  );
}

export function GearGraph({ currentLapData }: { currentLapData: TelemetryPoint[] }) {
  return (
    <LineGraph
      data={currentLapData}
      dataKeys={[
        { key: "gear", name: "Gear", color: "#9c27b0" }
      ]}
      unit=""
      stepLine
    />
  );
}

export function LineGraph({ data, dataKeys, unit = '', stepLine = false, title }: LineGraphProps) {
  const currentValue = data.length > 0 ? data[data.length - 1][dataKeys[0].key] : 0;
  const distance = data.length > 0 ? Math.round(data[data.length - 1].distance) : 0;

  return (
    <div className="graph-container" style={{ width: '100%', height: '200px', position: 'relative' }}>
      {title && <div style={{ position: 'absolute', left: 20, top: 10, fontSize: '1.2em' }}>{title}</div>}
      <div style={{ position: 'absolute', left: '50%', top: 10, transform: 'translateX(-50%)', fontSize: '1.2em' }}>
        {distance}m
      </div>
      <CurrentValueDisplay 
        value={currentValue as number} 
        label={dataKeys[0].name} 
        unit={unit}
      />
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 40, right: 20, bottom: 5, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="distance"
            name="Distance"
            unit="m"
          />
          <YAxis unit={unit} />
          <Tooltip
            content={({ payload, label }) => {
              if (payload && payload.length) {
                return (
                  <div className="custom-tooltip" style={{
                    backgroundColor: 'white',
                    padding: '10px',
                    border: '1px solid #ccc'
                  }}>
                    <p>Distance: {label}m</p>
                    {payload.map((entry) => (
                      <p key={entry.name}>
                        {entry.name}: {entry.value}{unit}
                      </p>
                    ))}
                  </div>
                );
              }
              return null;
            }}
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
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

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
}

export function SpeedGraph({ currentLapData }: { currentLapData: TelemetryPoint[] }) {
  return (
    <LineGraph
      data={currentLapData}
      dataKeys={[
        { key: "speed", name: "Speed", color: "#2196f3" }
      ]}
      unit="km/h"
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

export function LineGraph({ data, dataKeys, unit = '' }: LineGraphProps) {
  return (
    <div className="graph-container" style={{ width: '100%', height: '200px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, bottom: 5, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
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
              type="monotone"
              dataKey={config.key}
              stroke={config.color}
              name={config.name}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

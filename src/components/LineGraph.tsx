import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TelemetryPoint } from '../services/types';

interface LineGraphProps {
  data: TelemetryPoint[];
  dataKey: keyof TelemetryPoint;
  name: string;
  unit?: string;
  color?: string;
}

export function LineGraph({ data, dataKey, name, unit = '', color = '#8884d8' }: LineGraphProps) {
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
          <YAxis
            name={name}
            unit={unit}
          />
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
                    <p>{name}: {payload[0].value}{unit}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            name={name}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

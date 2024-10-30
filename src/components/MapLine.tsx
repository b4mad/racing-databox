import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TelemetryPoint } from '../services/types';

interface MapLineProps {
  data: TelemetryPoint[];
}

export function MapLine({ data }: MapLineProps) {
  return (
    <div className="map-container" style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="position.x"
            name="X Position"
            unit="m"
          />
          <YAxis
            type="number"
            dataKey="position.z"
            name="Y Position"
            unit="m"
          />
          {/* <Tooltip
            content={({ payload }) => {
              if (payload && payload.length) {
                const point = payload[0].payload;
                return (
                  <div className="custom-tooltip" style={{
                    backgroundColor: 'white',
                    padding: '10px',
                    border: '1px solid #ccc'
                  }}>
                    <p>Time: {point.lapTime.toFixed(3)}s</p>
                    <p>X: {point.position.x.toFixed(1)}m</p>
                    <p>Y: {point.position.z.toFixed(1)}m</p>
                  </div>
                );
              }
              return null;
            }}
          /> */}
          <Legend />
          <Line
            type="natural"
            dataKey="position.z"
            stroke="#000000"
            dot={false}
            name="Track Path"
            yAxisId={0}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

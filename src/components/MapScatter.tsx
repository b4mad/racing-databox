import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { TelemetryPoint } from '../services/types';

interface MapProps {
  data: TelemetryPoint[];
}

export function MapScatter({ data }: MapProps) {
  return (
    <div className="map-container" style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
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
        <Tooltip
          cursor={{ strokeDasharray: '3 3' }}
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
        />
        <Legend />
        <Scatter
          name="Position"
          data={data}
          line={{
            stroke: '#000000',
            strokeWidth: 1
          }}
          lineType='joint'
          lineJointType='natural'
          // https://github.com/recharts/recharts/issues/1177#issuecomment-710680374
          fill="#00000000"
          strokeWidth={1}
        />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TelemetryPoint } from '../services/types';

interface MapLineProps {
  data: TelemetryPoint[];
  syncId?: string;
}

export function MapLine({ data, syncId }: MapLineProps) {
  return (
    <div className="map-container" style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          syncId={syncId}
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
            dataKey="position.y"
            name="Y Position"
            unit="m"
          />
          <Tooltip
            cursor={{ stroke: 'red', strokeWidth: 1 }}
            content={() => null}
            position={{ x: 0, y: 0 }}
          />
          <Legend />
          <Line
            type="natural"
            dataKey="position.y"
            stroke="#000000"
            dot={false}
            activeDot={{ r: 2, fill: "#550000" }}
            name="Track Path"
            yAxisId={0}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

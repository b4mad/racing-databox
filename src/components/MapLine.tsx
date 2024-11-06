import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TelemetryPoint } from '../services/types';
import { ZoomState } from './types';

interface MapLineProps {
  data: TelemetryPoint[];
  syncId?: string;
  zoomState: ZoomState;
}

export function MapLine({ data, syncId, zoomState }: MapLineProps) {
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
            domain={[zoomState.left, zoomState.right]}
            allowDataOverflow
          />
          <YAxis
            type="number"
            dataKey="position.y"
            name="Y Position"
            unit="m"
            domain={[zoomState.bottom, zoomState.top]}
            allowDataOverflow
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

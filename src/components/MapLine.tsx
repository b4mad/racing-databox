import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TelemetryPoint } from '../services/types';
import { ZoomState } from './types';
import { useMemo } from 'react';

interface MapLineProps {
  data: TelemetryPoint[];
  syncId?: string;
  zoomState: ZoomState;
}

export function MapLine({ data, syncId, zoomState }: MapLineProps) {
  // Calculate visible map area based on zoomed data points
  const mapBounds = useMemo(() => {
    if (data.length === 0) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };

    const minDistance = typeof zoomState.left === 'number' ? zoomState.left : 0;
    const maxDistance = typeof zoomState.right === 'number' ? zoomState.right : data[data.length - 1].distance;

    // Find points within the zoomed distance range
    const visiblePoints = data.filter(point =>
      point.distance >= minDistance && 
      point.distance <= maxDistance &&
      point.position !== undefined // Add type guard for position
    );

    if (visiblePoints.length === 0) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };

    // Calculate bounds with type-safe position access
    const minX = Math.min(...visiblePoints.map(p => p.position!.x));
    const maxX = Math.max(...visiblePoints.map(p => p.position!.x));
    const minY = Math.min(...visiblePoints.map(p => p.position!.y));
    const maxY = Math.max(...visiblePoints.map(p => p.position!.y));

    // Add margin
    const margin = 50;
    return {
      minX: minX - margin,
      maxX: maxX + margin,
      minY: minY - margin,
      maxY: maxY + margin
    };
  }, [data, zoomState.left, zoomState.right]);

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
            domain={[mapBounds.minX, mapBounds.maxX]}
            allowDataOverflow
          />
          <YAxis
            type="number"
            dataKey="position.y"
            name="Y Position"
            unit="m"
            domain={[mapBounds.minY, mapBounds.maxY]}
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

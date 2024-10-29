import { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { createTelemetryService } from '../services/TelemetryService';
import { ProcessedTelemetryData, TelemetryPoint } from '../services/types';

interface MapPoint {
  x: number;
  y: number;
  timestamp: string;
}

export function Map() {
  const [data, setData] = useState<MapPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const service = createTelemetryService();
        const telemetryData = await service.getLapData(1); // Starting with lap 1

        if (!telemetryData.mapDataAvailable) {
          throw new Error('Map data is not available');
        }

        const mapPoints = telemetryData.points.map((point: TelemetryPoint) => ({
          x: point.position!.x,
          y: point.position!.z, // Using z as y for top-down view
          timestamp: formatTime(point.lapTime)
        }));

        setData(mapPoints);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load map data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(3);
    return `${minutes}:${remainingSeconds.padStart(6, '0')}`;
  };

  if (loading) {
    return <div>Loading map data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
  return (
    <div className="map-container">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="x"
          name="X Position"
          unit="m"
        />
        <YAxis
          type="number"
          dataKey="y"
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
                  <p>Time: {point.timestamp}</p>
                  <p>X: {point.x}m</p>
                  <p>Y: {point.y}m</p>
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
          line={{ stroke: '#8884d8' }}
          lineType='joint'
          lineJointType='natural'
          fill="#8884d8"
          shape="circle"
        />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

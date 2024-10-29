import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Example data - replace with your actual position data
const data = [
  { x: 5, y: 5, timestamp: '0:00' },
  { x: 10, y: 20, timestamp: '0:01' },
  { x: 30, y: 40, timestamp: '0:02' },
  { x: 50, y: 30, timestamp: '0:03' },
  { x: 80, y: 35, timestamp: '0:04' },
  { x: 100, y: 50, timestamp: '0:05' },
  { x: 85, y: 70, timestamp: '0:06' },
  { x: 50, y: 80, timestamp: '0:07' },
  { x: 20, y: 50, timestamp: '0:08' },
];

export function Map() {
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

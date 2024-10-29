import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Example data - replace with your actual position data
const data = [
  { x: 10, y: 20, timestamp: '0:00' },
  { x: 15, y: 25, timestamp: '0:01' },
  { x: 20, y: 30, timestamp: '0:02' },
  { x: 25, y: 15, timestamp: '0:03' },
  { x: 30, y: 20, timestamp: '0:04' },
];

export function Map() {
  return (
    <div className="map-container">
      <ScatterChart 
        width={800} 
        height={600}
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
          fill="#8884d8"
          shape="circle"
        />
      </ScatterChart>
    </div>
  );
}

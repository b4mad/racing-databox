import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { TelemetryPoint } from '../services/types';

// Register Chart.js components
ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

interface ChartMapScatterProps {
  data: TelemetryPoint[];
  zoomState?: ZoomState;
}

export function ChartMapScatter({ data, zoomState }: ChartMapScatterProps) {
  const decimateData = (data: TelemetryPoint[], maxPoints: number) => {
    if (data.length <= maxPoints) return data;
    const step = Math.ceil(data.length / maxPoints);
    return data.filter((_, index) => index % step === 0);
  };

  const decimatedData = decimateData(data, 1000);

  const getSpeedColor = (speed: number) => {
    const hue = Math.max(0, Math.min(240 - (speed * 240 / 250), 240));
    return `hsl(${hue}, 100%, 50%)`;
  };

  const chartData = {
    datasets: [{
      label: 'Track Position',
      data: decimatedData.map(point => ({
        x: point.position.x,
        y: point.position.z,
        ...point
      })),
      borderColor: decimatedData.map(point => getSpeedColor(point.speed)),
      backgroundColor: 'rgba(0,0,0,0)',
      borderWidth: 1,
      pointRadius: 1,
      showLine: true,
      tension: 0.4
    }]
  };

  const options: ChartOptions<'scatter'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'X Position (m)'
        }
      },
      y: {
        type: 'linear',
        title: {
          display: true,
          text: 'Y Position (m)'
        }
      }
    },
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: 'xy',
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'xy',
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const point = context.raw;
            return [
              `Speed: ${point.speed.toFixed(1)} km/h`,
              `Time: ${point.lapTime.toFixed(3)}s`,
              `X: ${point.position.x.toFixed(1)}m`,
              `Y: ${point.position.z.toFixed(1)}m`
            ];
          }
        }
      }
    }
  };

  return (
    <div className="map-container" style={{ width: '100%', height: '100%' }}>
      <Scatter data={chartData} options={options} />
    </div>
  );
}

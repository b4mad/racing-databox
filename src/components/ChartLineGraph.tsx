import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { TelemetryPoint } from '../services/types';
import { ZoomState } from './types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

interface DataKeyConfig {
  key: keyof TelemetryPoint;
  name: string;
  color: string;
}

interface ChartLineGraphProps {
  data: TelemetryPoint[];
  dataKeys: DataKeyConfig[];
  unit?: string;
  stepLine?: boolean;
  title?: string;
  syncId?: string;
  zoomState: ZoomState;
  onZoomChange?: (start: number, end: number) => void;
}

export function ChartLineGraph({
  data,
  dataKeys,
  unit = '',
  stepLine = false,
  title,
  zoomState,
  onZoomChange
}: ChartLineGraphProps) {
  const chartData = {
    labels: data.map(point => point.distance),
    datasets: dataKeys.map(config => ({
      label: config.name,
      data: data.map(point => point[config.key] as number),
      borderColor: config.color,
      backgroundColor: config.color,
      borderWidth: 1.5,
      pointRadius: 0,
      tension: stepLine ? 0 : 0.4,
      stepped: stepLine ? true : undefined
    }))
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    scales: {
      x: {
        type: 'linear',
        title: {
          display: true,
          text: 'Distance (m)'
        },
        min: typeof zoomState.left === 'number' ? zoomState.left : parseFloat(zoomState.left),
        max: typeof zoomState.right === 'number' ? zoomState.right : parseFloat(zoomState.right)
      },
      y: {
        title: {
          display: true,
          text: unit
        },
        min: 0,
        max: dataKeys[0].key === 'speed' ? 250 : undefined
      }
    },
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x',
          onZoomComplete: (context: any) => {
            if (onZoomChange) {
              const {min, max} = context.chart.scales.x;
              onZoomChange(min, max);
            }
          }
        },
      },
      title: {
        display: !!title,
        text: title || '',
        position: 'top',
        align: 'start',
        padding: {
          top: 10,
          bottom: 30
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false
      },
      legend: {
        position: 'bottom'
      }
    }
  };

  return (
    <div className="graph-container" style={{ width: '100%', height: '200px', position: 'relative' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

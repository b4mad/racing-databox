import { Line } from 'react-chartjs-2';
import { TelemetryPoint } from '../services/types';
import { ZoomState } from './types';
import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

  const chartData = {
    labels: data
      .filter(point => point.position?.x !== undefined)
      .map(point => point.position!.x),
    datasets: [
      {
        label: 'Track Path',
        data: data
          .filter(point => point.position?.y !== undefined)
          .map(point => point.position!.y),
        borderColor: '#000000',
        backgroundColor: '#550000',
        pointRadius: 0,
        pointHoverRadius: 2,
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear' as const,
        title: {
          display: true,
          text: 'X Position (m)'
        },
        min: mapBounds.minX,
        max: mapBounds.maxX
      },
      y: {
        type: 'linear' as const,
        title: {
          display: true,
          text: 'Y Position (m)'
        },
        min: mapBounds.minY,
        max: mapBounds.maxY
      }
    },
    animation: {
      duration: 0 // Disable animations for better performance
    },
    resizeDelay: 0,
    elements: {
      line: {
        borderWidth: 1 // Thinner lines for better performance
      }
    },
    hover: {
      intersect: false,
      mode: 'nearest'
    },
    plugins: {
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false
      },
      legend: {
        display: true
      }
    }
  };

  return (
    <div className="map-container" style={{ width: '100%', height: '100%' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

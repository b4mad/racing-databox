import { Line } from 'react-chartjs-2';
import { useTheme } from '@mui/material/styles';
import { TelemetryPoint, TelemetryCacheEntry } from '../services/types';
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
  Legend,
  ChartOptions
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

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

interface MapLineProps {
  lapsData: { [lapNumber: number]: TelemetryCacheEntry };
  zoomState: ZoomState;
  onZoomChange?: (start: number, end: number) => void;
}

export function MapLine({ lapsData, zoomState, onZoomChange }: MapLineProps) {
  const handleViewChange = (context: any) => {
    if (onZoomChange) {
      // Find visible points based on current x/y view bounds
      const {min: xMin, max: xMax} = context.chart.scales.x;
      const {min: yMin, max: yMax} = context.chart.scales.y;

      const visiblePoints = Object.values(lapsData).flatMap(lap =>
        lap.points.filter(point =>
          point.position &&
          point.position.x >= xMin &&
          point.position.x <= xMax &&
          point.position.y >= yMin &&
          point.position.y <= yMax
        )
      );

      if (visiblePoints.length > 0) {
        const minDistance = Math.min(...visiblePoints.map(p => p.distance));
        const maxDistance = Math.max(...visiblePoints.map(p => p.distance));
        onZoomChange(minDistance, maxDistance);
      }
    }
  };
  const theme = useTheme();
  // Calculate visible map area based on zoomed data points
  const mapBounds = useMemo(() => {
    const allLapsPoints = Object.values(lapsData).flatMap(lap => lap.points);
    if (allLapsPoints.length === 0) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };

    const minDistance = Number(zoomState.left) || 0;
    const maxDistance = Number(zoomState.right) || allLapsPoints[allLapsPoints.length - 1].distance;

    // Find points within the zoomed distance range
    const visiblePoints = allLapsPoints.filter(point =>
      point.distance >= minDistance &&
      point.distance <= maxDistance &&
      point.position !== undefined
    );

    if (visiblePoints.length === 0) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };

    // Calculate bounds with type-safe position access
    const minX = Math.min(...visiblePoints.map(p => p.position!.x));
    const maxX = Math.max(...visiblePoints.map(p => p.position!.x));
    const minY = Math.min(...visiblePoints.map(p => p.position!.y));
    const maxY = Math.max(...visiblePoints.map(p => p.position!.y));

    // Calculate the range and center
    const xRange = maxX - minX;
    const yRange = maxY - minY;
    const maxRange = Math.max(xRange, yRange);
    const xCenter = (maxX + minX) / 2;
    const yCenter = (maxY + minY) / 2;
    
    // Add equal margins to both axes
    const margin = maxRange * 0.1; // 10% margin
    return {
      minX: xCenter - (maxRange / 2) - margin,
      maxX: xCenter + (maxRange / 2) + margin,
      minY: yCenter - (maxRange / 2) - margin,
      maxY: yCenter + (maxRange / 2) + margin
    };
  }, [lapsData, zoomState.left, zoomState.right]);


  const chartData = {
    datasets: Object.entries(lapsData).map(([lapNumber, lapData]) => ({
      label: `Lap ${lapNumber}`,
      data: lapData.points
        .filter((point: TelemetryPoint) => point.position?.x !== undefined && point.position?.y !== undefined)
        .map((point: TelemetryPoint) => ({
          x: point.position!.x,
          y: point.position!.y
        })),
      borderColor: lapData.color,
      backgroundColor: lapData.color,
      pointRadius: 0,
      pointHoverRadius: 2,
      tension: 0.4,
      showLine: true
    }))
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1,
    scales: {
      x: {
        type: 'linear' as const,
        title: {
          display: false,
          text: 'X Position (m)',
          color: theme.palette.chart?.text
        },
        grid: {
          color: theme.palette.chart?.grid
        },
        ticks: {
          color: theme.palette.chart?.text,
          font: {
            size: 11
          }
        },
        min: mapBounds.minX,
        max: mapBounds.maxX,
        bounds: 'ticks'
      },
      y: {
        type: 'linear' as const,
        title: {
          display: false,
          text: 'Y Position (m)',
          color: theme.palette.chart?.text
        },
        grid: {
          color: theme.palette.chart?.grid
        },
        ticks: {
          color: theme.palette.chart?.text
        },
        min: mapBounds.minY,
        max: mapBounds.maxY,
        bounds: 'ticks'
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
      mode: 'nearest' as const
    },
    plugins: {
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false
      },
      legend: {
        display: false
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: false,
          },
          pinch: {
            enabled: true,
          },
          drag: {
            enabled: true,
          },
          mode: 'xy',
          onZoomComplete: handleViewChange,
        },
        pan: {
          enabled: true,
          mode: 'xy',
          modifierKey: 'shift',
          onPanComplete: handleViewChange
        },
      }
    }
  };

  return (
    <Line data={chartData} options={options} style={{ width: '100%', height: '100%' }} />
  );
}

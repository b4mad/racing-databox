import { Line } from 'react-chartjs-2';
import { useTheme } from '@mui/material/styles';

// Extend Chart.js types
declare module 'chart.js' {
  interface Chart {
    verticalLine: {
      x: number;
      draw: boolean;
    };
  }

  interface PluginOptionsByType<TType> {
    verticalLine?: {
      width?: number;
      color?: string;
      dash?: number[];
    };
  }
}
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  Plugin
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import annotationPlugin from 'chartjs-plugin-annotation';
import { TelemetryPoint, TelemetryCacheEntry, AnalysisData } from '../services/types';
import { ZoomState } from './types';

// Vertical line plugin
// https://stackoverflow.com/questions/70112637/draw-a-horizontal-and-vertical-line-on-mouse-hover-in-chart-js
const verticalLinePlugin: Plugin = {
  id: 'verticalLine',
  defaults: {
    width: 1,
    color: '#FF4949',
    dash: [3, 3],
  },
  afterInit: (chart) => {
    chart.verticalLine = {
      x: 0,
      draw: false
    };
  },
  afterEvent: (chart, args) => {
    const { chartArea, verticalLine } = chart;
    const { event } = args;
    if (!chart.config.options?.plugins?.verticalLine || !chartArea || !event || !event.x || event.x < chartArea.left || event.x > chartArea.right) {
      verticalLine.draw = false;
    } else {
      verticalLine.x = event.x;
      verticalLine.draw = true;
    }
    chart.draw();
  },
  beforeDatasetsDraw: (chart, _args, opts) => {
    const { ctx, chartArea: { top, bottom }, verticalLine } = chart;
    const { x, draw } = verticalLine;

    if (!draw || !opts) return;

    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = opts.width;
    ctx.strokeStyle = opts.color;
    ctx.setLineDash(opts.dash);
    ctx.moveTo(x, bottom);
    ctx.lineTo(x, top);
    ctx.stroke();
    ctx.restore();
  }
};

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin,
  verticalLinePlugin,
  annotationPlugin
);

interface DataKeyConfig {
  key: keyof TelemetryPoint;
  name: string;
  color: string;
}

interface ChartLineGraphProps {
  lapsData: { [lapNumber: number]: TelemetryCacheEntry };
  dataKeys: DataKeyConfig[];
  unit?: string;
  stepLine?: boolean;
  title?: string;
  zoomState: ZoomState;
  onZoomChange?: (start: number, end: number) => void;
  analysisData?: AnalysisData;
  visibleAnnotations: (null|string)[];
}

export function ChartLineGraph({
  lapsData,
  dataKeys,
  unit = '',
  stepLine = false,
  title,
  zoomState,
  onZoomChange,
  analysisData,
  visibleAnnotations
}: ChartLineGraphProps) {
  const theme = useTheme();

  const chartData = {
    datasets: Object.entries(lapsData).flatMap(([lapNumber, lapData]) =>
      dataKeys.map((config) => ({
        label: `${config.name} - Lap ${lapNumber}`,
        data: lapData.points.map(point => ({
          x: point.distance,
          y: point[config.key] as number
        })),
        borderColor: lapData.color,
        backgroundColor: lapData.color,
        borderWidth: 1.5,
        pointRadius: 0,
        tension: stepLine ? 0 : 0.4,
        stepped: stepLine ? true : undefined
      }))
    )
  };

  const options: ChartOptions<'line'> & {plugins: {verticalLine: any}} = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    scales: {
      x: {
        type: 'linear',
        title: {
          display: false,
          text: 'Distance (m)',
          color: theme.palette.chart?.text || theme.palette.text.primary
        },
        grid: {
          color: theme.palette.chart?.grid || theme.palette.divider
        },
        ticks: {
          color: theme.palette.chart?.text,
          font: {
            size: 11
          }
        },
        min: typeof zoomState.left === 'number' ? zoomState.left : parseFloat(zoomState.left || '0'),
        max: typeof zoomState.right === 'number' ? zoomState.right : parseFloat(zoomState.right || '0')
      },
      y: {
        title: {
          display: true,
          text: unit,
          color: theme.palette.chart?.text || theme.palette.text.primary
        },
        grid: {
          color: theme.palette.chart?.grid || theme.palette.divider
        },
        ticks: {
          color: theme.palette.chart?.text
        }
      }
    },
    plugins: {
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
          mode: 'x',
          onZoomComplete: (context: any) => {
            if (onZoomChange) {
              const {min, max} = context.chart.scales.x;
              onZoomChange(min, max);
            }
          }
        },
        pan: {
          enabled: true,
          mode: 'x',
          modifierKey: 'shift', // Require 'Shift' key for drag-to-zoom
          onPanComplete: (context: any) => {
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
        display: false
      },
      verticalLine: {
        color: theme.palette.chart?.grid || theme.palette.divider,
        width: 1,
        dash: [3, 3]
      },
      annotation: {
        annotations: {
          ...Object.fromEntries(
            (visibleAnnotations.includes('segments') ? (analysisData?.landmarks?.segments || []) : []).map((segment, index) => {
              const xScale = (zoomState.right !== undefined && zoomState.right !== null &&
                            zoomState.left !== undefined && zoomState.left !== null) ?
                Math.abs(zoomState.right - zoomState.left) :
                0;

              const showLabel = xScale < 750;

              return [`segment${index}`, {
                type: 'line' as const,
                scaleID: 'x',
                borderColor: theme.palette.chart?.segment || theme.palette.primary.main,
                borderWidth: 2,
                borderDash: [5, 3],
                value: segment.start,
                label: {
                  display: showLabel,
                  content: segment.name,
                  position: 'start',
                  backgroundColor: theme.palette.chart?.labelBackground,
                  color: theme.palette.chart?.labelText,
                  font: {
                    size: 9
                  },
                  rotation: 0,
                  yAdjust: 0
                }
              }];
            })
          ),
          ...Object.fromEntries(
            (visibleAnnotations.includes('turns') ? (analysisData?.landmarks?.turns || []) : []).map((turn, index) => {
              const xScale = (zoomState.right !== undefined && zoomState.right !== null &&
                            zoomState.left !== undefined && zoomState.left !== null) ?
                Math.abs(zoomState.right - zoomState.left) :
                0;

              const showLabel = xScale < 750;

              return [`turn${index}`, {
                type: 'label' as const,
                borderColor: theme.palette.chart?.segment || theme.palette.primary.main,
                borderRadius: 4,
                borderWidth: 1,
                backgroundColor: theme.palette.chart?.labelBackground,
                content: turn.name,
                position: {
                  x: 'center',
                  y: 'end'
                } as const,
                xValue: turn.start,
                yAdjust: -10,
                display: showLabel,
                font: {
                  size: 9
                },
                color: theme.palette.chart?.labelText
              }];
            })
          )
        }
      }
    }
  };

  return (
    <div className="graph-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

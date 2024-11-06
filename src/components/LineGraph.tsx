import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Brush } from 'recharts';
import { TelemetryPoint } from '../services/types';
import { Button, Stack } from '@mui/material';

interface DataKeyConfig {
  key: keyof TelemetryPoint;
  name: string;
  color: string;
}

interface LineGraphProps {
  data: TelemetryPoint[];
  dataKeys: DataKeyConfig[];
  unit?: string;
  stepLine?: boolean;
  title?: string;
  syncId?: string;
  showBrush?: boolean;
}

interface CurrentValueDisplayProps {
  value: number;
  label: string;
  unit: string;
}

function CurrentValueDisplay({ value, label, unit }: CurrentValueDisplayProps) {
  return (
    <div style={{
      position: 'absolute',
      right: 20,
      top: 10,
      fontSize: '0.8em'
    }}>
      {label}: <span style={{ borderBottom: '2px solid #2196f3' }}>{value}{unit}</span>
    </div>
  );
}

export function SpeedGraph({ currentLapData, syncId }: { currentLapData: TelemetryPoint[], syncId?: string }) {
  return (
    <LineGraph
      data={currentLapData}
      dataKeys={[
        { key: "speed", name: "Speed", color: "#2196f3" }
      ]}
      unit=" km/h"
      // title="Speed in kph"
      syncId={syncId}
    />
  );
}

export function PedalsGraph({ currentLapData, syncId }: { currentLapData: TelemetryPoint[], syncId?: string }) {
  return (
    <LineGraph
      data={currentLapData}
      dataKeys={[
        { key: "throttle", name: "Throttle", color: "#4caf50" },
        { key: "brake", name: "Brake", color: "#f44336" },
        { key: "handbrake", name: "Handbrake", color: "#ff9800" }
      ]}
      unit="%"
      syncId={syncId}
    />
  );
}

export function GearGraph({ currentLapData, syncId, showBrush }: { currentLapData: TelemetryPoint[], syncId?: string, showBrush?: boolean }) {
  return (
    <LineGraph
      data={currentLapData}
      dataKeys={[
        { key: "gear", name: "Gear", color: "#9c27b0" }
      ]}
      unit=""
      stepLine
      syncId={syncId}
      showBrush={showBrush}
    />
  );
}

export function LineGraph({ data, dataKeys, unit = '', stepLine = false, title, syncId, showBrush }: LineGraphProps) {
  const currentValue = data.length > 0 ? data[data.length - 1][dataKeys[0].key] : 0;
  const distance = data.length > 0 ? Math.round(data[data.length - 1].distance) : 0;

  const [zoomState, setZoomState] = useState({
    left: 0,
    right: data.length > 0 ? data[data.length - 1].distance : 0,
    top: 'dataMax+1',
    bottom: 'dataMin-1'
  });

  const zoomOut = () => {
    if (data.length === 0) return;
    setZoomState({
      ...zoomState,
      left: 0,
      right: data[data.length - 1].distance
    });
  };

  const zoomToFirstThird = () => {
    if (data.length === 0) return;
    const maxDistance = data[data.length - 1].distance;
    setZoomState({
      ...zoomState,
      left: 0,
      right: maxDistance / 3
    });
  };

  const zoomToMiddleThird = () => {
    if (data.length === 0) return;
    const maxDistance = data[data.length - 1].distance;
    setZoomState({
      ...zoomState,
      left: maxDistance / 3,
      right: (maxDistance * 2) / 3
    });
  };

  const zoomToLastThird = () => {
    if (data.length === 0) return;
    const maxDistance = data[data.length - 1].distance;
    setZoomState({
      ...zoomState,
      left: (maxDistance * 2) / 3,
      right: maxDistance
    });
  };

  return (
    <div className="graph-container" style={{ width: '100%', height: '200px', position: 'relative' }}>
      {title && <div style={{ position: 'absolute', left: 20, top: 10, fontSize: '1em' }}>{title}</div>}
      {/* <div style={{ position: 'absolute', left: '50%', top: 10, transform: 'translateX(-50%)', fontSize: '1em' }}>
        {distance}m
      </div> */}
      {/* <CurrentValueDisplay
        value={currentValue as number}
        label={dataKeys[0].name}
        unit={unit}
      /> */}
      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
        <Button size="small" variant="outlined" onClick={zoomOut}>Full Track</Button>
        <Button size="small" variant="outlined" onClick={zoomToFirstThird}>First Third</Button>
        <Button size="small" variant="outlined" onClick={zoomToMiddleThird}>Middle Third</Button>
        <Button size="small" variant="outlined" onClick={zoomToLastThird}>Last Third</Button>
      </Stack>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart
          data={data}
          margin={{ top: 40, right: 20, bottom: 5, left: 20 }}
          syncId={syncId}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e0e0e0"
            strokeOpacity={0.5}
          />
          <XAxis
            dataKey="distance" 
            name="Distance"
            unit="m"
            domain={[zoomState.left, zoomState.right]}
            type="number"
            allowDataOverflow
          />
          <YAxis
            unit={unit}
            domain={[0, dataKeys[0].key === 'speed' ? 250 : 'auto']}
            allowDataOverflow={true}
          />
          <Tooltip
            cursor={{ stroke: 'red', strokeWidth: 1 }}
            content={() => null}
            position={{ x: 0, y: 0 }}
          />
          <Legend />
          {dataKeys.map((config) => (
            <Line
              key={config.key}
              type={stepLine ? "stepAfter" : "monotone"}
              dataKey={config.key}
              stroke={config.color}
              strokeWidth={1.5}
              name={config.name}
              dot={false}
              isAnimationActive={false}
            />
          ))}
          {showBrush && <Brush dataKey="distance" height={30} stroke="#8884d8" />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

import { Box } from '@mui/material';
import { AnalysisToolbar } from './AnalysisToolbar';
import { LapSelectionPanel } from './LapSelectionPanel';
import { GapsAnalysisTable } from './GapsAnalysisTable';
import { TrackMapVisualization } from './TrackMapVisualization';
import { DeltaTimeGraph } from './DeltaTimeGraph';
import { SectorVisualization } from './SectorVisualization';
import { TelemetryGraphs } from './TelemetryGraphs';
import { AnalysisData, TelemetryCacheEntry } from '../../services/types';
import { ZoomState } from '../../components/types'

interface AnalysisLayoutProps {
  analysisData?: AnalysisData;
  lapsData: { [lapId: number]: TelemetryCacheEntry };
  onLapSelect: (lapId: number) => void;
  zoomState: ZoomState;
  setZoomRange: (startMeters: number, endMeters: number) => void;
}

export function AnalysisLayout({ analysisData, lapsData, onLapSelect, zoomState, setZoomRange }: AnalysisLayoutProps) {
  const mapDataAvailable = Object.keys(lapsData).length > 0 &&
    lapsData[parseInt(Object.keys(lapsData)[0])].mapDataAvailable;

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
        <AnalysisToolbar
          analysisData={analysisData}
          onLapSelect={onLapSelect}
        />
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Panel */}
        <Box sx={{ width: '300px', borderRight: 1, borderColor: 'divider', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: '0 0 auto' }}>
            <LapSelectionPanel analysisData={analysisData} />
          </Box>
          <Box sx={{ flex: 1, mt: 2 }}>
            <GapsAnalysisTable />
          </Box>
        </Box>

        {/* Main Content Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Delta Time Graph at Top */}
          <Box sx={{ height: '200px', p: 1, borderBottom: 1, borderColor: 'divider' }}>
            <DeltaTimeGraph />
          </Box>

          {/* Lower Content Area */}
          <Box sx={{ flex: 1, display: 'flex' }}>
            {/* Track Map */}
            {mapDataAvailable && (
              <Box sx={{ flex: 1, p: 1 }}>
                <TrackMapVisualization
                  lapsData={lapsData}
                  zoomState={zoomState}
                />
              </Box>
            )}

            {/* Telemetry Graphs */}
            <Box sx={{
              flex: 1,
              p: 1,
              ...(mapDataAvailable && {
                width: '400px',
                borderLeft: 1,
                borderColor: 'divider',
                overflow: 'auto'
              })
            }}>
              <TelemetryGraphs
                lapsData={lapsData}
                zoomState={zoomState}
                setZoomRange={setZoomRange}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Bottom Panel - Full Width */}
      <Box sx={{ height: '50px', borderTop: 1, borderColor: 'divider', p: 1 }}>
        <SectorVisualization />
      </Box>
    </Box>
  );
}
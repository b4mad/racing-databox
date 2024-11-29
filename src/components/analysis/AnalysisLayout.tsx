import { Box, Drawer, IconButton, Typography } from '@mui/material';
import { useAnalysisContext } from '../../contexts/AnalysisContext';
import { useQueryParam, BooleanParam } from 'use-query-params';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TimelineIcon from '@mui/icons-material/Timeline';
import CompareIcon from '@mui/icons-material/Compare';
import { useState } from 'react';
import { LapsModal } from './LapsModal';
import { AnalysisToolbar } from './AnalysisToolbar';
import { LapSelectionPanel } from './LapSelectionPanel';
import { GapsAnalysisTable } from './GapsAnalysisTable';
import { TrackMapVisualization } from './TrackMapVisualization';
import { SectorVisualization } from './SectorVisualization';
import { TelemetryGraphs } from './TelemetryGraphs';

export function AnalysisLayout() {
  const { analysisData, lapsData, handleLapSelect } = useAnalysisContext();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [isLapsModalOpen, setIsLapsModalOpen] = useState(false);
  const [showTurns, setShowTurns] = useQueryParam('showTurns', BooleanParam);
  const [showSegments, setShowSegments] = useQueryParam('showSegments', BooleanParam);
  const mapDataAvailable = Object.keys(lapsData).length > 0 &&
    lapsData[parseInt(Object.keys(lapsData)[0])].mapDataAvailable;

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
        <AnalysisToolbar
          analysisData={analysisData}
          showTurns={showTurns ?? true}
          showSegments={showSegments ?? true}
          onToggleTurns={(show) => setShowTurns(show)}
          onToggleSegments={(show) => setShowSegments(show)}
        />
      </Box>
      {analysisData && (
        <LapsModal
          open={isLapsModalOpen}
          onClose={() => setIsLapsModalOpen(false)}
          analysisData={analysisData}
          onLapSelect={handleLapSelect}
        />
      )}

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left Panel Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerOpen ? 300 : 57,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerOpen ? 300 : 57,
              position: 'relative',
              height: '100%',
              border: 'none',
              borderRight: 1,
              borderColor: 'divider',
              overflowX: 'hidden',
              transition: theme => theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
              <IconButton
                onClick={() => setDrawerOpen(!drawerOpen)}
                size="small"
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  },
                  color: 'white',
                }}
              >
                {drawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
              </IconButton>
            </Box>

            {drawerOpen ? (
              <>
                <Box sx={{ flex: '0 0 auto' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
                    <Typography variant="subtitle1">Available Laps</Typography>
                    <IconButton
                      aria-label="modify laps"
                      size="small"
                      onClick={() => setIsLapsModalOpen(true)}
                    >
                      <TimelineIcon />
                    </IconButton>
                  </Box>
                  <LapSelectionPanel />
                </Box>
                {Object.keys(lapsData).length > 1 && (
                  <Box sx={{ flex: 1, mt: 2 }}>
                    <GapsAnalysisTable />
                  </Box>
                )}
              </>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 2, gap: 1 }}>
                <IconButton
                  size="small"
                  sx={{
                    color: 'primary.main',
                    '&:hover': { backgroundColor: 'action.hover' },
                  }}
                  title="Lap Selection"
                  onClick={() => setIsLapsModalOpen(true)}
                >
                  <TimelineIcon />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{
                    color: 'primary.main',
                    '&:hover': { backgroundColor: 'action.hover' },
                  }}
                  title="Gaps Analysis"
                >
                  <CompareIcon />
                </IconButton>
              </Box>
            )}
          </Box>
        </Drawer>

        {/* Main Content Area */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          ml: 0
        }}>

          {/* Lower Content Area */}
          <Box sx={{ flex: 1, display: 'flex', minHeight: 0 }}>
            {/* Track Map */}
            {mapDataAvailable && (
              <Box sx={{
                flex: 1,
                p: 1,
                display: 'flex',
                width: '50%',
                }}>
                <TrackMapVisualization />
              </Box>
            )}

            {/* Telemetry Graphs */}
            <Box sx={{
              flex: 1,
              p: 1,
              display: 'flex',
              ...(mapDataAvailable && {
                width: '50%',
                borderLeft: 1,
                borderColor: 'divider'
              })
            }}>
              <TelemetryGraphs 
                showTurns={showTurns ?? true}
                showSegments={showSegments ?? true}
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

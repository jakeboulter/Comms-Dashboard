import React from 'react';
import './PingBlock.css';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CircleIcon from '@mui/icons-material/Circle';

import SwitchPortIcon from './SwitchPortIcon';
import Box from '@mui/material/Box';

interface PingBlockProps {
  name: string;
  ip: string;
  online: boolean | null;
  pingHistory: boolean[];
  onDelete: () => void;
  barHeight?: number;
  barCount?: number;
  barOnlineColor?: string;
  barOfflineColor?: string;
  style?: React.CSSProperties;
  className?: string;
  deleteButtonClassName?: string;
  deleteButtonTitle?: string;
  ports?: Array<{ port: number; status: 'Up' | 'Down'; speed: string; groupName?: string }>;
  ipAfterName?: boolean;
  blockType?: 'switch' | 'panel';
  panelType?: string;
  onPanelTypeChange?: (type: string) => void;
  editablePanelType?: boolean;
}

export default function PingBlock({
  name,
  ip,
  online,
  pingHistory,
  onDelete,
  barHeight = 12,
  barCount = 60,
  barOnlineColor = '#4caf50',
  barOfflineColor = '#888',
  style = {},
  className = '',
  deleteButtonClassName = '',
  deleteButtonTitle = 'Delete',
  ports,
  ipAfterName = false,
  blockType = 'panel',
  panelType,
  onPanelTypeChange,
  editablePanelType,
}: PingBlockProps) {
  // Always show the most recent barCount values, sampling evenly if needed
  let bars: boolean[] = [];
  if (pingHistory.length > barCount) {
    // Take the last barCount values, sample evenly if needed
    const start = pingHistory.length - barCount;
    const recent = pingHistory.slice(start);
    if (recent.length > barCount) {
      // Downsample evenly
      bars = Array.from({ length: barCount }, (_, i) => {
        const idx = Math.floor(i * recent.length / barCount);
        return recent[idx];
      });
    } else {
      bars = recent;
    }
  } else {
    bars = pingHistory;
  }
  return (
    <Paper
      elevation={2}
      className={className + ' pingblock-hover-parent'}
      sx={{
        p: 2,
        background: '#1B1F22',
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 0.5,
        position: 'relative',
        ...(blockType === 'panel' ? {
          minWidth: 240,
          maxWidth: 240,
          width: 240,
        } : {}),
        ...style,
      }}
    >
      <IconButton
        size="small"
        onClick={onDelete}
        className={deleteButtonClassName + ' pingblock-delete-btn'}
        sx={{
          position: 'absolute',
          top: 4,
          right: 4,
          color: '#f44336',
          background: 'rgba(0,0,0,0.15)',
          opacity: 0,
          transition: 'opacity 0.2s',
          zIndex: 2,
          '&:hover': { background: 'rgba(244,67,54,0.15)' },
        }}
        title={deleteButtonTitle}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', gap: 1 }}>
        {name}
        <CircleIcon
          sx={{
            color: online === true ? barOnlineColor : barOfflineColor,
            fontSize: 16,
            ml: 1,
            verticalAlign: 'middle',
          }}
          titleAccess={online === true ? 'Online' : 'Offline'}
        />
        {/* Headset SVG icon only for panels */}
        {blockType !== 'switch' && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ marginLeft: 4, color: online === true ? (barOnlineColor || '#4caf50') : (barOfflineColor || '#888'), verticalAlign: 'middle' }}
            aria-label="Panel"
          >
            <path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z"/>
            <path d="M21 16v2a4 4 0 0 1-4 4h-5"/>
          </svg>
        )}
      </Typography>
      {/* Switch IP in top right if blockType is switch */}
      {blockType === 'switch' && ip && (
        <span style={{
          position: 'absolute',
          top: 10,
          right: 16,
          color: '#aaa',
          fontWeight: 400,
          fontSize: 15,
          zIndex: 1,
          pointerEvents: 'none',
        }}>{ip}</span>
      )}
      {/* Panel IP below name as before */}
      {blockType !== 'switch' && !ipAfterName && ip && (
        <>
          <Typography variant="body2" sx={{ color: '#aaa', mb: 0.5, lineHeight: 1.3, fontSize: 15 }}>
            <span style={{ color: '#aaa', fontWeight: 500, fontSize: 14, marginRight: 4 }}>IP:</span>
            <span style={{ fontWeight: 400, fontSize: 15 }}>{ip}</span>
          </Typography>
          {/* Panel Type editable field */}
          <div style={{ marginBottom: 0 }}>
            <span style={{ color: '#aaa', fontWeight: 500, fontSize: 14 }}>Panel Type: </span>
            {typeof onPanelTypeChange === 'function' && editablePanelType ? (
              <input
                type="text"
                value={panelType || ''}
                onChange={e => onPanelTypeChange(e.target.value)}
                style={{
                  background: 'transparent',
                  border: '1px solid #444',
                  color: '#fff',
                  fontSize: 14,
                  borderRadius: 3,
                  padding: '2px 6px',
                  marginLeft: 4,
                  width: 90,
                }}
                placeholder="Type..."
              />
            ) : (
              <span style={{ color: '#aaa', marginLeft: 4, fontSize: 15 }}>{panelType || <span style={{ color: '#888', fontSize: 15 }}>—</span>}</span>
            )}
          </div>
        </>
      )}
      {/* If ports prop is present, render port grid instead of bar chart */}
      {Array.isArray(ports) && ports.length > 0 ? (
        (() => {
          // Split ports into odd and even
          const oddPorts = ports.filter(p => p.port % 2 === 1).sort((a, b) => a.port - b.port);
          const evenPorts = ports.filter(p => p.port % 2 === 0).sort((a, b) => a.port - b.port);

          // Helper to insert a spacer after a given port number, and render each port inside a grid cell
          function renderPortRowGrid(rowPorts: typeof ports | undefined, totalPorts: number, rowType: 'odd' | 'even') {
            const portsArr = rowPorts || [];
            const is26 = totalPorts === 26;
            const is14 = totalPorts === 14;
            const row = [];
            for (let i = 0; i < portsArr.length; ++i) {
              const port = portsArr[i];
              row.push(
                <span key={port.port} style={{
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 48,
                  height: 140,
                  margin: '0 2px',
                  position: 'relative',
                }}>
                  {/* Odd port: number above, even port: number below */}
                  {rowType === 'odd' && (
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: 15, marginBottom: 2, height: 18, lineHeight: '18px', letterSpacing: 0.5 }}>{port.port}</span>
                  )}
                  {/* Grid box with icon and speed inside */}
                  <span style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 88,
                    border: '1.5px solid #333',
                    borderRadius: 7,
                    background: 'rgba(40,44,50,0.15)',
                    boxSizing: 'border-box',
                  }}>
                    <SwitchPortIcon port={port.port} status={port.status} speed={port.speed} groupName={port.groupName} showPortNumber={false} showSpeed={true} />
                  </span>
                  {rowType === 'even' && (
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: 15, marginTop: 2, height: 18, lineHeight: '18px', letterSpacing: 0.5 }}>{port.port}</span>
                  )}
                </span>
              );
              // For 26-port: add space after 21 (odd row) and after 22 (even row), and before last 4 ports (23-26)
              // For 14-port: add space after 11 (odd row) and after 12 (even row), and before last 2 ports (13-14)
              if (is26) {
                if ((rowType === 'odd' && port.port === 21) || (rowType === 'even' && port.port === 22)) {
                  row.push(<span key={"spacer-22-"+rowType} style={{ display: 'inline-block', width: 24 }} />);
                }
              } else if (is14) {
                if ((rowType === 'odd' && port.port === 11) || (rowType === 'even' && port.port === 12)) {
                  row.push(<span key={"spacer-12-"+rowType} style={{ display: 'inline-block', width: 24 }} />);
                }
              }
            }
            return row;
          }

          // Determine total number of ports for this switch
          const totalPorts = ports.length;
          // Render each port inside a grid cell, so the icon sits perfectly in the box
          return (
            <Box sx={{ width: '100%', mt: 1, px: 1, minHeight: 120 }}>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-start', width: '100%', mb: 0 }}>
                {renderPortRowGrid(oddPorts, totalPorts, 'odd')}
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', width: '100%', mt: 0 }}>
                {renderPortRowGrid(evenPorts, totalPorts, 'even')}
              </Box>
            </Box>
          );
        })()
      ) : (
        // Otherwise, show the ping bar chart (for panels, etc)
        ip && (
          <div style={{ width: '100%', minHeight: 28, marginTop: 0, marginBottom: 0, paddingTop: 0, display: 'flex', alignItems: 'flex-end', gap: 1, height: 28 }}>
            {bars.length > 0 ? bars.map((v, i) => (
              <div
                key={i}
                style={{
                  width: 3,
                  height: v ? barHeight : barHeight * 0.67,
                  background: v ? barOnlineColor : barOfflineColor,
                  borderRadius: 2,
                  opacity: v ? 1 : 0.5,
                  transition: 'background 0.2s',
                }}
                title={v ? 'Online' : 'Offline'}
              />
            )) : (
              <div style={{ color: '#aaa', fontSize: 12 }}>No ping data</div>
            )}
          </div>
        )
      )}
    </Paper>
  );
}

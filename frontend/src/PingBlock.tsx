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
        p: blockType === 'switch' ? 2.5 : 2,
        background: blockType === 'switch' ? '#1B1F22' : '#1B1F22',
        borderRadius: blockType === 'switch' ? 3 : 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: blockType === 'switch' ? 1 : 1.5,
        position: 'relative',
        minWidth: blockType === 'switch' ? undefined : 240,
        maxWidth: blockType === 'switch' ? undefined : 240,
        width: blockType === 'switch' ? undefined : 240,
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
        <Typography variant="body2" sx={{ color: '#aaa', mb: 0, lineHeight: 1.1, pb: 0 }}>
          <span style={{ fontWeight: 400, fontSize: 15 }}>{ip}</span>
        </Typography>
      )}
      {/* If ports prop is present, render port grid instead of bar chart */}
      {Array.isArray(ports) && ports.length > 0 ? (
        (() => {
          // Split ports into odd and even
          const oddPorts = ports.filter(p => p.port % 2 === 1);
          const evenPorts = ports.filter(p => p.port % 2 === 0);
          // Sort by port number
          oddPorts.sort((a, b) => a.port - b.port);
          evenPorts.sort((a, b) => a.port - b.port);
          // Use space-between and fixed width for even spacing
          return (
            <Box sx={{ width: '100%', mt: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' }}>
                {oddPorts.map((port) => (
                  <SwitchPortIcon key={port.port} port={port.port} status={port.status} speed={port.speed} groupName={port.groupName} />
                ))}
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', mt: 2.5 }}>
                {evenPorts.map((port) => (
                  <SwitchPortIcon key={port.port} port={port.port} status={port.status} speed={port.speed} groupName={port.groupName} />
                ))}
              </Box>
            </Box>
          );
        })()
      ) : (
        // Otherwise, show the ping bar chart (for panels, etc)
        ip && (
          <div style={{ width: '100%', minHeight: 28, marginTop: 0, marginBottom: 0, display: 'flex', alignItems: 'flex-end', gap: 1, height: 28 }}>
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

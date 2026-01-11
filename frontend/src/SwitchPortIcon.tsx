import React from 'react';
// Inline Ethernet port SVG icon
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';

interface SwitchPortIconProps {
  port: number;
  status: 'Up' | 'Down';
  speed: string;
  groupName?: string;
}

export default function SwitchPortIcon({ port, status, speed, groupName }: SwitchPortIconProps) {
  const color = status === 'Up' ? '#4caf50' : '#888';
  const textColor = status === 'Up' ? '#fff' : '#aaa';
  const tooltip = groupName ? groupName : '';
  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: 48,
        height: 80,
        margin: '0 2px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', height: 44 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: textColor, mb: 0.2, textAlign: 'center', width: '100%' }}>{port}</Typography>
        <span title={status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 20 3-3h2a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2l3 3z"/>
            <path d="M6 8v1"/>
            <path d="M10 8v1"/>
            <path d="M14 8v1"/>
            <path d="M18 8v1"/>
          </svg>
        </span>
      </div>
      <Typography variant="caption" sx={{ color: textColor, fontSize: 12, mt: 0.3, textAlign: 'center', width: '100%' }}>{speed}</Typography>
    </div>
  );
  return groupName ? (
    <Tooltip title={tooltip} arrow placement="top">
      <span>{content}</span>
    </Tooltip>
  ) : content;
}

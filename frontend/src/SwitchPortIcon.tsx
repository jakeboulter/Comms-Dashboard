import React from 'react';
// Inline Ethernet port SVG icon
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';

interface SwitchPortIconProps {
  port: number;
  status: 'Up' | 'Down';
  speed: string;
  groupName?: string;
  showPortNumber?: boolean;
  showSpeed?: boolean;
}

export default function SwitchPortIcon({ port, status, speed, groupName, showPortNumber = true, showSpeed = true }: SwitchPortIconProps) {
  const color = status === 'Up' ? '#4caf50' : '#888';
  const textColor = status === 'Up' ? '#fff' : '#aaa';
  const tooltip = groupName ? groupName : '';
  // Split speed into lines (e.g. '1Gfdx\nFiber')
  const speedLines = (showSpeed && speed) ? String(speed).split(/\r?\n|<br\s*\/?\s*>|\s*\b(Fiber)\b\s*/).filter(Boolean) : [];
  // If 'Fiber' is present, keep it as a separate line
  if (showSpeed && speed && /Fiber/.test(speed) && !speedLines.includes('Fiber')) speedLines.push('Fiber');
  const icon = (
    <span title={status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 2 }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15 20 3-3h2a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2l3 3z"/>
        <path d="M6 8v1"/>
        <path d="M10 8v1"/>
        <path d="M14 8v1"/>
        <path d="M18 8v1"/>
      </svg>
    </span>
  );
  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', height: '100%', width: '100%' }}>
      {showPortNumber && (
        <Typography variant="caption" sx={{ fontWeight: 700, color: textColor, mb: 0.2, textAlign: 'center', width: '100%' }}>{port}</Typography>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', height: 44, width: '100%' }}>
        {icon}
        {showSpeed && speedLines.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', width: '100%' }}>
            {speedLines.map((line, idx) => (
              <Typography key={idx} variant="caption" sx={{ color: textColor, fontSize: 13, fontWeight: 500, lineHeight: 1.1, textAlign: 'center', width: '100%', minHeight: 16 }}>{line}</Typography>
            ))}
          </div>
        )}
      </div>
    </div>
  );
  return groupName ? (
    <Tooltip title={tooltip} arrow placement="top">
      <span>{content}</span>
    </Tooltip>
  ) : content;
}

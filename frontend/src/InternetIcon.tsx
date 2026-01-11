import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import React from 'react';

export default function InternetIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <ellipse cx="12" cy="12" rx="4" ry="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M2 12h20" stroke="currentColor" strokeWidth="2" />
      <path d="M12 2a10 10 0 0 1 0 20" stroke="currentColor" strokeWidth="2" fill="none" />
    </SvgIcon>
  );
}

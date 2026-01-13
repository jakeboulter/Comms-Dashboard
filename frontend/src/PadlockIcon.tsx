import React from 'react';
import SvgIcon from '@mui/material/SvgIcon';

export function PadlockClosedIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </SvgIcon>
  );
}

export function PadlockOpenIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </SvgIcon>
  );
}

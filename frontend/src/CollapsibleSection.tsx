import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface CollapsibleSectionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  sx?: object;
  headerSx?: object;
  contentSx?: object;
}

export default function CollapsibleSection({
  title,
  children,
  defaultCollapsed = false,
  sx = {},
  headerSx = {},
  contentSx = {},
}: CollapsibleSectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  return (
    <Box sx={{ ...sx }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, ...headerSx }}>
        <IconButton
          size="small"
          onClick={() => setCollapsed(c => !c)}
          sx={{ mr: 1 }}
          aria-label={collapsed ? 'Expand section' : 'Collapse section'}
        >
          {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700, fontSize: 24, fontFamily: 'Roboto, Helvetica, Arial, sans-serif', ...headerSx }}>
          {title}
        </Typography>
      </Box>
      {!collapsed && <Box sx={{ ...contentSx }}>{children}</Box>}
    </Box>
  );
}

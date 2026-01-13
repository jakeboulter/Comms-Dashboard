// ...existing imports...
// ...existing imports...

// Add a new location
function handleAddLocation(name: string, panelLocations: any[], setPanelLocations: any, setPanelOrder: any) {
  const id = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
  const newLocations = [...panelLocations, { id, name, order: panelLocations.length }];
  setPanelLocations(newLocations);
  try { localStorage.setItem('intercomPanelLocations', JSON.stringify(newLocations)); } catch {}
  // Initialize order for new location
  setPanelOrder((prev: any) => {
    const updated = { ...prev, [id]: [] };
    try { localStorage.setItem('intercomPanelOrder', JSON.stringify(updated)); } catch {}
    return updated;
  });
}

// Rename a location
function handleRenameLocation(id: string, newName: string, panelLocations: any[], setPanelLocations: any) {
  const newLocations = panelLocations.map((loc: any) => loc.id === id ? { ...loc, name: newName } : loc);
  setPanelLocations(newLocations);
  try { localStorage.setItem('intercomPanelLocations', JSON.stringify(newLocations)); } catch {}
}

// Delete a location and reassign panels to default
function handleDeleteLocation(id: string, panelLocations: any[], setPanelLocations: any, setPanelOrder: any, setPanels: any) {
  const newLocations = panelLocations.filter((loc: any) => loc.id !== id);
  setPanelLocations(newLocations);
  try { localStorage.setItem('intercomPanelLocations', JSON.stringify(newLocations)); } catch {}
  // Remove order for location
  setPanelOrder((prev: any) => {
    const updated = { ...prev };
    delete updated[id];
    try { localStorage.setItem('intercomPanelOrder', JSON.stringify(updated)); } catch {}
    return updated;
  });
  // Reassign panels to default location
  setPanels((prev: any) => {
    const updated = prev.map((p: any) => p.locationId === id ? { ...p, locationId: 'default' } : p);
    try { localStorage.setItem('intercomPanels', JSON.stringify(updated)); } catch {}
    return updated;
  });
}
import { fetchSwitchPorts, SwitchPort } from './switchPortUtils';
import { fetchSwitchGroups, SwitchGroup } from './switchGroupUtils';
import CollapsibleSection from './CollapsibleSection';
import PingBlock from './PingBlock';
import SwitchPortIcon from './SwitchPortIcon';
import PTPLockedIcon from './PTPLockedIcon';
import PTPMasterIcon from './PTPMasterIcon';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import RadioIcon from './RadioIcon';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Types for react-beautiful-dnd
type DropResult = {
  destination?: { droppableId: string; index: number };
  source: { droppableId: string; index: number };
  draggableId: string;
  type: string;
};
type DroppableProvided = {
  innerRef: (element: HTMLElement | null) => any;
  droppableProps: any;
  placeholder?: React.ReactNode;
};
type DraggableProvided = {
  innerRef: (element: HTMLElement | null) => any;
  draggableProps: any;
  dragHandleProps: any;
};
type DraggableStateSnapshot = {
  isDragging: boolean;
};

import { io } from 'socket.io-client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import CTLogo from './CTLogo';
import InternetIcon from './InternetIcon';
import { PadlockClosedIcon, PadlockOpenIcon } from './PadlockIcon';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import CircleIcon from '@mui/icons-material/Circle';
import LinearProgress from '@mui/material/LinearProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import HeadsetIcon from '@mui/icons-material/Headset';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import BluetoothAudioIcon from '@mui/icons-material/BluetoothAudio';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#181C1F',
      paper: '#23272B',
    },
    primary: { main: '#2196f3' },
    secondary: { main: '#f50057' },
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
  },
});

const columns: GridColDef[] = [
  {
    field: 'status',
    headerName: 'Status',
    flex: 0.7,
    minWidth: 90,
    sortable: false,
    renderCell: (params) => (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <CircleIcon sx={{ color: params.value === 'online' ? '#4caf50' : '#888', fontSize: 18 }} />
      </div>
    ),
    align: 'center',
    headerAlign: 'center',
  },
  { field: 'id', headerName: 'BP ID', flex: 1, minWidth: 90, headerAlign: 'center', align: 'center' },
  { field: 'bpName', headerName: 'Name', flex: 1.5, minWidth: 140, headerAlign: 'center', align: 'center' },
  {
    field: 'battery',
    headerName: 'Battery',
    flex: 1.5,
    minWidth: 140,
    sortable: false,
    renderCell: (params) => {
      const value = params.value;
      let color = '#4caf50';
      if (typeof value === 'number') {
        if (value < 20) color = '#e53935';
        else if (value < 50) color = '#ff9800';
      } else {
        return <span>-</span>;
      }
      return (
        <div
          style={{
            width: '100%',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            minHeight: 32,
            paddingTop: 2,
            paddingBottom: 2,
          }}
        >
          <LinearProgress
            variant="determinate"
            value={value}
            sx={{
              height: 18,
              borderRadius: 6,
              flex: 1,
              background: '#333',
              alignSelf: 'center',
              '& .MuiLinearProgress-bar': { backgroundColor: color },
            }}
          />
          <span
            style={{
              position: 'absolute',
              left: 0,
              width: '100%',
              textAlign: 'center',
              color: value < 20 ? '#fff' : '#222',
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: 0.5,
              userSelect: 'none',
              top: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {value}%
          </span>
        </div>
      );
    },
    align: 'center',
    headerAlign: 'center',
  },
  { field: 'antenna', headerName: 'Antenna', flex: 1.2, minWidth: 140, headerAlign: 'center', align: 'center' },
  {
    field: 'signal',
    headerName: 'Signal',
    flex: 1,
    minWidth: 90,
    sortable: false,
    renderCell: (params) => {
      const value = params.value;
      if (value === '-' || value === undefined || value === null) return <span style={{ color: '#888' }}>—</span>;
      let bars = 0;
      if (value <= 0) bars = 4;
      else if (value <= 1) bars = 3;
      else if (value <= 2) bars = 2;
      else if (value <= 3) bars = 1;
      else bars = 0;
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            gap: 2,
            margin: '0 auto',
          }}
        >
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              style={{
                width: 7,
                height: 8 + i * 4,
                borderRadius: 2,
                background: i < bars ? '#fff' : '#444',
                opacity: i < bars ? 1 : 0.4,
                transition: 'background 0.2s',
                marginTop: 12 - i * 4,
                boxShadow: i < bars ? '0 0 2px #fff8' : undefined,
                display: 'flex',
                alignItems: 'flex-end',
              }}
            />
          ))}
        </div>
      );
    },
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'audio',
    headerName: 'Audio',
    flex: 1,
    minWidth: 90,
    sortable: false,
    renderCell: (params) => {
      const { mode, headsetVolume, speakerVolume, sidetoneVolume, micGain, internalMicGain, bluetoothMicGain } = params.row;
      let tooltip = '';
      if (mode === 'headset') {
        tooltip = `Headset Volume: ${headsetVolume ?? '-'}\nSidetone: ${sidetoneVolume ?? '-'}\nMic Gain: ${micGain ?? '-'}`;
      } else if (mode === 'bluetooth') {
        tooltip = `Headset Volume: ${headsetVolume ?? '-'}\nSidetone: ${sidetoneVolume ?? '-'}\nMic Gain: ${bluetoothMicGain ?? '-'}`;
      } else if (mode === 'speaker') {
        tooltip = `Speaker Volume: ${speakerVolume ?? '-'}\nSidetone: ${sidetoneVolume ?? '-'}\nMic Gain: ${internalMicGain ?? '-'}`;
      }
      return (
        <Tooltip
          title={<span style={{ whiteSpace: 'pre-line', fontSize: 15, lineHeight: 1.4 }}>{tooltip}</span>}
          arrow
          placement="top"
          componentsProps={{
            tooltip: {
              sx: {
                fontSize: 15,
                lineHeight: 1.4,
                padding: '10px 14px',
                maxWidth: 320,
              },
            },
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
            {mode === 'bluetooth' && <BluetoothAudioIcon sx={{ color: '#fff' }} titleAccess="Bluetooth" />}
            {mode === 'speaker' && <VolumeUpIcon sx={{ color: '#fff' }} titleAccess="Speaker" />}
            {(!mode || mode === 'headset') && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ color: '#fff' }}
                aria-label="Headset"
              >
                <path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z"/>
                <path d="M21 16v2a4 4 0 0 1-4 4h-5"/>
              </svg>
            )}
          </div>
        </Tooltip>
      );
    },
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'temperature',
    headerName: 'Temp (°C)',
    flex: 1,
    minWidth: 110,
    sortable: false,
    renderCell: (params) => {
      const value = params.value;
      if (typeof value === 'number') {
        let color = '#fff';
        if (value >= 50) color = '#e53935';
        else if (value >= 40) color = '#ff9800';
        else if (value <= 10) color = '#90caf9';
        if (color === '#90caf9') color = '#ccc';
        return <span style={{ color, fontWeight: 600 }}>{Math.round(value)}°C</span>;
      }
      return <span style={{ color: '#888' }}>—</span>;
    },
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'info',
    headerName: '',
    flex: 0.7,
    minWidth: 60,
    sortable: false,
    filterable: false,
    align: 'center',
    headerAlign: 'center',
    cellClassName: 'info-cell',
    renderCell: (params) => (
      <InfoOutlinedIcon
        sx={{ color: '#ccc', cursor: 'pointer', fontSize: 24 }}
        onClick={(e) => {
          e.stopPropagation();
          params.row.onInfo();
        }}
      />
    ),
  },
];

// Use audioMode from runtime if present, else fallback to 'headset'
function getAudioMode(b: any): 'headset' | 'bluetooth' | 'speaker' {
  return b.runtime?.audioMode || 'headset';
}

function mapBeltsToRows(belts: any[]) {
  return belts.map((b: any) => ({
    id: b.displayId ?? b.id,
    bpName: b.config?.bpName ?? '-',
    battery: typeof b.runtime?.battery?.status === 'number' ? b.runtime.battery.status : null,
    temperature: typeof b.runtime?.battery?.batteryTemperature === 'number' ? b.runtime.battery.batteryTemperature : null,
    signal: b.runtime?.signalLevel ?? '-',
    antenna: b.antenna?.name ?? '-',
    status: b.config?.registered && b.runtime ? 'online' : 'offline',
    mode: getAudioMode(b),
    headsetVolume: b.config?.headsetVolume,
    speakerVolume: b.config?.speakerVolume,
    sidetoneVolume: b.config?.sidetoneVolume,
    micGain: b.config?.headsetMicInputGain,
    internalMicGain: b.config?.internalMicInputGain,
    bluetoothMicGain: b.config?.bluetoothMicInputGain,
  }));
}

function getBeltpackInfo(row: any) {
  return {
    name: row.bpName,
    id: row.id,
    serial: row.ipei ? Array.isArray(row.ipei) ? row.ipei.join('-') : row.ipei : '-',
    firmware: row.firmware ?? row.packageVersion ?? '-',
    battery: row.battery ?? '-',
    batteryHealth: row.batteryHealth ?? '-',
    batteryMaxCapacity: row.batteryMaxCapacity ?? '-',
  };
}

export default function App() {
        // Cell titles for Artist Node grid
        const cellTitles = [
          'Bay 1:', 'Bay 6:',
          'Bay 2:', 'Bay 7:',
          'Bay 3:', 'Bay 8:',
          'Bay 4:', 'CPU A:',
          'Bay 5:', 'CPU B:'
        ];
      const [showHeaderTitle, setShowHeaderTitle] = useState(false);
      const dateBlockRef = useRef<HTMLDivElement>(null);
      useEffect(() => {
        const observer = new window.IntersectionObserver(
          ([entry]) => setShowHeaderTitle(!entry.isIntersecting),
          { threshold: 0.01 }
        );
        if (dateBlockRef.current) observer.observe(dateBlockRef.current);
        return () => observer.disconnect();
      }, []);
    const [padlockActive, setPadlockActive] = useState(true); // true = locked
    const handlePadlockToggle = () => setPadlockActive(a => !a);
  // Store live port info for each switch: { [ip]: SwitchPort[] }
  const [switchPorts, setSwitchPorts] = useState<Record<string, SwitchPort[]>>({});
  // Store group info for each switch: { [ip]: SwitchGroup[] }
  const [switchGroups, setSwitchGroups] = useState<Record<string, SwitchGroup[]>>({});
  // Network Switches state, persistent in localStorage
  const [switches, setSwitches] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('switches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [switchOrder, setSwitchOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('switchOrder');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [switchIpInput, setSwitchIpInput] = useState('');
  const [switchNameInput, setSwitchNameInput] = useState('');

  const [switchPingHistory, setSwitchPingHistory] = useState<Record<string, { timestamps: number[]; values: boolean[] }>>(() => {
    try {
      const saved = localStorage.getItem('switchPingHistory');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Poll switch port status and group info every 10s
  useEffect(() => {
    let cancelled = false;
    const fetchAllSwitchData = async () => {
      const portUpdates: Record<string, SwitchPort[]> = {};
      const groupUpdates: Record<string, SwitchGroup[]> = {};
      await Promise.all(
        switches.map(async (sw) => {
          if (!sw.ip) return;
          // HTTP Basic Auth: username 'admin', no password
          const auth = 'Basic YWRtaW46';
          const ports = await fetchSwitchPorts(sw.ip, auth);
          portUpdates[sw.ip] = ports;
          const groups = await fetchSwitchGroups(sw.ip);
          groupUpdates[sw.ip] = groups;
        })
      );
      if (!cancelled) {
        setSwitchPorts(portUpdates);
        setSwitchGroups(groupUpdates);
      }
    };
    if (switches.length > 0) {
      fetchAllSwitchData();
    }
    const interval = setInterval(fetchAllSwitchData, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(switches.map(sw => sw.ip))]);

  // Date/time state
  const [now, setNow] = useState(new Date());
  // ...existing code...

  // Add switch by IP
  const handleAddSwitch = () => {
    const ip = switchIpInput.trim();
    const name = switchNameInput.trim();
    if (!ip || !name) return;
    if (switches.some((s) => s.ip === ip)) {
      setSwitchIpInput('');
      setSwitchNameInput('');
      return;
    }
    // Remove any previous device with this IP before adding
    const filteredSwitches = switches.filter((s) => s.ip !== ip);
    const newSwitches = [...filteredSwitches, { ip, name, online: null }];
    setSwitches(newSwitches);
    // Remove from order if present, then add to end
    const filteredOrder = switchOrder.filter((id) => id !== ip);
    const newOrder = [...filteredOrder, ip];
    setSwitchOrder(newOrder);
    try {
      localStorage.setItem('switches', JSON.stringify(newSwitches));
      localStorage.setItem('switchOrder', JSON.stringify(newOrder));
    } catch {}
    setSwitchIpInput('');
    setSwitchNameInput('');
  };

  // Ping a switch IP and return true if reachable
  const pingSwitch = async (ip: string): Promise<boolean> => {
    try {
      const backend = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:3000';
      const res = await axios.get(`${backend}/api/ping?ip=${encodeURIComponent(ip)}`);
      return res.data?.online === true;
    } catch {
      return false;
    }
  };

  // Update online status for all switches, persist to localStorage, and update ping history
  useEffect(() => {
    let cancelled = false;
    const updateSwitchStatus = async () => {
      const now = Date.now();
      const updated = await Promise.all(
        switches.map(async (sw) => {
          const online = await pingSwitch(sw.ip);
          return { ...sw, online };
        })
      );
      if (!cancelled) {
        setSwitches(updated);
        try { localStorage.setItem('switches', JSON.stringify(updated)); } catch {}
        // Update ping history for each switch
        setSwitchPingHistory(prev => {
          const newHist = { ...prev };
          for (const sw of updated) {
            const ip = sw.ip;
            const prevHist = prev[ip] || { timestamps: [], values: [] };
            // Only keep last 30 minutes (1800 seconds)
            const cutoff = now - 30 * 60 * 1000;
            const filtered = prevHist.timestamps
              .map((t, i) => ({ t, v: prevHist.values[i] }))
              .filter(({ t }) => t >= cutoff);
            const timestamps = filtered.map(x => x.t).concat(now);
            const values = filtered.map(x => x.v).concat(sw.online);
            newHist[ip] = { timestamps, values };
          }
          // Save to localStorage
          try { localStorage.setItem('switchPingHistory', JSON.stringify(newHist)); } catch {}
          return newHist;
        });
      }
    };
    if (switches.length > 0) {
      updateSwitchStatus();
    }
    // Poll every 10s
    const interval = setInterval(updateSwitchStatus, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(switches.map(sw => sw.ip))]);
  // Delete switch
  const handleDeleteSwitch = (ip: string) => {
    const newSwitches = switches.filter((s) => s.ip !== ip);
    setSwitches(newSwitches);
    const newOrder = switchOrder.filter((id) => id !== ip);
    setSwitchOrder(newOrder);
    try {
      localStorage.setItem('switches', JSON.stringify(newSwitches));
      localStorage.setItem('switchOrder', JSON.stringify(newOrder));
    } catch {}
  };
  // Drag and drop for switches
  const handleSwitchDragEnd = (result: any) => {
    if (!result.destination) return;
    const newOrder = Array.from(switchOrder);
    const [removed] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, removed);
    setSwitchOrder(newOrder);
    try {
      localStorage.setItem('switchOrder', JSON.stringify(newOrder));
    } catch {}
  };
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  // Format date/time MacOS style
  function formatDateTime(d: Date) {
    return d.toLocaleString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }
  // Internet status state
  const [internetOnline, setInternetOnline] = useState<boolean | null>(null);
  // Poll 8.8.8.8 every 10s
  useEffect(() => {
    let cancelled = false;
    const checkInternet = async () => {
      try {
        const backend = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:3000';
        const res = await axios.get(`${backend}/api/ping?ip=8.8.8.8`);
        if (!cancelled) setInternetOnline(res.data?.online === true);
      } catch {
        if (!cancelled) setInternetOnline(false);
      }
    };
    checkInternet();
    const interval = setInterval(checkInternet, 10000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);
  const [belts, setBelts] = useState<any[]>([]);
  const [tab, setTab] = useState<'all' | 'online' | 'offline'>('online');
  const [infoRow, setInfoRow] = useState<any | null>(null);
  const [netName, setNetName] = useState<string>('');
  const [netSettingsRaw, setNetSettingsRaw] = useState<any>(null);
  const [antennas, setAntennas] = useState<any[]>([]);
  // Intercom panel locations state, persisted in localStorage
  const [panelLocations, setPanelLocations] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('intercomPanelLocations');
      let locations = saved ? JSON.parse(saved) : [{ id: 'default', name: 'Default', order: 0 }];
      // Remove any location named 'default'
      locations = locations.filter((loc: any) => loc.id !== 'default' && loc.name.toLowerCase() !== 'default');
      return locations;
    } catch {
      return [];
    }
  });
  // Intercom panels state, persisted in localStorage
  const [panels, setPanels] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('intercomPanels');
      const loaded = saved ? JSON.parse(saved) : [];
      // Ensure every panel has a panelType property
      return loaded.map((p: any) => ({ ...p, panelType: typeof p.panelType === 'string' ? p.panelType : '' }));
    } catch {
      return [];
    }
  });

  // Handler to update panel type
  const handlePanelTypeChange = (ip: string, newType: string) => {
    setPanels(prev => {
      const updated = prev.map(p => p.ip === ip ? { ...p, panelType: newType } : p);
      try { localStorage.setItem('intercomPanels', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };
  // Intercom panel order (object: { [locationId]: string[] })
  const [panelOrder, setPanelOrder] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem('intercomPanelOrder');
      return saved ? JSON.parse(saved) : { default: [] };
    } catch {
      return { default: [] };
    }
  });
  // Ping history: { [ip]: { timestamps: number[], values: boolean[] } }
  const [pingHistory, setPingHistory] = useState<Record<string, { timestamps: number[]; values: boolean[] }>>(() => {
    try {
      const saved = localStorage.getItem('intercomPanelPingHistory');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [panelIpInput, setPanelIpInput] = useState<Record<string, string>>({});
  const [panelNameInput, setPanelNameInput] = useState<Record<string, string>>({});
  // Add panel by IP, assign to location
  const handleAddPanel = async (locationId = 'default') => {
    const ip = (panelIpInput[locationId] || '').trim();
    const name = (panelNameInput[locationId] || '').trim();
    if (!ip || !name) return;
    // Remove any previous panel with this IP before adding
    const filteredPanels = panels.filter((p) => p.ip !== ip);
    // Ping immediately
    const online = await pingPanel(ip);
    const newPanels = [...filteredPanels, { ip, name, online, locationId, panelType: '' }];
    setPanels(newPanels);
    // Remove from order if present, then add to end for this location
    const newPanelOrder = { ...panelOrder };
    if (!newPanelOrder[locationId]) newPanelOrder[locationId] = [];
    newPanelOrder[locationId] = newPanelOrder[locationId].filter((id) => id !== ip);
    newPanelOrder[locationId].push(ip);
    setPanelOrder(newPanelOrder);
    try {
      localStorage.setItem('intercomPanels', JSON.stringify(newPanels));
      localStorage.setItem('intercomPanelOrder', JSON.stringify(newPanelOrder));
    } catch {}
    setPanelIpInput((prev) => ({ ...prev, [locationId]: '' }));
    setPanelNameInput((prev) => ({ ...prev, [locationId]: '' }));
  };

  // Ping a panel IP and return true if reachable
  const pingPanel = async (ip: string): Promise<boolean> => {
    try {
      const backend = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:3000';
      const res = await axios.get(`${backend}/api/ping?ip=${encodeURIComponent(ip)}`);
      return res.data?.online === true;
    } catch {
      return false;
    }
  };

  // Update online status for all panels, persist to localStorage, and update ping history
  useEffect(() => {
    let cancelled = false;
    const updatePanelStatus = async () => {
      const now = Date.now();
      const updated = await Promise.all(
        panels.map(async (panel) => {
          const online = await pingPanel(panel.ip);
          return { ...panel, online };
        })
      );
      // Merge updated online status into the latest panels (to preserve edits like panelType)
      setPanels(prevPanels => {
        const merged = prevPanels.map(panel => {
          const found = updated.find(p => p.ip === panel.ip);
          return found ? { ...panel, online: found.online } : panel;
        });
        try { localStorage.setItem('intercomPanels', JSON.stringify(merged)); } catch {}
        // Update ping history for each panel
        setPingHistory(prev => {
          const newHist = { ...prev };
          for (const panel of merged) {
            const ip = panel.ip;
            const prevHist = prev[ip] || { timestamps: [], values: [] };
            // Only keep last 30 minutes (1800 seconds)
            const cutoff = now - 30 * 60 * 1000;
            const filtered = prevHist.timestamps
              .map((t, i) => ({ t, v: prevHist.values[i] }))
              .filter(({ t }) => t >= cutoff);
            const timestamps = filtered.map(x => x.t).concat(now);
            const values = filtered.map(x => x.v).concat(panel.online);
            newHist[ip] = { timestamps, values };
          }
          // Save to localStorage
          try { localStorage.setItem('intercomPanelPingHistory', JSON.stringify(newHist)); } catch {}
          return newHist;
        });
        return merged;
      });
    };
    if (panels.length > 0) {
      updatePanelStatus();
    }
    // Poll every 10s
    const interval = setInterval(updatePanelStatus, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(panels.map(p => p.ip))]);

  // Keep panelOrder in sync with panels (add new IPs, remove missing) for each location
  useEffect(() => {
    setPanelOrder((prev) => {
      const updatedOrder: Record<string, string[]> = { ...prev };
      // For each location, sync order with panels assigned to that location
      panelLocations.forEach(loc => {
        const locationPanels = panels.filter((p: any) => p.locationId === loc.id).map((p: any) => p.ip);
        let orderArr = updatedOrder[loc.id] || [];
        // Remove IPs not present
        orderArr = orderArr.filter(ip => locationPanels.includes(ip));
        // Add new IPs
        locationPanels.forEach(ip => { if (!orderArr.includes(ip)) orderArr.push(ip); });
        updatedOrder[loc.id] = orderArr;
      });
      try { localStorage.setItem('intercomPanelOrder', JSON.stringify(updatedOrder)); } catch {}
      return updatedOrder;
    });
  }, [JSON.stringify(panels), JSON.stringify(panelLocations)]);

  useEffect(() => {
    const backend = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:3000';
    const socket = io(backend);

    socket.on('connect', () => console.log('connected', socket.id));
    socket.on('bolero:update', (data: any) => setBelts(data));
    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    const backend = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:3000';
    fetch(`${backend}/api/netSettings`)
      .then(r => r.json())
      .then(data => {
        setNetSettingsRaw(data);
        let name = '';
        if (data.net && data.net.net && typeof data.net.net.netName === 'string') name = data.net.net.netName;
        else if (data.net && typeof data.net.netName === 'string') name = data.net.netName;
        else if (typeof data.netName === 'string') name = data.netName;
        if (name) setNetName(name);
      })
      .catch((err) => {
        setNetSettingsRaw({ error: String(err) });
        setNetName('');
      });
    // Only run on mount
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const backend = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:3000';
    fetch(`${backend}/api/status`)
      .then((r) => r.json())
      .then((d) => setBelts(d.belts || []))
      .catch(() => {});
    // Fetch antennas from new endpoint
    fetch(`${backend}/api/antennas`)
      .then((r) => r.json())
      .then((d) => setAntennas(Array.isArray(d.antennas) ? d.antennas : []))
      .catch(() => setAntennas([]));
  }, []);




  // Store antenna order in state for drag-and-drop, using nodeId/userId as stable keys
  const getAntennaKey = (a: any) => String(a.userId ?? a.nodeId);
  // Only set from localStorage on mount, and always merge in any antennas not present
  const [antennaOrder, setAntennaOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('antennaOrder');
      if (saved) {
        console.log('[AntennaOrder] Loaded from localStorage:', saved);
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('[AntennaOrder] Failed to load from localStorage', e);
    }
    return [];
  });

  // When antennas change, only add new antennas to the order, never reorder or remove existing ones
  useEffect(() => {
    const keys = antennas.map(getAntennaKey);
    // Only update order if antennas are present
    if (keys.length === 0) return;
    setAntennaOrder((prev) => {
      let baseOrder = prev;
      if (prev.length === 0) {
        try {
          const saved = localStorage.getItem('antennaOrder');
          if (saved) {
            baseOrder = JSON.parse(saved);
            console.log('[AntennaOrder] Re-loaded from localStorage in effect:', saved);
          }
        } catch (e) {
          console.warn('[AntennaOrder] Failed to re-load from localStorage', e);
        }
      }
      let newOrder = [...baseOrder];
      keys.forEach((n) => { if (!newOrder.includes(n)) newOrder.push(n); });
      newOrder = newOrder.filter((n) => keys.includes(n));
      if (JSON.stringify(newOrder) !== JSON.stringify(baseOrder)) {
        try {
          localStorage.setItem('antennaOrder', JSON.stringify(newOrder));
          console.log('[AntennaOrder] Saved to localStorage:', JSON.stringify(newOrder));
        } catch (e) {
          console.warn('[AntennaOrder] Failed to save to localStorage', e);
        }
      }
      if (JSON.stringify(newOrder) !== JSON.stringify(prev)) {
        console.log('[AntennaOrder] setAntennaOrder:', newOrder);
      }
      return newOrder;
    });
    // eslint-disable-next-line
  }, [JSON.stringify(antennas.map(getAntennaKey))]);

  // Save antenna order to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('antennaOrder', JSON.stringify(antennaOrder));
      console.log('[AntennaOrder] Saved to localStorage (order changed):', JSON.stringify(antennaOrder));
    } catch (e) {
      console.warn('[AntennaOrder] Failed to save to localStorage (order changed)', e);
    }
  }, [antennaOrder]);

  // Always render antennas in the order of antennaOrder, and only those present in the order
  const orderedAntennas = antennaOrder
    .map((key) => antennas.find((a: any) => getAntennaKey(a) === key))
    .filter(Boolean);

  function onDragEnd(result: any) {
    if (!result.destination) return;
    const newOrder = Array.from(antennaOrder);
    const [removed] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, removed);
    setAntennaOrder(newOrder);
    try {
      localStorage.setItem('antennaOrder', JSON.stringify(newOrder));
      console.log('[AntennaOrder] Saved to localStorage (onDragEnd):', JSON.stringify(newOrder));
    } catch (e) {
      console.warn('[AntennaOrder] Failed to save to localStorage (onDragEnd)', e);
    }
  }

  let filteredBelts = belts;
  if (tab === 'online') filteredBelts = belts.filter((b: any) => b.config?.registered && b.runtime);
  if (tab === 'offline') filteredBelts = belts.filter((b: any) => !b.config?.registered || !b.runtime);

  function handleInfoClick(row: any) {
    setInfoRow(row);
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppBar position="sticky" color="primary" elevation={1}>
        <Toolbar sx={{ minHeight: 64, display: 'flex', alignItems: 'center', px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', height: 48, mr: 2 }}>
            <CTLogo style={{ height: 48, width: 'auto', display: 'block' }} />
          </Box>
          {showHeaderTitle && (
              <>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, fontSize: 22, ml: 2, mr: 4 }}>
                  Network Monitoring Dashboard{netName ? ` – ${netName}` : ''}
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Typography variant="subtitle1" sx={{ color: '#aaa', fontWeight: 600, fontSize: 18, letterSpacing: 0.5, mr: 3 }}>
                  {formatDateTime(now)}
                </Typography>
              </>
          )}
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tooltip
                title={padlockActive ? 'Page Locked' : 'Page Unlocked'}
                slotProps={{ tooltip: { sx: { fontSize: 15, py: 0.5, px: 1.5 } } }}
              >
                <span>
                  <IconButton onClick={handlePadlockToggle} disableRipple sx={{ p: 0, background: 'none', '&:hover': { background: 'none' }, '&:active': { background: 'none' }, '&.Mui-focusVisible': { background: 'none' } }}>
                    {padlockActive ? (
                      <PadlockClosedIcon sx={{ color: '#4caf50', fontSize: 32, mr: 0.5 }} />
                    ) : (
                      <PadlockOpenIcon sx={{ color: '#f44336', fontSize: 32, mr: 0.5 }} />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            <Tooltip
              title={
                internetOnline === null
                  ? 'Checking internet...'
                  : internetOnline
                    ? 'Internet Connected'
                    : 'No Connection to Internet'
              }
              slotProps={{
                tooltip: {
                  sx: { fontSize: 15, py: 0.5, px: 1.5 }
                }
              }}
            >
              <span>
                <IconButton disableRipple sx={{ p: 0, background: 'none', ml: 2, '&:hover': { background: 'none' }, '&:active': { background: 'none' }, '&.Mui-focusVisible': { background: 'none' } }}>
                  <InternetIcon
                    sx={{ color: internetOnline === null ? '#aaa' : internetOnline ? '#4caf50' : '#888', fontSize: 32 }}
                    titleAccess={internetOnline === null ? 'Checking internet...' : internetOnline ? 'Internet reachable' : 'No internet'}
                  />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth={false} sx={{ mt: 4, px: 0 }}>
        {/* Date/time and overview stats box */}
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
          <Box ref={dateBlockRef} sx={{
            background: '#23272B',
            borderRadius: 3,
            px: 3,
            py: 2,
            minWidth: 320,
            maxWidth: 1200,
            width: '100%',
            display: 'inline-flex',
            alignItems: 'center',
            boxShadow: '0 2px 8px 0 #0004',
            flexDirection: 'column',
            gap: 1.5,
          }}>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, fontSize: 22, mb: 2, textAlign: 'center', width: '100%' }}>
              Network Monitoring Dashboard{netName ? ` – ${netName}` : ''}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircleIcon sx={{
                  color:
                    switches.length === 0 ? '#888'
                    : switches.every((s: any) => s.online) ? '#4caf50'
                    : switches.some((s: any) => s.online) ? '#ff9800'
                    : '#888',
                  fontSize: 16
                }} />
                Switches Online: {switches.filter((s: any) => s.online).length} / {switches.length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircleIcon sx={{
                  color:
                    panels.length === 0 ? '#888'
                    : panels.every((p: any) => p.online) ? '#4caf50'
                    : panels.some((p: any) => p.online) ? '#ff9800'
                    : '#888',
                  fontSize: 16
                }} />
                Panels Online: {panels.filter((p: any) => p.online).length} / {panels.length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircleIcon sx={{
                  color:
                    antennas.length === 0 ? '#888'
                    : antennas.every((a: any) => a.online) ? '#4caf50'
                    : antennas.some((a: any) => a.online) ? '#ff9800'
                    : '#888',
                  fontSize: 16
                }} />
                Antennas Online: {antennas.filter((a: any) => a.online).length} / {antennas.length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircleIcon sx={{ color: (belts.length > 0 && belts.some((b: any) => b.config?.registered && b.runtime)) ? '#4caf50' : '#888', fontSize: 16 }} />
                Beltpacks Online: {belts.filter((b: any) => b.config?.registered && b.runtime).length} / {belts.length}
              </Typography>
            </Box>
            <Typography variant="subtitle1" sx={{ color: '#aaa', fontWeight: 600, fontSize: 18, letterSpacing: 0.5, textAlign: 'center', width: '100%' }}>
              {formatDateTime(now)}
            </Typography>
          </Box>
        </Box>
        {/* Network Switches Section */}
        <Box sx={{ mb: 5 }}>
        <CollapsibleSection
          title={
              <>
                <strong style={{ fontWeight: 700 }}>Network Switches</strong>
                <span style={{ display: 'inline-flex', alignItems: 'center', marginLeft: 12, fontWeight: 600, fontSize: 17 }}>
                <CircleIcon sx={{
                  color:
                    switches.length === 0 ? '#888'
                    : switches.every((s: any) => s.online) ? '#4caf50'
                    : switches.some((s: any) => s.online) ? '#ff9800'
                    : '#888',
                  fontSize: 18, mr: 1
                }} />
                {switches.filter((s: any) => s.online).length} / {switches.length} online
              </span>
            </>
          }
        >
          <Paper elevation={3} sx={{ p: 2, mb: 3, background: 'rgba(35,39,43,0.98)', borderRadius: 5 }}>
            {/* Switch add form */}
            {!padlockActive && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, pl: 1 }}>
                <TextField
                  size="small"
                  label="Switch Name"
                  variant="outlined"
                  value={switchNameInput}
                  onChange={e => setSwitchNameInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddSwitch(); }}
                  sx={{ background: '#23272B', input: { color: '#b0b0b0' }, label: { color: '#b0b0b0' }, minWidth: 140 }}
                  InputProps={{ style: { color: '#b0b0b0' } }}
                />
                <TextField
                  size="small"
                  label="Switch IP"
                  variant="outlined"
                  value={switchIpInput}
                  onChange={e => setSwitchIpInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddSwitch(); }}
                  sx={{ background: '#23272B', input: { color: '#b0b0b0' }, label: { color: '#b0b0b0' }, minWidth: 140 }}
                  InputProps={{ style: { color: '#b0b0b0' } }}
                />
                <IconButton color="primary" onClick={handleAddSwitch} sx={{ ml: 1 }}>
                  <AddIcon sx={{ color: '#b0b0b0' }} />
                </IconButton>
              </Box>
            )}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, p: 1 }}>
              {switches.length === 0 && <Typography sx={{ color: '#aaa' }}>No switches configured.</Typography>}
              <DragDropContext
                onDragEnd={padlockActive ? () => {} : (result: DropResult) => {
                  if (!result.destination) return;
                  const from = result.source.index;
                  const to = result.destination.index;
                  const newOrder = Array.from(switchOrder);
                  const [removed] = newOrder.splice(from, 1);
                  newOrder.splice(to, 0, removed);
                  setSwitchOrder(newOrder);
                  try { localStorage.setItem('switchOrder', JSON.stringify(newOrder)); } catch {}
                }}
              >
                <Droppable droppableId="switches" direction="horizontal">
                  {(provided: DroppableProvided) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, p: 1 }} ref={provided.innerRef} {...provided.droppableProps}>
                      {switchOrder
                        .map(ip => switches.find((s: any) => s.ip === ip))
                        .filter(Boolean)
                        .concat(switches.filter((s: any) => !switchOrder.includes(s.ip)))
                        .map((sw: any, idx: number) => {
                          const handleDelete = () => {
                            const ipToDelete = sw.ip;
                            const newSwitches = switches.filter((s: any) => s.ip !== ipToDelete);
                            setSwitches(newSwitches);
                            const newOrder = switchOrder.filter((id) => id !== ipToDelete);
                            setSwitchOrder(newOrder);
                            try {
                              localStorage.setItem('switches', JSON.stringify(newSwitches));
                              localStorage.setItem('switchOrder', JSON.stringify(newOrder));
                            } catch {}
                          };
                          const hist = switchPingHistory[sw.ip] || { timestamps: [], values: [] };
                          return (
                            <Draggable key={sw.ip} draggableId={sw.ip} index={idx}>
                              {(dragProvided: DraggableProvided, dragSnapshot: DraggableStateSnapshot) => (
                                <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}>
                                  <PingBlock
                                    name={sw.name || 'Unknown Switch'}
                                    ip={sw.ip}
                                    online={sw.online}
                                    pingHistory={hist.values}
                                    onDelete={handleDelete}
                                    className="switch-block"
                                    deleteButtonClassName="delete-switch-btn"
                                    deleteButtonTitle="Delete switch"
                                    style={{
                                      boxShadow: dragSnapshot.isDragging ? '0 4px 16px 0 #2196f3aa' : '0 2px 8px 0 #0004',
                                      opacity: dragSnapshot.isDragging ? 0.85 : 1,
                                    }}
                                    ports={(() => {
                                      const ports = switchPorts[sw.ip] || [];
                                      const groups = switchGroups[sw.ip] || [];
                                      // Map port to group name
                                      return ports.map(port => {
                                        let groupName = '';
                                        for (const group of groups) {
                                          if (group.portNumbers.includes(port.port)) {
                                            groupName = group.groupName.toUpperCase();
                                            break;
                                          }
                                        }
                                        return { ...port, groupName };
                                      });
                                    })()}
                                    ipAfterName={true}
                                    blockType="switch"
                                  />
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </DragDropContext>
            </Box>
          </Paper>
        </CollapsibleSection>
        </Box>
        {/* Intercom Panels Section */}
        <Box sx={{ mb: 5 }}>
          <CollapsibleSection
            title={
                <>
                  <strong style={{ fontWeight: 700 }}>Intercom Panels</strong>
                  <span style={{ display: 'inline-flex', alignItems: 'center', marginLeft: 12, fontWeight: 600, fontSize: 17 }}>
                  <CircleIcon sx={{
                    color:
                      panels.length === 0 ? '#888'
                      : panels.every((p: any) => p.online) ? '#4caf50'
                      : panels.some((p: any) => p.online) ? '#ff9800'
                      : '#888',
                    fontSize: 18, mr: 1
                  }} />
                  {panels.filter((p: any) => p.online).length} / {panels.length} online
                </span>
              </>
            }
          >
            <Paper elevation={3} sx={{ p: 2, mb: 3, background: 'rgba(35,39,43,0.98)', borderRadius: 5 }}>
              {/* Location Headings UI */}
              <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                {!padlockActive && panelLocations.map(loc => (
                  <Paper key={loc.id} elevation={2} sx={{ px: 2, py: 1, background: '#23272B', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: 18, mr: 1, color: '#fff' }}>{loc.name}</Typography>
                    <IconButton size="small" sx={{ color: '#aaa' }} onClick={() => handleRenameLocation(loc.id, prompt('Rename location:', loc.name) || loc.name, panelLocations, setPanelLocations)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {loc.id !== 'default' && (
                      <IconButton size="small" sx={{ color: '#aaa' }} onClick={() => handleDeleteLocation(loc.id, panelLocations, setPanelLocations, setPanelOrder, setPanels)}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Paper>
                ))}
                {!padlockActive && (
                  <TextField
                    size="small"
                    label="Add Location"
                    variant="outlined"
                    onKeyDown={e => {
                      const input = e.target as HTMLInputElement;
                      if (e.key === 'Enter' && input.value.trim()) {
                        handleAddLocation(input.value.trim(), panelLocations, setPanelLocations, setPanelOrder);
                        input.value = '';
                      }
                    }}
                    sx={{ background: '#23272B', label: { color: '#fff' }, minWidth: 140, '& .MuiInputBase-input': { color: '#b0b0b0' } }}
                  />
                )}
              </Box>
              {/* Panels by Location */}
              {panelLocations.map(loc => (
                <Box key={loc.id} sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 20, mb: 1, color: '#fff', pl: 3 }}>{loc.name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, pl: 1 }}>
                    {!padlockActive && (
                      <>
                        <TextField
                          size="small"
                          label="Panel Name"
                          variant="outlined"
                          value={panelNameInput[loc.id] || ''}
                          onChange={e => setPanelNameInput((prev) => ({ ...prev, [loc.id]: e.target.value }))}
                          onKeyDown={e => { if (e.key === 'Enter') handleAddPanel(loc.id); }}
                          sx={{ background: '#23272B', label: { color: '#fff' }, minWidth: 140, '& .MuiInputBase-input': { color: '#b0b0b0' } }}
                        />
                        <TextField
                          size="small"
                          label="Panel IP"
                          variant="outlined"
                          value={panelIpInput[loc.id] || ''}
                          onChange={e => setPanelIpInput((prev) => ({ ...prev, [loc.id]: e.target.value }))}
                          onKeyDown={e => { if (e.key === 'Enter') handleAddPanel(loc.id); }}
                          sx={{ background: '#23272B', label: { color: '#fff' }, minWidth: 140, '& .MuiInputBase-input': { color: '#b0b0b0' } }}
                        />
                        <IconButton color="primary" onClick={() => handleAddPanel(loc.id)} sx={{ ml: 1 }}>
                          <AddIcon sx={{ color: '#b0b0b0' }} />
                        </IconButton>
                      </>
                    )}
                  </Box>
                  <DragDropContext
                    onDragEnd={padlockActive ? () => {} : (result: DropResult) => {
                      if (!result.destination) return;
                      const fromLocation = result.source.droppableId;
                      const toLocation = result.destination.droppableId;
                      const fromIdx = result.source.index;
                      const toIdx = result.destination.index;
                      const newOrder = { ...panelOrder };
                      // Remove from source location
                      const arrFrom = Array.from(newOrder[fromLocation] || []);
                      const [removed] = arrFrom.splice(fromIdx, 1);
                      newOrder[fromLocation] = arrFrom;
                      // Add to destination location
                      const arrTo = Array.from(newOrder[toLocation] || []);
                      arrTo.splice(toIdx, 0, removed);
                      newOrder[toLocation] = arrTo;
                      setPanelOrder(newOrder);
                      try { localStorage.setItem('intercomPanelOrder', JSON.stringify(newOrder)); } catch {}
                      // Update panel's locationId if moved between locations
                      if (fromLocation !== toLocation) {
                        setPanels(prev => {
                          const updated = prev.map(p => p.ip === removed ? { ...p, locationId: toLocation } : p);
                          try { localStorage.setItem('intercomPanels', JSON.stringify(updated)); } catch {}
                          return updated;
                        });
                      }
                    }}
                  >
                    <Droppable droppableId={loc.id} direction="horizontal">
                      {(provided: DroppableProvided) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, p: 1 }} ref={provided.innerRef} {...provided.droppableProps}>
                          {((panelOrder[loc.id] || [])
                            .map(ip => panels.find((p: any) => p.ip === ip && p.locationId === loc.id))
                            .filter(Boolean)
                            .concat(panels.filter((p: any) => p.locationId === loc.id && !(panelOrder[loc.id] || []).includes(p.ip))))
                            .map((panel: any, idx: number) => {
                              const hist = pingHistory[panel.ip] || { timestamps: [], values: [] };
                              const handleDelete = () => {
                                const ipToDelete = panel.ip;
                                const newPanels = panels.filter((p: any) => p.ip !== ipToDelete);
                                setPanels(newPanels);
                                const newOrder = { ...panelOrder };
                                newOrder[loc.id] = (newOrder[loc.id] || []).filter((id) => id !== ipToDelete);
                                setPanelOrder(newOrder);
                                try {
                                  localStorage.setItem('intercomPanels', JSON.stringify(newPanels));
                                  localStorage.setItem('intercomPanelOrder', JSON.stringify(newOrder));
                                } catch {}
                                // Remove ping history for this panel
                                setPingHistory(prev => {
                                  const nh = { ...prev };
                                  delete nh[ipToDelete];
                                  try { localStorage.setItem('intercomPanelPingHistory', JSON.stringify(nh)); } catch {}
                                  return nh;
                                });
                              };
                              return (
                                <Draggable key={panel.ip} draggableId={panel.ip} index={idx}>
                                  {(dragProvided: DraggableProvided, dragSnapshot: DraggableStateSnapshot) => (
                                    <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}>
                                      <PingBlock
                                        name={panel.name || 'Unknown Panel'}
                                        ip={panel.ip}
                                        online={panel.online}
                                        pingHistory={hist.values}
                                        onDelete={handleDelete}
                                        className="panel-block"
                                        deleteButtonClassName="delete-panel-btn"
                                        deleteButtonTitle="Delete panel"
                                        style={{
                                          boxShadow: dragSnapshot.isDragging ? '0 4px 16px 0 #f44336aa' : '0 2px 8px 0 #0004',
                                          opacity: dragSnapshot.isDragging ? 0.85 : 1,
                                        }}
                                        ipAfterName={false}
                                        blockType="panel"
                                        panelType={panel.panelType}
                                        onPanelTypeChange={type => handlePanelTypeChange(panel.ip, type)}
                                        editablePanelType={!padlockActive}
                                      />
                                    </div>
                                  )}
                                </Draggable>
                              );
                            })}
                          {provided.placeholder}
                        </Box>
                      )}
                    </Droppable>
                  </DragDropContext>
                </Box>
              ))}
              </Paper>
          </CollapsibleSection>
        </Box>

        {/* Artist Nodes Section */}
        <Box sx={{ mb: 5 }}>
          <CollapsibleSection
            title={<>
              <strong style={{ fontWeight: 700 }}>Artist Nodes</strong>
              <span style={{ display: 'inline-flex', alignItems: 'center', marginLeft: 12, fontWeight: 600, fontSize: 17 }}>
                <CircleIcon sx={{ color: '#4caf50', fontSize: 18, ml: 1 }} />
                {/* Online count for Artist Node cards */}
                {(() => {
                  // Calculate online count for Artist Node cards: AIO/CPU always online, AES67/DANTE only if pingStatus is online
                  let onlineCount = 0;
                  for (let i = 0; i < 10; i++) {
                    const cellKey = `artist64_cell_${i}`;
                    let state;
                    try {
                      const saved = localStorage.getItem(cellKey);
                      state = saved ? JSON.parse(saved) : { cardType: 'AES67-108 G2', ip: '' };
                    } catch {
                      state = { cardType: 'AES67-108 G2', ip: '' };
                    }
                    // Match green dot logic: online if AIO, CPU, or any card with a non-empty IP
                    if (
                      state.cardType === 'AIO-108 G2' ||
                      (typeof state.cardType === 'string' && state.cardType.startsWith('CPU')) ||
                      (typeof state.ip === 'string' && state.ip.trim())
                    ) {
                      onlineCount++;
                    }
                  }
                  return <span style={{ marginLeft: 8, color: '#fff', fontWeight: 600, fontSize: 16 }}>{onlineCount} / 10 online</span>;
                })()}
              </span>
            </>}
            defaultCollapsed={false}
          >
            <Paper elevation={3} sx={{ p: 2, background: 'rgba(35,39,43,0.98)', maxWidth: 'none', overflowX: 'auto', borderRadius: 5 }}>
              <Paper elevation={2} sx={{ width: 'fit-content', p: 2, background: '#1B1F22', borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: 18, color: '#fff', mb: 1 }}>
                  Artist 64 - Comm Control 01
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 2fr)', gridTemplateRows: 'repeat(5, 1fr)', gap: 2 }}>
                {[...Array(10)].map((_, i) => {
                    // Second column is i % 2 === 1, bottom two rows are i === 7 or i === 9
                    const isSecondCol = i % 2 === 1;
                    const isBottomTwo = isSecondCol && (i === 7 || i === 9);
                    return (
                      <Box key={i} sx={{ background: '#23272B', borderRadius: 2, p: 2, minWidth: 340, maxWidth: 520, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', color: '#aaa', fontWeight: 600 }}>
                        {(() => {
                          // Style for unified card type text
                          const cardTypeStyle = { color: '#b0b0b0', fontSize: 16, fontWeight: 500, width: '100%', minHeight: 32, display: 'flex', alignItems: 'center', background: 'none', border: 'none', padding: 0, whiteSpace: 'nowrap' };
                          // Persistent state for card type and IP per cell
                          const cellKey = `artist64_cell_${i}`;
                          const getInitial = () => {
                            try {
                              const saved = localStorage.getItem(cellKey);
                              if (saved) return JSON.parse(saved);
                            } catch {}
                            return { cardType: 'AES67-108 G2', ip: '' };
                          };
                          const [cellState, setCellState] = React.useState(getInitial);
                          React.useEffect(() => {
                            try { localStorage.setItem(cellKey, JSON.stringify(cellState)); } catch {}
                          }, [cellState]);
                          const setCardType = (val: string) => setCellState((s: any) => ({ ...s, cardType: val }));
                          const setIp = (val: string) => setCellState((s: any) => ({ ...s, ip: val }));
                          const showPingDot = (typeof cellState.ip === 'string' && cellState.ip.trim()) || cellState.cardType === 'AIO-108 G2' || (typeof cellState.cardType === 'string' && cellState.cardType.startsWith('CPU'));
                          const [pingStatus, setPingStatus] = React.useState<'unknown' | 'online' | 'offline'>('unknown');
                          React.useEffect(() => {
                            let cancelled = false;
                            const checkPing = async () => {
                              if (!cellState.ip || !cellState.ip.trim()) {
                                setPingStatus('unknown');
                                return;
                              }
                              try {
                                const backend = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:3000';
                                const res = await axios.get(`${backend}/api/ping?ip=${encodeURIComponent(cellState.ip)}`);
                                if (!cancelled) setPingStatus(res.data?.online === true ? 'online' : 'offline');
                              } catch {
                                if (!cancelled) setPingStatus('offline');
                              }
                            };
                            checkPing();
                            const interval = setInterval(checkPing, 10000);
                            return () => { cancelled = true; clearInterval(interval); };
                          }, [cellState.ip]);
                          // Render all cell states on one line, with bay bold
                          const bayLabel = <span style={{ fontWeight: 700, color: '#fff', fontSize: 15, marginRight: 8 }}>{cellTitles[i]}</span>;
                          if (isBottomTwo) {
                            return (
                              <span style={{ ...cardTypeStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                {bayLabel} Card Type: CPU-128F G2
                                <CircleIcon sx={{ color: '#4caf50', fontSize: 16, verticalAlign: 'middle' }} />
                              </span>
                            );
                          }
                          if (padlockActive) {
                            // Show selected value only
                            return (
                              <span style={{ ...cardTypeStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                {bayLabel} Card Type: {cellState.cardType}
                                {(cellState.cardType === 'AIO-108 G2' || (typeof cellState.cardType === 'string' && cellState.cardType.startsWith('CPU'))) ? (
                                  <CircleIcon sx={{ color: '#4caf50', fontSize: 16, verticalAlign: 'middle' }} />
                                ) : showPingDot ? (
                                  <CircleIcon sx={{ color: pingStatus === 'online' ? '#4caf50' : '#888', fontSize: 16, verticalAlign: 'middle' }} />
                                ) : null}
                              </span>
                            );
                          }
                          // Editable UI when padlock is unlocked (default case)
                          return (
                            <span style={{ ...cardTypeStyle, flexDirection: 'column', alignItems: 'flex-start', minHeight: 56, width: '100%' }}>
                              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <span style={{ display: 'flex', alignItems: 'center' }}>
                                  {bayLabel} Card Type:
                                  <select
                                    style={{ marginLeft: 6, background: 'none', color: '#b0b0b0', fontSize: 16, fontWeight: 500, border: 'none', outline: 'none', padding: 0, appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }}
                                    value={cellState.cardType}
                                    onChange={e => setCardType(e.target.value)}
                                  >
                                    <option value="AES67-108 G2">AES67-108 G2</option>
                                    <option value="AIO-108 G2">AIO-108 G2</option>
                                    <option value="DANTE-108 G2">DANTE-108 G2</option>
                                    <option value="MADI-108 G2">MADI-108 G2</option>
                                  </select>
                                </span>
                                {(cellState.cardType === 'AIO-108 G2' || (typeof cellState.cardType === 'string' && cellState.cardType.startsWith('CPU'))) ? (
                                  <CircleIcon sx={{ color: '#4caf50', fontSize: 16, verticalAlign: 'middle' }} />
                                ) : showPingDot ? (
                                  <CircleIcon sx={{ color: pingStatus === 'online' ? '#4caf50' : '#888', fontSize: 16, verticalAlign: 'middle' }} />
                                ) : null}
                              </span>
                              {(typeof cellState.cardType === 'string' && (cellState.cardType.startsWith('AES67') || cellState.cardType.startsWith('DANTE'))) && (
                                <input
                                  type="text"
                                  placeholder="IP Address"
                                  value={cellState.ip}
                                  onChange={e => setIp(e.target.value)}
                                  style={{ marginTop: 6, background: 'none', color: '#b0b0b0', fontSize: 15, border: '1px solid #444', borderRadius: 3, padding: '4px 8px', width: '100%' }}
                                />
                              )}
                            </span>
                          );
                        })()}
                      </Box>
                    );
                  })}
                </Box>
              </Paper>
            </Paper>
          </CollapsibleSection>
        </Box>
        {/* Antennas Section */}
        <Box sx={{ mb: 5 }}>
        <CollapsibleSection
          title={
              <>
                <strong style={{ fontWeight: 700 }}>Antennas</strong>
                <span style={{ display: 'inline-flex', alignItems: 'center', marginLeft: 12, fontWeight: 600, fontSize: 17 }}>
                <CircleIcon sx={{
                  color:
                    antennas.length === 0 ? '#888'
                    : antennas.every((a: any) => a.online) ? '#4caf50'
                    : antennas.some((a: any) => a.online) ? '#ff9800'
                    : '#888',
                  fontSize: 18, mr: 1
                }} />
                {antennas.filter((a: any) => a.online).length} / {antennas.length} online
              </span>
            </>
          }
        >
          <Paper elevation={3} sx={{ p: 2, mb: 3, background: 'rgba(35,39,43,0.98)', borderRadius: 5 }}>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="antennas" direction="horizontal">
                {(provided: any, _snapshot: any) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, p: 1 }} ref={provided.innerRef} {...provided.droppableProps}>
                    {orderedAntennas.length === 0 && <Typography sx={{ color: '#aaa' }}>No antennas found.</Typography>}
                    {orderedAntennas.map((ant: any, idx: number) => (
                      <Draggable key={getAntennaKey(ant)} draggableId={getAntennaKey(ant)} index={idx}>
                        {(dragProvided: any, dragSnapshot: any) => (
                          <Paper
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            elevation={2}
                            sx={{
                              minWidth: 240,
                              maxWidth: 240,
                              width: 240,
                              p: 2,
                              background: '#1B1F22',
                              borderRadius: 3,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              gap: 1,
                              boxShadow: dragSnapshot.isDragging ? '0 4px 16px 0 #2196f3aa' : '0 2px 8px 0 #0004',
                              opacity: dragSnapshot.isDragging ? 0.85 : 1,
                            }}
                          >
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', gap: 1 }}>
                              {ant.name || 'Unknown'}
                              <CircleIcon sx={{ color: ant.online ? '#4caf50' : '#888', fontSize: 16, ml: 1 }} titleAccess={ant.online ? 'Online' : 'Offline'} />
                              {/* PTP Locked Icon */}
                              {ant.lockState === 2 && (
                                <Tooltip title="PTP Locked">
                                  <span>
                                    <PTPLockedIcon sx={{ color: '#4caf50', fontSize: 18, ml: 1, verticalAlign: 'middle' }} />
                                  </span>
                                </Tooltip>
                              )}
                              <Tooltip title={typeof ant.radioActivatedState !== 'undefined' ? (ant.radioActivatedState === 1 ? 'Radio Enabled' : 'Radio Disabled') : 'Radio status unknown'}>
                                <span>
                                  <RadioIcon sx={{
                                    color: ant.radioActivatedState === 1 ? '#4caf50' : '#888',
                                    fontSize: 18,
                                    ml: 1,
                                    verticalAlign: 'middle',
                                  }} />
                                </span>
                              </Tooltip>
                              {/* PTP Master Icon */}
                              {ant.ptpState === 2 && (
                                <Tooltip title="PTP Master">
                                  <span>
                                    <PTPMasterIcon sx={{ color: '#4caf50', fontSize: 18, ml: 1, verticalAlign: 'middle' }} />
                                  </span>
                                </Tooltip>
                              )}
                            </Typography>
                            {ant.ip && <Typography variant="body2" sx={{ color: '#aaa' }}>IP: {ant.ip}</Typography>}
                            {/* Show number of connected beltpacks for this antenna */}
                            <Typography variant="body2" sx={{ color: '#aaa' }}>
                              Connected Beltpacks: {belts.filter((b: any) => b.antenna && b.antenna.name === ant.name).length}
                            </Typography>
                            {(ant.userId || ant.nodeId) && (
                              <Typography variant="body2" sx={{ color: '#aaa' }}>
                                Antenna ID: {ant.userId ?? ant.nodeId}
                              </Typography>
                            )}
                          </Paper>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </DragDropContext>
          </Paper>
        </CollapsibleSection>
        </Box>
        {/* Beltpacks Section */}
        <CollapsibleSection
          title={
              <>
                <strong style={{ fontWeight: 700 }}>Beltpacks</strong>
                <span style={{ display: 'inline-flex', alignItems: 'center', marginLeft: 12, fontWeight: 600, fontSize: 17 }}>
                <CircleIcon sx={{ color: (belts.length > 0 && belts.some((b: any) => b.config?.registered && b.runtime)) ? '#4caf50' : '#888', fontSize: 18, mr: 1 }} />
                {belts.filter((b: any) => b.config?.registered && b.runtime).length} / {belts.length} online
              </span>
            </>
          }
        >
          <Paper elevation={3} sx={{ p: 2, background: 'rgba(35,39,43,0.98)', maxWidth: 'none', overflowX: 'auto', borderRadius: 5 }}>
            {/* Removed duplicate Beltpacks title, only CollapsibleSection header remains */}
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              textColor="inherit"
              indicatorColor="secondary"
              sx={{
                mb: 2,
                '& .MuiTabs-indicator': {
                  backgroundColor:
                    tab === 'all' ? '#fff' :
                    tab === 'online' ? '#4caf50' :
                    tab === 'offline' ? '#e53935' : '#fff',
                  height: 3,
                },
              }}
            >
              <Tab value="all" label={`All (${belts.length})`} />
              <Tab value="online" label={`Online (${belts.filter((b: any) => b.config?.registered && b.runtime).length})`} />
              <Tab value="offline" label={`Offline (${belts.filter((b: any) => !b.config?.registered || !b.runtime).length})`} />
            </Tabs>
            <Box sx={{ width: '100%', p: 1, overflowX: 'auto' }}>
              <DataGrid
                rows={mapBeltsToRows(filteredBelts).map(row => ({ ...row, onInfo: () => handleInfoClick(row) }))}
                columns={columns}
                hideFooter
                autoHeight
                disableRowSelectionOnClick
                sx={{
                  // minWidth: 900,
                  background: '#23272B',
                  border: 0,
                  color: '#fff',
                  fontSize: 16,
                  boxShadow: '0 4px 24px 0 #0006',
                  borderRadius: 5,
                  overflow: 'auto',
                  '& .MuiDataGrid-cell': { borderBottom: '1px solid #333' },
                  '& .MuiDataGrid-columnHeaders': { background: '#23272B', color: '#ccc', fontWeight: 700, fontSize: 17 },
                  '& .info-cell': {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    minHeight: 'inherit',
                    padding: 0,
                  },
                }}
              />
            </Box>
          </Paper>
        </CollapsibleSection>
      </Container>
      <Dialog open={!!infoRow} onClose={() => setInfoRow(null)}
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: '#23272B',
            color: '#fff',
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: 22, letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>Beltpack Information</span>
          <span style={{ fontWeight: 400, fontSize: 18, marginLeft: 8 }}>(BETA)</span>
        </DialogTitle>
        <DialogContent dividers>
          {infoRow && (
            <Box sx={{ minWidth: 300 }}>
              <div><b>Name:</b> {infoRow.bpName}</div>
              <div><b>ID:</b> {infoRow.id}</div>
              <div><b>Serial Number:</b> {infoRow.ipei ? (Array.isArray(infoRow.ipei) ? infoRow.ipei.join('-') : infoRow.ipei) : '-'}</div>
              <div><b>Firmware Version:</b> {infoRow.firmware ?? infoRow.packageVersion ?? '-'}</div>
              <br />
              <div><b>Battery Charge Status:</b> {typeof infoRow.battery === 'number' ? `${infoRow.battery}%` : (infoRow.battery ? `${infoRow.battery}` : '-')}</div>
              <div><b>Battery Health:</b> {infoRow.batteryHealth ?? '-'}</div>
              <div><b>Battery Max Capacity:</b> {infoRow.batteryMaxCapacity ?? '-'}</div>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoRow(null)} color="inherit">Close</Button>
        </DialogActions>
      </Dialog>
      <Box component="footer" sx={{
        width: '100%',
        mt: 6,
        py: 2,
        background: '#181C1F',
        color: '#aaa',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 500,
        letterSpacing: 0.5,
        borderTop: '1px solid #23272B',
      }}>
        Monitoring Dashboard created by Jake Boulter
      </Box>
    </ThemeProvider>
  );
}

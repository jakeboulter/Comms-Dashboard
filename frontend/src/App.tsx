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
import SaveIcon from '@mui/icons-material/Save';
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
            {(!mode || mode === 'headset') && <HeadsetIcon sx={{ color: '#fff' }} titleAccess="Headset" />}
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
        sx={{ color: '#90caf9', cursor: 'pointer', fontSize: 24 }}
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
  // Intercom panels state, persisted in localStorage
  const [panels, setPanels] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('intercomPanels');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  // Intercom panel order (array of IPs)
  const [panelOrder, setPanelOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('intercomPanelOrder');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
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
  const [panelIpInput, setPanelIpInput] = useState('');
  const [panelNameInput, setPanelNameInput] = useState('');
  // Add panel by IP
  const handleAddPanel = async () => {
    const ip = panelIpInput.trim();
    const name = panelNameInput.trim();
    if (!ip || !name) return;
    // Remove any previous panel with this IP before adding
    const filteredPanels = panels.filter((p) => p.ip !== ip);
    // Ping immediately
    const online = await pingPanel(ip);
    const newPanels = [...filteredPanels, { ip, name, online }];
    setPanels(newPanels);
    // Remove from order if present, then add to end
    const filteredOrder = panelOrder.filter((id) => id !== ip);
    const newOrder = [...filteredOrder, ip];
    setPanelOrder(newOrder);
    try {
      localStorage.setItem('intercomPanels', JSON.stringify(newPanels));
      localStorage.setItem('intercomPanelOrder', JSON.stringify(newOrder));
    } catch {}
    setPanelIpInput('');
    setPanelNameInput('');
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
      if (!cancelled) {
        setPanels(updated);
        try { localStorage.setItem('intercomPanels', JSON.stringify(updated)); } catch {}
        // Update ping history for each panel
        setPingHistory(prev => {
          const newHist = { ...prev };
          for (const panel of updated) {
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
      }
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

  // Keep panelOrder in sync with panels (add new IPs, remove missing)
  useEffect(() => {
    const panelIps = panels.map((p: any) => p.ip);
    setPanelOrder((prev) => {
      let newOrder = prev.filter(ip => panelIps.includes(ip));
      panelIps.forEach(ip => { if (!newOrder.includes(ip)) newOrder.push(ip); });
      if (JSON.stringify(newOrder) !== JSON.stringify(prev)) {
        try { localStorage.setItem('intercomPanelOrder', JSON.stringify(newOrder)); } catch {}
      }
      return newOrder;
    });
  }, [JSON.stringify(panels.map((p: any) => p.ip))]);

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
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar sx={{ minHeight: 64, display: 'flex', alignItems: 'center', px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', height: 48, mr: 2 }}>
            <CTLogo style={{ height: 48, width: 'auto', display: 'block' }} />
          </Box>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600, textAlign: 'center', width: '100%' }}>
            Network Monitoring Dashboard
          </Typography>
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
            <InternetIcon
              sx={{ color: internetOnline === null ? '#aaa' : internetOnline ? '#4caf50' : '#888', fontSize: 32, ml: 2 }}
              titleAccess={internetOnline === null ? 'Checking internet...' : internetOnline ? 'Internet reachable' : 'No internet'}
            />
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth={false} sx={{ mt: 4, px: 0 }}>
        {/* Date/time and overview stats box */}
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
          <Box sx={{
            background: '#23272B',
            borderRadius: 3,
            px: 3,
            py: 2,
            minWidth: 320,
            display: 'inline-flex',
            alignItems: 'center',
            boxShadow: '0 2px 8px 0 #0004',
            flexDirection: 'column',
            gap: 1.5,
          }}>
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
              {netName && ` - ${netName}`}
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, pl: 1 }}>
              <TextField
                size="small"
                label="Switch Name"
                variant="outlined"
                value={switchNameInput}
                onChange={e => setSwitchNameInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddSwitch(); }}
                sx={{ background: '#23272B', input: { color: '#fff' }, label: { color: '#90caf9' }, minWidth: 140 }}
                InputProps={{ style: { color: '#fff' } }}
              />
              <TextField
                size="small"
                label="Switch IP"
                variant="outlined"
                value={switchIpInput}
                onChange={e => setSwitchIpInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddSwitch(); }}
                sx={{ background: '#23272B', input: { color: '#fff' }, label: { color: '#90caf9' }, minWidth: 140 }}
                InputProps={{ style: { color: '#fff' } }}
              />
              <IconButton color="primary" onClick={handleAddSwitch} sx={{ ml: 1 }}>
                <AddIcon />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, p: 1 }}>
              {switches.length === 0 && <Typography sx={{ color: '#aaa' }}>No switches configured.</Typography>}
              <DragDropContext
                onDragEnd={(result: DropResult) => {
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
              {netName && ` - ${netName}`}
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, pl: 1 }}>
              <TextField
                size="small"
                label="Panel Name"
                variant="outlined"
                value={panelNameInput}
                onChange={e => setPanelNameInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddPanel(); }}
                sx={{ background: '#23272B', input: { color: '#fff' }, label: { color: '#90caf9' }, minWidth: 140 }}
                InputProps={{ style: { color: '#fff' } }}
              />
              <TextField
                size="small"
                label="Panel IP"
                variant="outlined"
                value={panelIpInput}
                onChange={e => setPanelIpInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddPanel(); }}
                sx={{ background: '#23272B', input: { color: '#fff' }, label: { color: '#90caf9' }, minWidth: 140 }}
                InputProps={{ style: { color: '#fff' } }}
              />
              <IconButton color="primary" onClick={handleAddPanel} sx={{ ml: 1 }}>
                <AddIcon />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, p: 1 }}>
              {panels.length === 0 && <Typography sx={{ color: '#aaa' }}>No panels found.</Typography>}
              <DragDropContext
                onDragEnd={(result: DropResult) => {
                  if (!result.destination) return;
                  const from = result.source.index;
                  const to = result.destination.index;
                  const newOrder = Array.from(panelOrder);
                  const [removed] = newOrder.splice(from, 1);
                  newOrder.splice(to, 0, removed);
                  setPanelOrder(newOrder);
                  try { localStorage.setItem('intercomPanelOrder', JSON.stringify(newOrder)); } catch {}
                }}
              >
                <Droppable droppableId="intercom-panels" direction="horizontal">
                  {(provided: DroppableProvided) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, p: 1 }} ref={provided.innerRef} {...provided.droppableProps}>
                      {panelOrder
                        .map(ip => panels.find((p: any) => p.ip === ip))
                        .filter(Boolean)
                        .concat(panels.filter((p: any) => !panelOrder.includes(p.ip)))
                        .map((panel: any, idx: number) => {
                          const hist = pingHistory[panel.ip] || { timestamps: [], values: [] };
                          const handleDelete = () => {
                            const ipToDelete = panel.ip;
                            const newPanels = panels.filter((p: any) => p.ip !== ipToDelete);
                            setPanels(newPanels);
                            const newOrder = panelOrder.filter((id) => id !== ipToDelete);
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

        {/* Antennas Section */}
        <Box sx={{ mb: 5 }}>
        <CollapsibleSection
          title={
            <>
              <strong style={{ fontWeight: 700 }}>Antennas</strong>
              {netName && ` - ${netName}`}
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
              {netName && ` - ${netName}`}
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
              textColor="primary"
              indicatorColor="primary"
              sx={{ mb: 2 }}
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
                  '& .MuiDataGrid-columnHeaders': { background: '#23272B', color: '#90caf9', fontWeight: 700, fontSize: 17 },
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
          <Button onClick={() => setInfoRow(null)} color="primary">Close</Button>
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

// Utility to fetch and parse /config/ports for a switch
import axios from 'axios';

export interface SwitchPort {
  port: number;
  status: 'Up' | 'Down';
  speed: string;
}

export async function fetchSwitchPorts(ip: string, _auth?: string): Promise<SwitchPort[]> {
  try {
    // Use backend proxy endpoint to avoid CORS
    const backend = (import.meta as any).env.VITE_BACKEND_URL || '';
    const res = await axios.get(`${backend}/api/switchPorts?ip=${encodeURIComponent(ip)}`, {
      timeout: 4000,
    });
    const text = typeof res.data === 'string' ? res.data : '';
    return parseSwitchPorts(text);
  } catch (e) {
    return [];
  }
}

export function parseSwitchPorts(text: string): SwitchPort[] {
  if (!text) return [];
  return text.split('|').map((entry) => {
    const fields = entry.split('/');
    return {
      port: Number(fields[0]),
      status: fields[9] === 'Up' ? 'Up' : 'Down',
      speed: fields[10] || '',
    };
  }).filter(p => !isNaN(p.port) && p.port !== 0);
}

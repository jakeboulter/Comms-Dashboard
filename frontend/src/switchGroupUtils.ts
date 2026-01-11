// Utility to fetch and parse /config/groups for a switch
import axios from 'axios';

export interface SwitchGroup {
  groupId: number;
  groupName: string;
  portNumbers: number[];
}

export async function fetchSwitchGroups(ip: string): Promise<SwitchGroup[]> {
  try {
    const backend = (import.meta as any).env.VITE_BACKEND_URL || '';
    const res = await axios.get(`${backend}/api/switchGroups?ip=${encodeURIComponent(ip)}`, {
      timeout: 4000,
    });
    const text = typeof res.data === 'string' ? res.data : '';
    return parseSwitchGroups(text);
  } catch (e) {
    return [];
  }
}

export function parseSwitchGroups(text: string): SwitchGroup[] {
  if (!text) return [];
  return text.split('|').map((entry) => {
    const fields = entry.split('/');
    const groupId = Number(fields[0]);
    const groupName = decodeURIComponent(fields[2] || '');
    // Port numbers are comma-separated in the 4th field
    const portNumbers = (fields[3] || '').split(',').map(Number).filter(n => !isNaN(n));
    return { groupId, groupName, portNumbers };
  }).filter(g => g.groupName && g.portNumbers.length > 0);
}

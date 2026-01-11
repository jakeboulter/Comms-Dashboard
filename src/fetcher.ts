import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BOLERO_HOST = process.env.BOLERO_HOST;
const AUTH = {
  username: process.env.BOLERO_USER || '',
  password: process.env.BOLERO_PASS || ''
};

const USE_SAMPLE = !BOLERO_HOST;
if (USE_SAMPLE) {
  // eslint-disable-next-line no-console
  console.warn('BOLERO_HOST not set — running in dev mode using sample data');
}

async function getJson(path: string) {
  if (USE_SAMPLE) {
    const map: Record<string, string> = {
      '/rest/bp': './sampleData/bp.sample.json',
      '/rest/nodeStatus': './sampleData/nodeStatus.sample.json',
      '/rest/nodeConfig': './sampleData/nodeConfig.sample.json',
    };
    const file = map[path];
    if (!file) throw new Error(`No sample available for ${path}`);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(file);
  }

  const url = `${BOLERO_HOST}${path}`;
  const axiosOpts: any = { timeout: 5000, validateStatus: () => true };
  if (AUTH.username) axiosOpts.auth = AUTH; // only send auth if username provided
  const resp = await axios.get(url, axiosOpts);
  if (resp.status >= 200 && resp.status < 300) return resp.data;
  throw new Error(`Failed ${url}: ${resp.status} ${resp.statusText}`);
}

export async function fetchBp() {
  return getJson('/rest/bp');
}

export async function fetchNodeStatus() {
  return getJson('/rest/nodeStatus');
}

export async function fetchNodeConfig() {
  return getJson('/rest/nodeConfig');
}

export async function fetchAll() {
  const [bp, nodeStatus, nodeConfig] = await Promise.all([fetchBp(), fetchNodeStatus(), fetchNodeConfig()]);
  return { bp, nodeStatus, nodeConfig };
}

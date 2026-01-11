import { createCache } from './cache';
import { fetchAll } from './fetcher';
import { mergeData } from './mapper';
import { BeltpackView } from './types';

const POLL_KEY = 'bolero:latest';

export interface PollerOpts {
  fastIntervalMs?: number; // nodeStatus
  slowIntervalMs?: number; // bp/nodeConfig
  ttlMs?: number;
  retryBaseMs?: number; // base ms for retry backoff (tests can override)
}

export class Poller {
  private cache = createCache();
  private fastIntervalMs: number;
  private slowIntervalMs: number;
  private ttlMs: number;
  private fastTimer: NodeJS.Timeout | null = null;
  private slowTimer: NodeJS.Timeout | null = null;
  private onUpdate?: (data: BeltpackView[]) => void;
  private lastSuccess: number | null = null;
  private lastError: string | null = null;
  
  constructor(opts: PollerOpts = {}) {
    this.fastIntervalMs = opts.fastIntervalMs ?? (Number(process.env.POLL_FAST_MS) || 5000);
    this.slowIntervalMs = opts.slowIntervalMs ?? (Number(process.env.POLL_SLOW_MS) || 30000);
    this.ttlMs = opts.ttlMs ?? (Number(process.env.CACHE_TTL_MS) || 10000);
  }

  on(event: 'update', cb: (data: BeltpackView[]) => void) {
    if (event === 'update') this.onUpdate = cb;
  }

  getLastSuccess() {
    return this.lastSuccess;
  }

  getLastError() {
    return this.lastError;
  }

  async start() {
    await this.tick(); // initial fetch
    this.fastTimer = setInterval(() => this.tick().catch(console.error), this.fastIntervalMs);
    this.slowTimer = setInterval(() => this.tick().catch(console.error), this.slowIntervalMs);
  }

  async stop() {
    if (this.fastTimer) clearInterval(this.fastTimer);
    if (this.slowTimer) clearInterval(this.slowTimer);
  }

  private async tick() {
    const maxAttempts = 3;
    let attempt = 0;
    let lastErr: any = null;
    const base = (this as any).retryBaseMs ?? (Number(process.env.POLL_RETRY_BASE_MS) || 500);

    while (attempt < maxAttempts) {
      try {
        const { bp, nodeStatus, nodeConfig } = await fetchAll();
        const merged = mergeData(bp, nodeStatus, nodeConfig);
        await this.cache.set(POLL_KEY, merged, this.ttlMs);
        this.onUpdate?.(merged);
        this.lastSuccess = Date.now();
        this.lastError = null;
        return;
      } catch (err: any) {
        lastErr = err;
        attempt += 1;
        const delay = base * Math.pow(2, attempt - 1);
        // eslint-disable-next-line no-console
        console.warn(`poll attempt ${attempt} failed: ${err.message}, retrying in ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    // all attempts failed
    this.lastError = lastErr ? (lastErr.message || String(lastErr)) : 'unknown error';
    // eslint-disable-next-line no-console
    console.error('poll failed after retries:', this.lastError);
  }

  async getLatest(): Promise<BeltpackView[] | null> {
    return this.cache.get<BeltpackView[]>(POLL_KEY);
  }
}

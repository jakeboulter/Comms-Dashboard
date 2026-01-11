import Redis from 'ioredis';

export interface CacheBackend {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlMs?: number): Promise<void>;
}

class MemoryCache implements CacheBackend {
  private store = new Map<string, { expiresAt: number | null; value: any }>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    const expiresAt = ttlMs ? Date.now() + ttlMs : null;
    this.store.set(key, { expiresAt, value });
  }
}

export class RedisCache implements CacheBackend {
  private client: Redis;
  constructor(url: string) {
    this.client = new Redis(url);
  }

  async get<T>(key: string): Promise<T | null> {
    const v = await this.client.get(key);
    if (!v) return null;
    return JSON.parse(v) as T;
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    const payload = JSON.stringify(value);
    if (ttlMs) {
      await this.client.set(key, payload, 'PX', ttlMs);
    } else {
      await this.client.set(key, payload);
    }
  }
}

// factory
export function createCache(): CacheBackend {
  const redisUrl = process.env.REDIS_URL || '';
  if (redisUrl) return new RedisCache(redisUrl);
  return new MemoryCache();
}

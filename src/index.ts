import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { fetchAll } from './fetcher';
import { mergeData } from './mapper';
import { Poller } from './poller';

dotenv.config();

export function createApp() {
  const app = express();
  const poller = new Poller();

  app.get('/api/status', async (req, res) => {
    try {
      const latest = await poller.getLatest();
      if (latest) return res.json({ belts: latest });

      // fallback to direct fetch
      const { bp, nodeStatus, nodeConfig } = await fetchAll();
      const merged = mergeData(bp, nodeStatus, nodeConfig);
      res.json({ belts: merged });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', lastUpdate: poller.getLastSuccess() ?? null, lastError: poller.getLastError() ?? null });
  });

  return { app, poller };
}

export async function startServer(port = Number(process.env.PORT) || 3000) {
  const { app, poller } = createApp();
  const server = http.createServer(app);
  const io = new SocketIOServer(server, { cors: { origin: '*' } });

  io.on('connection', async (socket) => {
    // eslint-disable-next-line no-console
    console.log('client connected', socket.id);
    try {
      const latest = await poller.getLatest();
      if (latest) socket.emit('bolero:update', latest);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('error sending latest to client', err);
    }
  });

  poller.on('update', (data) => {
    io.emit('bolero:update', data);
  });

  await poller.start();
  return new Promise<{ server: http.Server; poller: Poller }>((resolve) => {
    server.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`bolero backend listening on ${port}`);
      resolve({ server, poller });
    });
  });
}

// if run directly, start the server
if (require.main === module) {
  // eslint-disable-next-line no-console
  startServer().catch((err) => console.error(err));
}

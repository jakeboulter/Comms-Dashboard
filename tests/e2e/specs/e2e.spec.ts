import { test, expect } from '@playwright/test';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { startServer } from '../../../src/index';

// helper to serve the static test page
function createStaticServer() {
  const server = http.createServer((req, res) => {
    const url = req.url || '/';
    if (url.startsWith('/test-page.html') || url === '/') {
      const p = path.join(__dirname, '..', 'test-page.html');
      const html = fs.readFileSync(p, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
      return;
    }
    res.writeHead(404);
    res.end('not found');
  });
  return server;
}

let backendObj: any;
let staticServer: http.Server;
let staticPort: number;

test.beforeAll(async () => {
  backendObj = await startServer(0);
  staticServer = createStaticServer();

  await new Promise<void>((resolve) => {
    const s = staticServer.listen(0, '127.0.0.1', () => {
      // @ts-ignore
      staticPort = (s.address() as any).port;
      resolve();
    });
  });
});

test.afterAll(async () => {
  if (staticServer) staticServer.close();
  if (backendObj) {
    const { server, poller } = backendObj;
    if (poller && poller.stop) await poller.stop();
    if (server && server.close) await new Promise((r) => server.close(r));
  }
});

test('page shows belts count from backend', async ({ page }) => {
  const backendPort = (backendObj.server.address() as any).port;
  await page.goto(`http://127.0.0.1:${staticPort}/test-page.html?backend=http://127.0.0.1:${backendPort}`);

  // wait until bp-count is populated
  await expect(page.locator('#bp-count')).toHaveText(/\d+ belts/, { timeout: 5000 });
});

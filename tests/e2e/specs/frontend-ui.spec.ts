import { test, expect } from '@playwright/test';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { startServer } from '../../../src/index';
import { execSync } from 'child_process';

// serve the built frontend (frontend/dist)
function createFrontendServer(distPath: string) {
  const server = http.createServer((req, res) => {
    const url = req.url || '/';
    let filePath = path.join(distPath, url.split('?')[0]);
    if (filePath.endsWith('/') || path.extname(filePath) === '') {
      filePath = path.join(distPath, 'index.html');
    }

    if (!filePath.startsWith(distPath)) {
      res.writeHead(403);
      res.end('forbidden');
      return;
    }

    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      const type = ext === '.js' ? 'application/javascript' : ext === '.css' ? 'text/css' : 'text/html';
      res.writeHead(200, { 'Content-Type': type });
      res.end(fs.readFileSync(filePath));
      return;
    }

    res.writeHead(404);
    res.end('not found');
  });
  return server;
}

async function ensureFrontendBuilt(backendPort: number) {
  const distPath = path.join(__dirname, '..', '..', '..', 'frontend', 'dist');
  if (!fs.existsSync(distPath)) {
    // build with VITE_BACKEND_URL set to backend
    console.log('Building frontend for E2E...');
    execSync(`npm run build`, {
      cwd: path.join(__dirname, '..', '..', '..', 'frontend'),
      stdio: 'inherit',
      env: { ...process.env, VITE_BACKEND_URL: `http://127.0.0.1:${backendPort}` },
    });
  } else {
    // still set backend at build-time; rebuild to ensure correct backend URL
    console.log('Rebuilding frontend for E2E with backend URL...');
    execSync(`npm run build`, {
      cwd: path.join(__dirname, '..', '..', '..', 'frontend'),
      stdio: 'inherit',
      env: { ...process.env, VITE_BACKEND_URL: `http://127.0.0.1:${backendPort}` },
    });
  }
  return path.join(__dirname, '..', '..', '..', 'frontend', 'dist');
}

let backendObj: any;
let frontendServer: http.Server;
let frontendPort: number;

test.beforeAll(async () => {
  backendObj = await startServer(0);
  const backendPort = (backendObj.server.address() as any).port;

  const dist = await ensureFrontendBuilt(backendPort);
  frontendServer = createFrontendServer(dist);
  await new Promise<void>((resolve) => {
    const s = frontendServer.listen(0, '127.0.0.1', () => {
      // @ts-ignore
      frontendPort = (s.address() as any).port;
      resolve();
    });
  });
});

test.afterAll(async () => {
  if (frontendServer) frontendServer.close();
  if (backendObj) {
    const { server, poller } = backendObj;
    if (poller && poller.stop) await poller.stop();
    if (server && server.close) await new Promise((r) => server.close(r));
  }
});

test('built frontend shows belts in table', async ({ page }) => {
  await page.goto(`http://127.0.0.1:${frontendPort}/`);

  // Wait for table rows to appear
  const rows = page.locator('table tbody tr');
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);

  // also check that a known belt name from sample appears (e.g., 'Wissam' or 'Gabriel')
  await expect(page.locator('table')).toContainText('Wissam');
});

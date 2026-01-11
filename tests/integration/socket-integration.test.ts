import { startServer, createApp } from '../../src/index';
import ioClient from 'socket.io-client';

jest.mock('../../src/fetcher', () => ({
  fetchAll: jest.fn().mockResolvedValue({
    bp: require('../../src/sampleData/bp.sample.json'),
    nodeStatus: require('../../src/sampleData/nodeStatus.sample.json'),
    nodeConfig: require('../../src/sampleData/nodeConfig.sample.json'),
  }),
}));

let serverObj: any;

describe('Socket integration', () => {
  beforeAll(async () => {
    serverObj = await startServer(0) as any; // 0 picks random free port
  }, 20000);

  afterAll(async () => {
    if (serverObj) {
      const { server, poller } = serverObj;
      if (poller && poller.stop) await poller.stop();
      if (server && server.close) await new Promise((r) => server.close(r));
    }
  });

  it('emits bolero:update on connection', (done) => {
    const address = serverObj.server.address();
    const port = address.port;
    const socket = ioClient(`http://127.0.0.1:${port}`);

    socket.on('connect', () => {
      // wait for update event
    });

    socket.on('bolero:update', (data: any) => {
      expect(Array.isArray(data)).toBe(true);
      socket.close();
      done();
    });

    socket.on('connect_error', (err: any) => done.fail(err));
  }, 10000);
});

import { Poller } from '../src/poller';

jest.mock('../src/fetcher', () => ({
  fetchAll: jest.fn().mockResolvedValue({
    bp: require('../src/sampleData/bp.sample.json'),
    nodeStatus: require('../src/sampleData/nodeStatus.sample.json'),
    nodeConfig: require('../src/sampleData/nodeConfig.sample.json'),
  }),
}));

describe('Poller', () => {
  it('stores and returns latest data', async () => {
    const poller = new Poller({ fastIntervalMs: 1000, slowIntervalMs: 2000, ttlMs: 5000 });
    await poller.start();
    // wait a short time for tick to run
    await new Promise((r) => setTimeout(r, 100));
    const latest = await poller.getLatest();
    expect(latest).not.toBeNull();
    await poller.stop();
  });

  it('calls onUpdate when data is refreshed', async () => {
    const poller = new Poller({ fastIntervalMs: 1000, slowIntervalMs: 2000, ttlMs: 5000 });
    const cb = jest.fn();
    poller.on('update', cb);
    await poller.start();
    await new Promise((r) => setTimeout(r, 100));
    expect(cb).toHaveBeenCalled();
    await poller.stop();
  });
});

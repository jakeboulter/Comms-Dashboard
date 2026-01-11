import { Poller } from '../src/poller';
import * as fetcher from '../src/fetcher';

describe('Poller retry', () => {
  it('retries on failure and sets lastError when all attempts fail', async () => {
    const fn = jest.spyOn(fetcher, 'fetchAll').mockRejectedValue(new Error('boom'));
    const poller = new Poller({ fastIntervalMs: 10000, slowIntervalMs: 20000, ttlMs: 1000, retryBaseMs: 1 });

    // call private tick via any cast
    // @ts-ignore
    await poller['tick']();

    expect(poller.getLastError()).toContain('boom');
    fn.mockRestore();
  });

  it('succeeds when a retry eventually works', async () => {
    const seq: any[] = [Promise.reject(new Error('boom')), Promise.resolve({
      bp: require('../src/sampleData/bp.sample.json'),
      nodeStatus: require('../src/sampleData/nodeStatus.sample.json'),
      nodeConfig: require('../src/sampleData/nodeConfig.sample.json')
    })];
    const fn = jest.spyOn(fetcher, 'fetchAll').mockImplementation(() => seq.shift());

    const poller = new Poller({ fastIntervalMs: 10000, slowIntervalMs: 20000, ttlMs: 1000, retryBaseMs: 1 });
    // @ts-ignore
    await poller['tick']();

    expect(poller.getLastError()).toBeNull();
    expect(poller.getLastSuccess()).not.toBeNull();
    fn.mockRestore();
  });
});

import { mergeData } from '../src/mapper';
import bp from '../src/sampleData/bp.sample.json';
import nodeStatus from '../src/sampleData/nodeStatus.sample.json';
import nodeConfig from '../src/sampleData/nodeConfig.sample.json';

describe('mergeData', () => {
  it('merges bp, nodeStatus and nodeConfig into BeltpackView', () => {
    const views = mergeData(bp, nodeStatus, nodeConfig);
    expect(views).toHaveLength(2);
    const w = views.find((v) => v.id === 13)!;
    expect(w.config?.bpName).toBe('Wissam');
    expect(w.runtime?.battery?.status).toBe(73);
    expect(w.antenna?.name).toBe('Master');
  });
});

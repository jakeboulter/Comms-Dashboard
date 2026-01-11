import { Antenna, BeltpackConfig, BeltpackRuntime, BeltpackView } from './types';

export function mergeData(
  bpResp: any,
  nodeStatusResp: any,
  nodeConfigResp: any
): BeltpackView[] {
  const antennas: Record<number, Antenna> = {};

  // nodeConfig contains nodeConfig: [...]
  const nodes = nodeConfigResp?.nodeConfig || [];
  for (const n of nodes) {
    antennas[n.nodeId] = { nodeId: n.nodeId, name: n.name, ip: n.ip?.ip, maxBPs: n.maxBPsOnAntenna };
  }

  // build runtime mapping: bpId -> runtime + antenna
  const runtimeMap: Record<number, { runtime: BeltpackRuntime; antenna?: Antenna }> = {};
  for (const node of nodeStatusResp?.nodeStatus || []) {
    const nodeId = node.nodeId;
    const ant = antennas[nodeId] || { nodeId, name: String(nodeId), ip: node.ip };

    for (const rbp of node.bp || []) {
      runtimeMap[rbp.id] = {
        runtime: {
          id: rbp.id,
          battery: rbp.battery,
          signalLevel: rbp.signalLevel,
          timeslots: rbp.timeslots,
          packageVersion: rbp.packageVersion
        },
        antenna: ant
      };
    }
  }

  // configs
  const configs: Record<number, BeltpackConfig> = {};
  for (const c of bpResp?.bp || []) {
    configs[c.id] = {
      id: c.id,
      bpNumber: c.bpConfig?.bpNumber,
      bpName: c.bpConfig?.bpName,
      registered: c.registered,
      ipei: c.ipei,
      bpType: c.bpType,
      lastConnectTime: c.lastConnectTime
    };
  }

  // build final view: include all configured BPs, plus any runtime-only BPs
  const ids = new Set<number>([...Object.keys(configs).map(Number), ...Object.keys(runtimeMap).map(Number)]);

  const views: BeltpackView[] = [];
  ids.forEach((id) => {
    views.push({
      id,
      config: configs[id],
      runtime: runtimeMap[id]?.runtime,
      antenna: runtimeMap[id]?.antenna ?? null
    });
  });

  return views.sort((a, b) => a.id - b.id);
}

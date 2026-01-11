export type Antenna = {
  nodeId: number;
  name: string;
  ip?: string;
  maxBPs?: number;
};

export type BeltpackConfig = {
  id: number;
  bpNumber?: number;
  bpName?: string;
  registered?: boolean;
  ipei?: number[];
  bpType?: number;
  lastConnectTime?: number;
};

export type BeltpackRuntime = {
  id: number;
  battery?: { status?: number; currentCharge?: number; batteryTemperature?: number; batteryHealth?: number };
  signalLevel?: number;
  timeslots?: { free?: number; usable?: number; interfered?: number; warning?: number };
  packageVersion?: string;
};

export type BeltpackView = {
  id: number;
  config?: BeltpackConfig;
  runtime?: BeltpackRuntime;
  antenna?: Antenna | null;
};

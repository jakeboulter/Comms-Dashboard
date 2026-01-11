import { fetchAll } from './fetcher';
import { mergeData } from './mapper';

async function main() {
  try {
    const { bp, nodeStatus, nodeConfig } = await fetchAll();
    const merged = mergeData(bp, nodeStatus, nodeConfig);
    console.log(JSON.stringify(merged, null, 2));
  } catch (err: any) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

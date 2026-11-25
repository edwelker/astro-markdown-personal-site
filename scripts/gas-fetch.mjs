import { runETL } from './lib-etl.mjs';
import { fetchOrThrow, runIfMain } from './lib-utils.mjs';

export const REPO_BASE = 'https://raw.githubusercontent.com/edwelker/find_cheap_local_gas/master';
export const FILES = {
  md: 'latest_Maryland_ALL_Columbia_EC_Severn.csv',
  ny: 'latest_Long_Island_East_End.csv',
  ma: 'latest_Western_Mass_I-91_Corridor.csv',
  frederick: 'latest_Central_MD_Columbia_to_Frederick_Corridor.csv',
};

export async function fetchGasData() {
  const entries = await Promise.all(
    Object.entries(FILES).map(async ([region, filename]) => {
      const res = await fetchOrThrow(`${REPO_BASE}/${filename}`);
      return [region, await res.text()];
    })
  );
  return Object.fromEntries(entries);
}

export function parseCSV(text) {
  if (!text || !text.trim()) return [];

  const lines = text.trim().split('\n');
  const headers = lines
    .shift()
    .split(',')
    .map((h) => h.trim());

  return lines.map((line) => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    return headers.reduce((obj, header, index) => {
      let val = values[index] || '';
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      obj[header] = val;
      return obj;
    }, {});
  });
}

function stationSortKey(station) {
  return [station.Zip ?? '', station.Address ?? '', station.Station ?? '', station.City ?? ''].join(
    '|'
  );
}

export function sortStationsDeterministically(stations) {
  return [...stations].sort((a, b) => {
    const keyA = stationSortKey(a);
    const keyB = stationSortKey(b);
    if (keyA < keyB) return -1;
    if (keyA > keyB) return 1;
    return 0;
  });
}

export function transformGasData(rawData) {
  const result = {};
  for (const [region, csv] of Object.entries(rawData)) {
    result[region] = sortStationsDeterministically(parseCSV(csv));
  }
  return result;
}

export async function run() {
  await runETL({
    name: 'Gas Prices',
    fetcher: fetchGasData,
    transform: transformGasData,
    outFile: 'src/data/gas.json',
    defaultData: { md: [], ny: [], ma: [], frederick: [] },
  });
}

runIfMain(import.meta.url, run);

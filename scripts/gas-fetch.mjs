import { runETL } from './lib-etl.mjs';
import { fileURLToPath } from 'node:url';

export const REPO_BASE = 'https://raw.githubusercontent.com/edwelker/find_cheap_local_gas/master';
export const FILES = {
  md: 'latest_Maryland_ALL_Columbia_EC_Severn.csv',
  ny: 'latest_Long_Island_East_End.csv',
  ma: 'latest_Western_Mass_I-91_Corridor.csv'
};

export async function fetchGasData() {
  const data = {};
  for (const [region, filename] of Object.entries(FILES)) {
    const res = await fetch(`${REPO_BASE}/${filename}`);
    if (!res.ok) {
      // Throwing here ensures runETL catches it and falls back to the cache
      throw new Error(`Failed to fetch ${filename}: ${res.statusText}`);
    } else {
      data[region] = await res.text();
    }
  }
  return data;
}

export function parseCSV(text) {
  if (!text || !text.trim()) return [];
  
  const lines = text.trim().split('\n');
  const headers = lines.shift().split(',').map(h => h.trim());
  
  return lines.map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for(let i = 0; i < line.length; i++) {
      const char = line[i];
      if(char === '"') {
        inQuotes = !inQuotes;
      } else if(char === ',' && !inQuotes) {
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

export function transformGasData(rawData) {
  const result = {};
  for (const [region, csv] of Object.entries(rawData)) {
    result[region] = parseCSV(csv);
  }
  return result;
}

export async function run() {
  await runETL({
    name: 'Gas Prices',
    fetcher: fetchGasData,
    transform: transformGasData,
    outFile: 'src/data/gas.json',
    defaultData: { md: [], ny: [], ma: [] }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run();
}

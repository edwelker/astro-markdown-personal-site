import fs from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';

/**
 * A generic concurrent map utility.
 * @template T, U
 * @param {T[]} items The array of items to process.
 * @param {number} limit The concurrency limit.
 * @param {(item: T) => Promise<U>} fn The async function to apply to each item.
 * @returns {Promise<U[]>} A promise that resolves to an array of results.
 */
export async function mapConcurrent(items, limit, fn) {
  const results = [];
  const executing = new Set();
  for (const item of items) {
    const p = Promise.resolve()
      .then(() => fn(item))
      .then((res) => {
        executing.delete(p);
        return res;
      });
    executing.add(p);
    results.push(p);
    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }
  return Promise.all(results);
}

/**
 * Writes data to a file, creating directories if necessary. Pure function for easier testing.
 * @param {string} filePath The path to the output file.
 * @param {any} data The data to serialize to JSON and write.
 */
export async function writeFile(filePath, data) {
  const outputPath = path.resolve(filePath);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(data, null, 2));
}

/**
 * Compares two JSON-serializable values for meaningful changes while ignoring
 * volatile top-level metadata keys (e.g., `lastUpdated`).
 * @param {any} prev Previously cached data.
 * @param {any} next Newly fetched data.
 * @param {string[]} [ignoreKeys=['lastUpdated']] Top-level keys to ignore during comparison.
 * @returns {boolean} True if meaningful data changed.
 */
export function hasDataChanged(prev, next, ignoreKeys = ['lastUpdated']) {
  const strip = (value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return value;
    }
    const copy = { ...value };
    for (const key of ignoreKeys) {
      delete copy[key];
    }
    return copy;
  };

  return JSON.stringify(strip(prev)) !== JSON.stringify(strip(next));
}

/**
 * A generic ETL runner that orchestrates fetching, transforming, and writing data.
 * It handles errors and logs progress.
 * @param {object} options
 * @param {string} options.name The name of the ETL process for logging.
 * @param {() => Promise<any>} options.fetcher An async function that fetches raw data.
 * @param {(data: any) => any} options.transform A function that transforms raw data into its final shape.
 * @param {string} options.outFile The path to the output file.
 * @param {any} [options.defaultData={}] The default data to write on failure.
 */
export async function runETL({ name, fetcher, transform, outFile, defaultData = {} }) {
  // Define cache location: src/data/cache/[filename]
  const cacheDir = path.join('src', 'data', 'cache');
  const fileName = path.basename(outFile);
  const cacheFile = path.join(cacheDir, fileName);

  let data;
  let source = 'fetch';

  try {
    console.log(`⏳ ${name}: Fetching fresh data...`);
    const rawData = await fetcher();
    data = transform(rawData);

    let shouldUpdateCache = true;
    if (existsSync(cacheFile)) {
      try {
        const cachedContent = await fs.readFile(cacheFile, 'utf-8');
        const cachedData = JSON.parse(cachedContent);
        if (!hasDataChanged(cachedData, data)) {
          shouldUpdateCache = false;
          data = cachedData;
          console.log(
            `⏭️ ${name}: No meaningful data changes, keeping existing cache at ${cacheFile}`
          );
        }
      } catch {
        // Existing cache is unreadable/corrupt; overwrite with fresh data
      }
    }

    // If fetch succeeds and data meaningfully changed, update the cache file
    if (shouldUpdateCache) {
      console.log(`💾 ${name}: Updating cache at ${cacheFile}`);
      await writeFile(cacheFile, data);
    }
  } catch (error) {
    console.error(`❌ ${name}: Fetch failed (${error.message})`);
    source = 'cache';

    // Try to load from cache (last good data fetch)
    try {
      if (existsSync(cacheFile)) {
        console.log(`⚠️ ${name}: Falling back to cached data from ${cacheFile}`);
        const cachedContent = await fs.readFile(cacheFile, 'utf-8');
        data = JSON.parse(cachedContent);
      } else {
        throw new Error('Cache file not found');
      }
    } catch (cacheError) {
      console.error(`❌ ${name}: Cache load failed (${cacheError.message})`);
      source = 'default';
      console.log(`⚠️ ${name}: Falling back to default data`);
      data = defaultData;
    }
  }

  // Write the result (from fetch, cache, or default) to the build artifact location
  await writeFile(outFile, data);
  console.log(`✅ ${name}: Wrote data to ${outFile} (Source: ${source})`);
}

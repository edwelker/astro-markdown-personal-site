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
    const p = Promise.resolve().then(() => fn(item)).then(res => {
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
  const cacheDir = path.join('src', 'data', 'cache');
  const cacheFile = path.join(cacheDir, path.basename(outFile));

  try {
    console.log(`⏳ ${name}: Fetching data...`);
    const rawData = await fetcher();
    const cleanData = transform(rawData);
    
    // Write to output file
    await writeFile(outFile, cleanData);
    
    // Write to cache file (latest good version)
    await writeFile(cacheFile, cleanData);
    
    console.log(`✅ ${name}: Success`);
  } catch (error) {
    console.error(`❌ ${name} Failed: ${error.message}.`);
    
    // Try to load from cache
    try {
      if (existsSync(cacheFile)) {
        console.log(`⚠️ ${name}: Falling back to cached data from ${cacheFile}`);
        const cachedData = await fs.readFile(cacheFile, 'utf-8');
        await writeFile(outFile, JSON.parse(cachedData));
        return;
      }
    } catch (cacheError) {
      console.error(`❌ ${name}: Failed to load cache: ${cacheError.message}`);
    }

    // Fallback to default data if cache fails or doesn't exist
    console.log(`⚠️ ${name}: Falling back to default data`);
    await writeFile(outFile, defaultData);
  }
}

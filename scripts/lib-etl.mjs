import fs from 'node:fs/promises';
import path from 'node:path';

export async function runETL({ name, url, fetchOptions = {}, transform, outFile, defaultData }) {
  const outputPath = path.resolve(outFile);
  try {
    const response = await fetch(url, fetchOptions);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const rawData = await response.json();
    const cleanData = transform(rawData);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(cleanData, null, 2));
    console.log(`✅ ${name}: Success`);
  } catch (error) {
    console.error(`❌ ${name} Failed: ${error.message}.`);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(defaultData, null, 2));
  }
}

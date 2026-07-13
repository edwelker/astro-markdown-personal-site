import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

try {
  if (typeof process.loadEnvFile === 'function') {
    try {
      process.loadEnvFile();
    } catch {
      const __dirname = dirname(fileURLToPath(import.meta.url));
      process.loadEnvFile(join(__dirname, '../.env'));
    }
  }
} catch (e) {
  // Ignore if .env doesn't exist (e.g. in CI)
}

export function validateEnv(varMap, serviceName) {
  const missing = [];
  const result = {};

  for (const [key, envVar] of Object.entries(varMap)) {
    const value = process.env[envVar];
    if (!value) {
      missing.push(envVar);
    } else {
      result[key] = value;
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `${serviceName} credentials are missing. Please check your environment variables: ${missing.join(', ')}`
    );
  }

  return result;
}

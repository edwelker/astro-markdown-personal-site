import { fileURLToPath } from 'node:url';

export async function fetchOrThrow(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText} (${url})`);
  }
  return res;
}

export function runIfMain(metaUrl, runFn) {
  if (process.argv[1] === fileURLToPath(metaUrl)) {
    runFn();
  }
}

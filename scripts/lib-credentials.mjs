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

interface RawGasStation {
  [key: string]: any;
}

export interface NormalizedGasStation {
  Station?: any;
  Address?: any;
  City?: any;
  Zip?: any;
  Base?: any;
  Discount?: any;
  Net?: any;
  lat?: any;
  lng?: any;
}

/**
 * Normalizes raw gas station data by handling case-insensitive keys,
 * calculating missing Net prices, cleaning up city names, and coalescing
 * coordinate fields.
 * @param rawData - The array of raw gas station objects.
 * @param region - The region code (e.g., 'md') for region-specific logic.
 * @returns An array of normalized gas station objects.
 */
export function normalizeGasData(rawData: RawGasStation[], region: string): NormalizedGasStation[] {
  return rawData.map((row: RawGasStation) => {
    // Helper to get value case-insensitively
    const getVal = (key: string) => {
      if (row[key] !== undefined) return row[key];
      const lowerKey = key.toLowerCase();
      const foundKey = Object.keys(row).find(k => k.toLowerCase() === lowerKey);
      return foundKey ? row[foundKey] : undefined;
    };

    let net = getVal('Net');
    const baseRaw = getVal('Base');
    const discountRaw = getVal('Discount');

    // Check if net is missing or empty string
    if (net === undefined || net === null || String(net).trim() === '') {
      const baseStr = String(baseRaw || "").replace(/[^0-9.-]+/g, "");
      const discountStr = String(discountRaw || "0").replace(/[^0-9.-]+/g, "");

      const base = parseFloat(baseStr);
      const discount = parseFloat(discountStr);

      if (!isNaN(base)) {
        // Default discount to 0 if NaN
        const finalDiscount = isNaN(discount) ? 0 : discount;
        net = (base - finalDiscount).toFixed(2);
      } else {
        // If base is invalid, keep net as is (likely empty or undefined)
        net = baseRaw;
      }
    }

    let city = getVal('City');
    // Clean up MD city names (remove parens)
    if (region === 'md' && city) {
      city = String(city).replace(/\s*\(.*?\)/g, '').trim();
    }

    return {
      Station: getVal('Station'),
      Address: getVal('Address'),
      City: city,
      Zip: getVal('Zip'),
      Base: baseRaw,
      Discount: discountRaw,
      Net: net,
      lat: getVal('lat') ?? getVal('latitude'),
      lng: getVal('lng') ?? getVal('long') ?? getVal('longitude')
    };
  });
}

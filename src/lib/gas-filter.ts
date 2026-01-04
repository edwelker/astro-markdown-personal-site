interface GasStation {
  City?: string | null;
  Zip?: string | number | null;
  [key: string]: any;
}

/**
 * Filters gas station data by city or zip code.
 * The filter is case-insensitive. An empty query returns all data with a city or zip.
 * @param data Array of gas station data objects.
 * @param query The filter string.
 * @returns A new array with the filtered gas station data.
 */
export function filterGasData(data: GasStation[], query: string): GasStation[] {
  const lowerCaseQuery = query.toLowerCase();
  return data.filter(row => {
    const cityMatch = row.City != null && String(row.City).toLowerCase().includes(lowerCaseQuery);
    const zipMatch = row.Zip != null && String(row.Zip).includes(lowerCaseQuery);
    return cityMatch || zipMatch;
  });
}

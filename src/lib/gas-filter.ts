interface GasStation {
  City?: string | null;
  Zip?: string | number | null;
  Station?: string | null;
  Address?: string | null;
  [key: string]: any;
}

/**
 * Filters gas station data by Station, Address, City, or Zip code.
 * The filter is case-insensitive. An empty query returns all data.
 * @param data Array of gas station data objects.
 * @param query The filter string.
 * @returns A new array with the filtered gas station data.
 */
export function filterGasData(data: GasStation[], query: string): GasStation[] {
  if (!query) return data;
  const lowerCaseQuery = query.toLowerCase();
  
  return data.filter(row => {
    const stationMatch = row.Station != null && String(row.Station).toLowerCase().includes(lowerCaseQuery);
    const addressMatch = row.Address != null && String(row.Address).toLowerCase().includes(lowerCaseQuery);
    const cityMatch = row.City != null && String(row.City).toLowerCase().includes(lowerCaseQuery);
    const zipMatch = row.Zip != null && String(row.Zip).includes(lowerCaseQuery);
    
    return stationMatch || addressMatch || cityMatch || zipMatch;
  });
}

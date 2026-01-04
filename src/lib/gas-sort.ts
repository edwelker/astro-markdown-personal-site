function parsePrice(price: any): number {
  if (price === undefined || price === null || price === '') return NaN;
  const num = parseFloat(String(price).replace(/[^0-9.-]+/g, ""));
  return num;
}

/**
 * Sorts gas station data by Net price, ascending.
 * Invalid or missing prices are pushed to the end.
 * @param a Gas station data object
 * @param b Gas station data object
 * @returns -1, 0, or 1 for sorting
 */
export function sortByNetPrice(a: { Net: any }, b: { Net: any }): number {
  const netA = parsePrice(a.Net);
  const netB = parsePrice(b.Net);

  // Handle NaNs by pushing them to the end
  if (isNaN(netA) && isNaN(netB)) return 0;
  if (isNaN(netA)) return 1;
  if (isNaN(netB)) return -1;

  return netA - netB;
}

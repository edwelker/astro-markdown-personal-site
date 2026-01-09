function parseCurrencyForSort(val: any): number | undefined {
  if (typeof val === 'number' && !isNaN(val)) {
    return val;
  }
  if (typeof val !== 'string') {
    return undefined;
  }
  const num = parseFloat(val.replace(/[^0-9.-]+/g, ""));
  return isNaN(num) ? undefined : num;
}

/**
 * Sorts gas station data by Net price, ascending.
 * Invalid or missing prices are pushed to the end.
 * @param a Gas station data object
 * @param b Gas station data object
 * @returns -1, 0, or 1 for sorting
 */
export function sortByNetPrice(a: { Net: any }, b: { Net: any }): number {
  const netA = parseCurrencyForSort(a.Net);
  const netB = parseCurrencyForSort(b.Net);

  // Handle undefined/NaN by pushing them to the end
  if (netA === undefined && netB === undefined) return 0;
  if (netA === undefined) return 1;
  if (netB === undefined) return -1;

  return netA - netB;
}

/**
 * Sorts gas station data by a specified column, direction, and optional distance data.
 * Includes tie-breaking logic using Net price. This function mutates the array.
 * @param data The array of gas station data to sort.
 * @param options The sorting options.
 */
export function sortGasData(
  data: any[],
  { sortCol, sortAsc, distances }: { sortCol: string; sortAsc: boolean; distances: any }
) {
  data.sort((a, b) => {
    let valA: any, valB: any;

    if (sortCol === 'Time') {
      valA = distances[a.Address]?.duration ?? Infinity;
      valB = distances[b.Address]?.duration ?? Infinity;
      // Always push stations without a time to the end
      if (valA === Infinity && valB === Infinity) return 0;
      if (valA === Infinity) return 1;
      if (valB === Infinity) return -1;
    } else if (['Base', 'Net', 'Discount'].includes(sortCol)) {
      valA = parseCurrencyForSort(a[sortCol]);
      valB = parseCurrencyForSort(b[sortCol]);

      if (valA === undefined && valB === undefined) return 0;
      if (valA === undefined) return 1;
      if (valB === undefined) return -1;
    } else {
      valA = (a[sortCol] || "").toString().toLowerCase();
      valB = (b[sortCol] || "").toString().toLowerCase();
    }

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;

    // Tie-breaker: cheaper Net price first
    return sortByNetPrice(a, b);
  });
}

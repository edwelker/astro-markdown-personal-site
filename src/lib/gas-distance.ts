interface GasStation {
  Address: string;
  lat?: string | number | null;
  lng?: string | number | null;
  Station: string;
  [key: string]: any;
}

interface Distances {
  [address: string]: any;
}

/**
 * Filters a list of gas stations to find unique stations with valid coordinates
 * that are not already present in the knownDistances object.
 * @param stationData - The array of all gas stations.
 * @param knownDistances - An object with already calculated distances.
 * @returns An array of stations for which distances need to be fetched.
 */
export function getStationsToFetch(stationData: GasStation[], knownDistances: Distances): GasStation[] {
  const seen = new Set<string>();
  return stationData.filter(row => {
    const lat = parseFloat(row.lat as string);
    const lng = parseFloat(row.lng as string);
    const hasCoords = !isNaN(lat) && !isNaN(lng);
    const notKnown = knownDistances[row.Address] === undefined;
    const isNew = !seen.has(row.Address);
    if (hasCoords && notKnown && isNew) {
      seen.add(row.Address);
      return true;
    }
    return false;
  });
}

interface Coords {
  lat: number;
  lon: number;
}

interface UICallbacks {
  setStatus: (text: string, show: boolean) => void;
  setButtonState: (text: string, disabled: boolean) => void;
  alert: (message: string) => void;
  updateTable: () => void;
}

/**
 * Handles the entire process of calculating driving times: getting user location,
 * batching API requests, and updating UI via callbacks.
 * 
 * Note: This function mutates the `distances` object in-place to allow for 
 * progressive UI updates via the updateTable callback.
 */
export async function calculateDistances({ initialData, distances, userCoords, uiCallbacks }: {
  initialData: GasStation[],
  distances: Distances,
  userCoords: Coords | null,
  uiCallbacks: UICallbacks
}) {
  let internalUserCoords = userCoords;
  // We use the reference directly to allow progressive updates in the UI
  const internalDistances = distances;

  uiCallbacks.setStatus("Waiting for location permission...", true);
  uiCallbacks.setButtonState("Calculating...", true);

  if (!internalUserCoords) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
      });
      internalUserCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
    } catch (e) {
      console.error("Geolocation error:", e);
      uiCallbacks.alert("Unable to get your location. Please ensure location services are enabled and try again.");
      uiCallbacks.setStatus('', false);
      uiCallbacks.setButtonState("Calculate Driving Times", false);
      return null;
    }
  }

  const allKnown = initialData.every(row => {
    const lat = parseFloat(row.lat as string);
    const lng = parseFloat(row.lng as string);
    const hasCoords = !isNaN(lat) && !isNaN(lng);
    return !hasCoords || internalDistances[row.Address] !== undefined;
  });

  if (allKnown && initialData.some(row => internalDistances[row.Address] !== undefined)) {
    uiCallbacks.updateTable();
    uiCallbacks.setStatus('', false);
    uiCallbacks.setButtonState("Calculate Driving Times", false);
    return { newDistances: internalDistances, newUserCoords: internalUserCoords };
  }

  const toFetch = getStationsToFetch(initialData, internalDistances);

  if (toFetch.length === 0) {
    uiCallbacks.alert("No location data found for these stations. Driving times cannot be calculated.");
    uiCallbacks.setStatus('', false);
    uiCallbacks.setButtonState("Calculate Driving Times", false);
    return { newDistances: internalDistances, newUserCoords: internalUserCoords };
  }

  let completed = 0;
  const total = toFetch.length;
  const updateProgress = () => {
    uiCallbacks.setStatus(`Calculating driving times... ${completed}/${total}`, true);
  };
  updateProgress();

  const batchSize = 49;
  for (let i = 0; i < toFetch.length; i += batchSize) {
    const batch = toFetch.slice(i, i + batchSize);

    try {
      const res = await fetch('/api/matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locations: [[internalUserCoords.lon, internalUserCoords.lat], ...batch.map(r => [parseFloat(r.lng as string), parseFloat(r.lat as string)])],
          sources: [0],
          destinations: Array.from({ length: batch.length }, (_, idx) => idx + 1),
          metrics: ["duration", "distance"],
          units: "mi"
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || `HTTP ${res.status}`);
      }

      const result = await res.json();

      batch.forEach((row, idx) => {
        if (result.durations && result.durations[0][idx] !== null) {
          internalDistances[row.Address] = {
            duration: result.durations[0][idx],
            distance: result.distances[0][idx]
          };
        } else {
          console.warn(`ORS returned null duration for station: ${row.Station} at ${row.Address} (Coords: ${row.lat}, ${row.lng})`);
        }
      });

      completed += batch.length;
      updateProgress();
      uiCallbacks.updateTable();
    } catch (e) {
      console.error("Matrix calculation failed:", e);
      uiCallbacks.alert(`Failed to calculate driving times: ${e.message}. Check console for details.`);
      uiCallbacks.setStatus('', false);
      uiCallbacks.setButtonState("Calculate Driving Times", false);
      // Don't return here, just break the loop. We still want to return what we have.
      break;
    }

    if (i + batchSize < toFetch.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  uiCallbacks.setStatus('', false);
  uiCallbacks.setButtonState("Calculate Driving Times", false);
  return { newDistances: internalDistances, newUserCoords: internalUserCoords };
}

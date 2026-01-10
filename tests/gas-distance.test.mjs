import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getStationsToFetch, calculateDistances } from '../src/lib/gas-distance';

const testStations = [
  { Station: 'A', Address: '1 Main St', lat: '40.7128', lng: '-74.0060' }, // Valid
  { Station: 'B', Address: '2 Broad St', lat: '34.0522', lng: '-118.2437' }, // Valid
  { Station: 'C', Address: '3 High St', lat: 'invalid', lng: '-71.0589' }, // Invalid coords
  { Station: 'D', Address: '4 Low St', lat: '42.3601', lng: null }, // Invalid coords
  { Station: 'E', Address: '5 Elm St', lat: '41.8781', lng: '-87.6298' }, // Valid
  { Station: 'F', Address: '6 Pine St' }, // No coords
];

describe('Gas Distance - getStationsToFetch', () => {
  it('should return stations with valid coordinates that are not known', () => {
    const knownDistances = { '2 Broad St': { duration: 100, distance: 5 } };
    const result = getStationsToFetch(testStations, knownDistances);
    expect(result.map(r => r.Station)).toEqual(['A', 'E']);
  });

  it('should handle an empty knownDistances object', () => {
    const result = getStationsToFetch(testStations, {});
    expect(result.map(r => r.Station)).toEqual(['A', 'B', 'E']);
  });

  it('should return an empty array if all valid stations are known', () => {
    const knownDistances = {
      '1 Main St': { duration: 100, distance: 5 },
      '2 Broad St': { duration: 200, distance: 10 },
      '5 Elm St': { duration: 300, distance: 15 },
    };
    const result = getStationsToFetch(testStations, knownDistances);
    expect(result).toEqual([]);
  });

  it('should only return unique addresses', () => {
    const stationsWithDuplicates = [
      { Station: 'A', Address: '1 Main St', lat: '40.7128', lng: '-74.0060' },
      { Station: 'B', Address: '2 Broad St', lat: '34.0522', lng: '-118.2437' },
      { Station: 'C', Address: '1 Main St', lat: '40.7128', lng: '-74.0060' }, // Duplicate of A
    ];
    const result = getStationsToFetch(stationsWithDuplicates, {});
    expect(result.map(r => r.Station)).toEqual(['A', 'B']);
  });

  it('should handle an empty station list', () => {
    const result = getStationsToFetch([], {});
    expect(result).toEqual([]);
  });
});

describe('Gas Distance - calculateDistances', () => {
  let mockUiCallbacks;
  const mockStations = [
    { Station: 'A', Address: '1 Main St', lat: '40.7128', lng: '-74.0060' },
    { Station: 'B', Address: '2 Broad St', lat: '34.0522', lng: '-118.2437' },
  ];

  beforeEach(() => {
    mockUiCallbacks = {
      setStatus: vi.fn(),
      setButtonState: vi.fn(),
      alert: vi.fn(),
      updateTable: vi.fn(),
    };
    vi.stubGlobal('fetch', vi.fn());
    const mockGeolocation = {
      getCurrentPosition: vi.fn(),
    };
    vi.stubGlobal('navigator', { geolocation: mockGeolocation });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('should successfully get location, fetch distances, and update UI', async () => {
    navigator.geolocation.getCurrentPosition.mockImplementationOnce((success) =>
      success({ coords: { latitude: 40, longitude: -75 } })
    );
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        durations: [[120, 240]],
        distances: [[1.5, 3.0]],
      }),
    });

    const distancesObj = {};
    const result = await calculateDistances({
      initialData: mockStations,
      distances: distancesObj,
      userCoords: null,
      uiCallbacks: mockUiCallbacks,
    });

    expect(mockUiCallbacks.setStatus).toHaveBeenCalledWith("Waiting for location permission...", true);
    expect(mockUiCallbacks.setStatus).toHaveBeenCalledWith("Calculating driving times... 2/2", true);
    expect(mockUiCallbacks.setButtonState).toHaveBeenCalledWith("Calculating...", true);
    expect(mockUiCallbacks.setButtonState).toHaveBeenCalledWith("Calculate Driving Times", false);
    expect(mockUiCallbacks.updateTable).toHaveBeenCalled();
    expect(mockUiCallbacks.alert).not.toHaveBeenCalled();

    expect(result.newDistances['1 Main St']).toBeDefined();
    expect(result.newUserCoords).toEqual({ lat: 40, lon: -75 });
    
    // Verify mutation of input object
    expect(distancesObj['1 Main St']).toBeDefined();
  });

  it('should handle geolocation failure', async () => {
    navigator.geolocation.getCurrentPosition.mockImplementationOnce((_, error) =>
      error(new Error("Permission denied"))
    );

    const result = await calculateDistances({
      initialData: mockStations,
      distances: {},
      userCoords: null,
      uiCallbacks: mockUiCallbacks,
    });

    expect(mockUiCallbacks.alert).toHaveBeenCalledWith("Unable to get your location. Please ensure location services are enabled and try again.");
    expect(fetch).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should handle API fetch failure', async () => {
    navigator.geolocation.getCurrentPosition.mockImplementationOnce((success) =>
      success({ coords: { latitude: 40, longitude: -75 } })
    );
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: 'Server Error' }),
    });

    await calculateDistances({
      initialData: mockStations,
      distances: {},
      userCoords: null,
      uiCallbacks: mockUiCallbacks,
    });

    expect(mockUiCallbacks.alert).toHaveBeenCalledWith("Failed to calculate driving times: Server Error. Check console for details.");
  });

  it('should show an alert if no stations have valid coordinates to fetch', async () => {
    const invalidStations = [{ Station: 'C', Address: '3 High St', lat: 'invalid' }];
    await calculateDistances({
      initialData: invalidStations,
      distances: {},
      userCoords: { lat: 40, lon: -75 },
      uiCallbacks: mockUiCallbacks,
    });

    expect(mockUiCallbacks.alert).toHaveBeenCalledWith("No location data found for these stations. Driving times cannot be calculated.");
    expect(fetch).not.toHaveBeenCalled();
  });
});

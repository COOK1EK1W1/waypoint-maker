import { expect, test, describe } from "bun:test";
import { 
  interpolateAlt,
  interpolateLatLng,
  getTerrainElevationAtPoint,
  calculateCumulativeDistances,
  generateInterpolatedPath,
  adjustAltitudeForDisplay,
  interpolateAltitudes,
  calculateInterpolatedAltitudes,
  getTerrain,
  getTerrainFromStorage,
  fetchTerrain
} from "../terrain";
import { LatLng, LatLngAlt } from "../latlng";

// Test data fixtures
const testPoint1: LatLng = { lat: 0, lng: 0 };
const testPoint2: LatLng = { lat: 1, lng: 1 };
const testPoint3: LatLng = { lat: 2, lng: 2 };

const terrainPoint1: LatLngAlt = { lat: 0, lng: 0, alt: 100 };
const terrainPoint2: LatLngAlt = { lat: 1, lng: 1, alt: 200 };
const terrainPoint3: LatLngAlt = { lat: 2, lng: 2, alt: 300 };

const a = { lat: 0, lng: 0, alt: 0 };
const b = { lat: 1, lng: 0, alt: 100 };
const c = { lat: 0, lng: 1, alt: 200 };
const d = { lat: 1, lng: 1, alt: 300 };

describe("interpolateAlt function", () => {
  test("should return exact altitude when target matches corner points", () => {
    expect(interpolateAlt(a, b, c, d, { lat: 0, lng: 0 })).toBe(0);
    expect(interpolateAlt(a, b, c, d, { lat: 1, lng: 0 })).toBe(100);
    expect(interpolateAlt(a, b, c, d, { lat: 0, lng: 1 })).toBe(200);
    expect(interpolateAlt(a, b, c, d, { lat: 1, lng: 1 })).toBe(300);
  });

  test("should interpolate correctly for points very close to corners", () => {
    expect(interpolateAlt(a, b, c, d, { lat: 0.00001, lng: 0.00001 })).toBeCloseTo(0, 1);
    expect(interpolateAlt(a, b, c, d, { lat: 0.99999, lng: 0.00001 })).toBeCloseTo(100, 1);
    expect(interpolateAlt(a, b, c, d, { lat: 0.00001, lng: 0.99999 })).toBeCloseTo(200, 1);
    expect(interpolateAlt(a, b, c, d, { lat: 0.99999, lng: 0.99999 })).toBeCloseTo(300, 1);
  });

  test("should handle negative altitudes", () => {
    const negA = { lat: 0, lng: 0, alt: -100 };
    const negB = { lat: 1, lng: 0, alt: -50 };
    const negC = { lat: 0, lng: 1, alt: -200 };
    const negD = { lat: 1, lng: 1, alt: -150 };
    
    expect(interpolateAlt(negA, negB, negC, negD, { lat: 0, lng: 0 })).toBe(-100);
    expect(interpolateAlt(negA, negB, negC, negD, { lat: 1, lng: 1 })).toBe(-150);
  });

  test("should handle zero altitude values", () => {
    const zeroA = { lat: 0, lng: 0, alt: 0 };
    const zeroB = { lat: 1, lng: 0, alt: 0 };
    const zeroC = { lat: 0, lng: 1, alt: 0 };
    const zeroD = { lat: 1, lng: 1, alt: 0 };
    
    expect(interpolateAlt(zeroA, zeroB, zeroC, zeroD, { lat: 0.5, lng: 0.5 })).toBe(0);
  });

  test("should interpolate correctly for center point", () => {
    const result = interpolateAlt(a, b, c, d, { lat: 0.5, lng: 0.5 });
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(300);
    // For center point with inverse distance weighting, expect value around the average
    expect(result).toBeCloseTo(150, 0);
  });

  test("should handle very large altitude differences", () => {
    const largeA = { lat: 0, lng: 0, alt: 0 };
    const largeB = { lat: 1, lng: 0, alt: 10000 };
    const largeC = { lat: 0, lng: 1, alt: 5000 };
    const largeD = { lat: 1, lng: 1, alt: 15000 };
    
    const result = interpolateAlt(largeA, largeB, largeC, largeD, { lat: 0.5, lng: 0.5 });
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(15000);
  });
});

describe("getTerrain function", () => {
  test("should return empty array for empty input", async () => {
    const result = await getTerrain([]);
    expect(result).toEqual([]);
  });

  // Skip IndexedDB-dependent tests in test environment
  test.skip("should handle single location", async () => {
    // This test requires IndexedDB which is not available in test environment
    // In a real browser environment, this would test the full getTerrain functionality
  });

  test.skip("should handle API failure gracefully", async () => {
    // This test requires IndexedDB which is not available in test environment
    // In a real browser environment, this would test error handling
  });
});

describe("getTerrainFromStorage function", () => {
  test("should return empty arrays for empty input", async () => {
    const result = await getTerrainFromStorage([]);
    expect(result.locs).toEqual([]);
    expect(result.nf).toEqual([]);
  });

  // Skip IndexedDB-dependent tests in test environment  
  test.skip("should handle locations not in cache", async () => {
    // This test requires IndexedDB which is not available in test environment
  });

  test.skip("should maintain input-output correspondence", async () => {
    // This test requires IndexedDB which is not available in test environment
  });
});

describe("fetchTerrain function", () => {
  test("should return null for empty input", async () => {
    const result = await fetchTerrain([]);
    expect(result).toBe(null);
  });

  test("should handle successful API response", async () => {
    const originalFetch = global.fetch;
    global.fetch = async () => ({
      ok: true,
      json: async () => ({
        results: [
          { elevation: 100, latitude: 0, longitude: 0 },
          { elevation: 200, latitude: 1, longitude: 1 }
        ]
      })
    }) as Response;

    try {
      const result = await fetchTerrain([{ lat: 0, lng: 0 }, { lat: 1, lng: 1 }]);
      expect(Array.isArray(result)).toBe(true);
      expect(result?.length).toBe(2);
      expect(result?.[0]).toEqual({ alt: 100, lat: 0, lng: 0 });
      expect(result?.[1]).toEqual({ alt: 200, lat: 1, lng: 1 });
    } finally {
      global.fetch = originalFetch;
    }
  });

  test("should handle HTTP error responses", async () => {
    const originalFetch = global.fetch;
    global.fetch = async () => ({
      ok: false,
      status: 404
    }) as Response;

    try {
      const result = await fetchTerrain([{ lat: 0, lng: 0 }]);
      expect(result).toBe(null);
    } finally {
      global.fetch = originalFetch;
    }
  });

  test("should handle malformed API response", async () => {
    const originalFetch = global.fetch;
    global.fetch = async () => ({
      ok: true,
      json: async () => ({
        // Missing 'results' field
        data: []
      })
    }) as Response;

    try {
      const result = await fetchTerrain([{ lat: 0, lng: 0 }]);
      expect(result).toBe(null);
    } finally {
      global.fetch = originalFetch;
    }
  });

  test("should handle network errors", async () => {
    const originalFetch = global.fetch;
    global.fetch = async () => {
      throw new Error("Network error");
    };

    try {
      const result = await fetchTerrain([{ lat: 0, lng: 0 }]);
      expect(result).toBe(null);
    } finally {
      global.fetch = originalFetch;
    }
  });

  test("should format locations correctly in URL", async () => {
    const originalFetch = global.fetch;
    let capturedUrl = "";
    
    global.fetch = async (input: RequestInfo | URL) => {
      capturedUrl = input.toString();
      return {
        ok: true,
        json: async () => ({ results: [] })
      } as Response;
    };

    try {
      await fetchTerrain([
        { lat: 12.3456789, lng: -98.7654321 },
        { lat: 0, lng: 0 }
      ]);
      
      expect(capturedUrl).toContain("12.3456789,-98.7654321");
      expect(capturedUrl).toContain("0.0000000,0.0000000");
      expect(capturedUrl).toContain("|"); // Separator between locations
    } finally {
      global.fetch = originalFetch;
    }
  });
});

describe("interpolateLatLng", () => {
  test("should return first point when fraction is 0", () => {
    const result = interpolateLatLng(testPoint1, testPoint2, 0);
    expect(result.lat).toBe(0);
    expect(result.lng).toBe(0);
  });

  test("should return second point when fraction is 1", () => {
    const result = interpolateLatLng(testPoint1, testPoint2, 1);
    expect(result.lat).toBe(1);
    expect(result.lng).toBe(1);
  });

  test("should return midpoint when fraction is 0.5", () => {
    const result = interpolateLatLng(testPoint1, testPoint2, 0.5);
    expect(result.lat).toBe(0.5);
    expect(result.lng).toBe(0.5);
  });

  test("should handle quarter interpolation correctly", () => {
    const result = interpolateLatLng(testPoint1, testPoint2, 0.25);
    expect(result.lat).toBe(0.25);
    expect(result.lng).toBe(0.25);
  });

  test("should handle negative coordinates", () => {
    const negPoint1 = { lat: -10, lng: -20 };
    const negPoint2 = { lat: 10, lng: 20 };
    const result = interpolateLatLng(negPoint1, negPoint2, 0.5);
    expect(result.lat).toBe(0);
    expect(result.lng).toBe(0);
  });

  test("should handle fractions outside 0-1 range", () => {
    const result1 = interpolateLatLng(testPoint1, testPoint2, -0.5);
    expect(result1.lat).toBe(-0.5);
    expect(result1.lng).toBe(-0.5);
    
    const result2 = interpolateLatLng(testPoint1, testPoint2, 1.5);
    expect(result2.lat).toBe(1.5);
    expect(result2.lng).toBe(1.5);
  });
});

describe("getTerrainElevationAtPoint", () => {
  const terrainData = [terrainPoint1, terrainPoint2, terrainPoint3];

  test("should return 0 for empty terrain data", () => {
    const result = getTerrainElevationAtPoint([], testPoint1);
    expect(result).toBe(0);
  });

  test("should return exact elevation for matching point", () => {
    const result = getTerrainElevationAtPoint(terrainData, { lat: 1, lng: 1 });
    expect(result).toBe(200);
  });

  test("should return closest point elevation for non-matching point", () => {
    const result = getTerrainElevationAtPoint(terrainData, { lat: 0.1, lng: 0.1 });
    expect(result).toBe(100); // Closest to terrainPoint1
  });

  test("should handle single terrain point", () => {
    const result = getTerrainElevationAtPoint([terrainPoint1], testPoint2);
    expect(result).toBe(100);
  });

  test("should handle negative elevations", () => {
    const negativeTerrain = [{ lat: 0, lng: 0, alt: -50 }];
    const result = getTerrainElevationAtPoint(negativeTerrain, testPoint1);
    expect(result).toBe(-50);
  });

  test("should find closest point among many", () => {
    const manyPoints = [
      { lat: 0, lng: 0, alt: 100 },        // Distance from (0.05, 0.05) = sqrt(0.05² + 0.05²) ≈ 0.071
      { lat: 5, lng: 5, alt: 200 },        // Distance from (0.05, 0.05) = sqrt(4.95² + 4.95²) ≈ 7.00
      { lat: 0.1, lng: 0.1, alt: 150 },    // Distance from (0.05, 0.05) = sqrt(0.05² + 0.05²) ≈ 0.071
      { lat: 10, lng: 10, alt: 300 }       // Distance from (0.05, 0.05) = sqrt(9.95² + 9.95²) ≈ 14.07
    ];
    
    // Both first and third points have the same distance, but the function returns the first match
    // Let's test with a clear winner
    const testPoints = [
      { lat: 1, lng: 1, alt: 100 },        // Distance from (0.05, 0.05) ≈ 1.34
      { lat: 0.06, lng: 0.06, alt: 150 },  // Distance from (0.05, 0.05) ≈ 0.014 - clearly closest
      { lat: 5, lng: 5, alt: 200 }         // Distance from (0.05, 0.05) ≈ 7.00
    ];
    
    const result = getTerrainElevationAtPoint(testPoints, { lat: 0.05, lng: 0.05 });
    expect(result).toBe(150); // Should be closest to second point (0.06, 0.06)
  });
});

describe("calculateCumulativeDistances", () => {
  test("should return [0] for empty array", () => {
    const result = calculateCumulativeDistances([]);
    expect(result).toEqual([0]);
  });

  test("should return [0] for single point", () => {
    const result = calculateCumulativeDistances([testPoint1]);
    expect(result).toEqual([0]);
  });

  test("should calculate cumulative distances correctly", () => {
    const waypoints = [
      { lat: 0, lng: 0 },
      { lat: 0, lng: 1 }, // ~111km
      { lat: 0, lng: 2 }  // ~222km total
    ];
    const result = calculateCumulativeDistances(waypoints);
    
    expect(result.length).toBe(3);
    expect(result[0]).toBe(0);
    expect(result[1]).toBeGreaterThan(100000); // ~111km in meters
    expect(result[2]).toBeGreaterThan(200000); // ~222km in meters
    expect(result[2]).toBeGreaterThan(result[1]);
  });

  test("should handle identical consecutive points", () => {
    const waypoints = [testPoint1, testPoint1, testPoint2];
    const result = calculateCumulativeDistances(waypoints);
    
    expect(result.length).toBe(3);
    expect(result[0]).toBe(0);
    expect(result[1]).toBe(0); // No distance between identical points
    expect(result[2]).toBeGreaterThan(0);
  });

  test("should handle two identical points", () => {
    const waypoints = [testPoint1, testPoint1];
    const result = calculateCumulativeDistances(waypoints);
    
    expect(result).toEqual([0, 0]);
  });

  test("should handle very close points", () => {
    const waypoints = [
      { lat: 0, lng: 0 },
      { lat: 0.0001, lng: 0.0001 }
    ];
    const result = calculateCumulativeDistances(waypoints);
    
    expect(result.length).toBe(2);
    expect(result[0]).toBe(0);
    expect(result[1]).toBeGreaterThan(0);
    expect(result[1]).toBeLessThan(100); // Very small distance
  });
});

describe("generateInterpolatedPath", () => {
  test("should return empty array for empty waypoints", () => {
    const result = generateInterpolatedPath([], 0);
    expect(result).toEqual([]);
  });

  test("should return single point for single waypoint", () => {
    const result = generateInterpolatedPath([testPoint1], 0);
    expect(result).toEqual([testPoint1]);
  });

  test("should generate interpolated points along path", () => {
    const waypoints = [testPoint1, testPoint2];
    const totalDistance = 157249; // Approximate distance between (0,0) and (1,1)
    const result = generateInterpolatedPath(waypoints, totalDistance, 10);
    
    expect(result.length).toBeGreaterThan(2); // Should have interpolated points
    expect(result[0]).toEqual(testPoint1); // First point should be unchanged
    expect(result[result.length - 1]).toEqual(testPoint2); // Last point should be unchanged
  });

  test("should handle zero total distance", () => {
    const waypoints = [testPoint1, testPoint1]; // Same points
    const result = generateInterpolatedPath(waypoints, 0);
    
    expect(result.length).toBe(1);
    expect(result[0]).toEqual(testPoint1);
  });

  test("should avoid duplicate consecutive points", () => {
    const waypoints = [testPoint1, testPoint2, testPoint2];
    const totalDistance = 157249;
    const result = generateInterpolatedPath(waypoints, totalDistance, 5);
    
    // Check that no two consecutive points are identical
    for (let i = 1; i < result.length; i++) {
      const prev = result[i - 1];
      const curr = result[i];
      const isDuplicate = prev.lat === curr.lat && prev.lng === curr.lng;
      expect(isDuplicate).toBe(false);
    }
  });

  test("should handle single waypoint with non-zero distance", () => {
    const result = generateInterpolatedPath([testPoint1], 1000, 10);
    expect(result).toEqual([testPoint1]);
  });

  test("should respect numInterpolationPoints parameter", () => {
    const waypoints = [testPoint1, testPoint2];
    const totalDistance = 157249;
    
    const result1 = generateInterpolatedPath(waypoints, totalDistance, 5);
    const result2 = generateInterpolatedPath(waypoints, totalDistance, 20);
    
    // More interpolation points should generally result in more total points
    expect(result2.length).toBeGreaterThanOrEqual(result1.length);
  });

  test("should handle multiple waypoints", () => {
    const waypoints = [testPoint1, testPoint2, testPoint3];
    const totalDistance = 314498; // Approximate total distance
    const result = generateInterpolatedPath(waypoints, totalDistance, 10);
    
    expect(result.length).toBeGreaterThan(3);
    expect(result[0]).toEqual(testPoint1);
    expect(result[result.length - 1]).toEqual(testPoint3);
  });
});

describe("adjustAltitudeForDisplay", () => {
  const altitude = 1000;
  const terrainElevation = 500;
  const baseTerrainElevation = 200;

  test("should adjust AMSL altitude (frame 0) relative to base terrain", () => {
    const result = adjustAltitudeForDisplay(altitude, 0, terrainElevation, baseTerrainElevation);
    expect(result).toBe(800); // 1000 - 200
  });

  test("should return unchanged altitude for relative frame (frame 3)", () => {
    const result = adjustAltitudeForDisplay(altitude, 3, terrainElevation, baseTerrainElevation);
    expect(result).toBe(1000); // Unchanged
  });

  test("should adjust terrain-relative altitude (frame 10)", () => {
    const result = adjustAltitudeForDisplay(altitude, 10, terrainElevation, baseTerrainElevation);
    expect(result).toBe(1300); // 1000 + 500 - 200
  });

  test("should return unchanged altitude for unknown frame", () => {
    const result = adjustAltitudeForDisplay(altitude, 99, terrainElevation, baseTerrainElevation);
    expect(result).toBe(1000); // Default case
  });

  test("should handle negative altitudes", () => {
    const result = adjustAltitudeForDisplay(-100, 0, terrainElevation, baseTerrainElevation);
    expect(result).toBe(-300); // -100 - 200
  });

  test("should handle zero values", () => {
    const result = adjustAltitudeForDisplay(0, 0, 0, 0);
    expect(result).toBe(0);
  });

  test("should handle all frame types with edge values", () => {
    expect(adjustAltitudeForDisplay(0, 0, 0, 0)).toBe(0);
    expect(adjustAltitudeForDisplay(0, 3, 0, 0)).toBe(0);
    expect(adjustAltitudeForDisplay(0, 10, 0, 0)).toBe(0);
    expect(adjustAltitudeForDisplay(0, -1, 0, 0)).toBe(0); // Unknown frame
  });
});

describe("interpolateAltitudes", () => {
  test("should return empty array for less than 2 waypoints", () => {
    const result = interpolateAltitudes([{ lat: 0, lng: 0, altitude: 100 }], 100, 200);
    expect(result).toEqual([]);
  });

  test("should return start altitude for all points when total distance is 0", () => {
    const waypoints = [
      { lat: 0, lng: 0, altitude: 100 },
      { lat: 0, lng: 0, altitude: 200 } // Same location
    ];
    const result = interpolateAltitudes(waypoints, 100, 200);
    expect(result).toEqual([100, 100]);
  });

  test("should interpolate altitudes correctly along distance", () => {
    const waypoints = [
      { lat: 0, lng: 0, altitude: 100 },
      { lat: 0, lng: 1, altitude: 150 },
      { lat: 0, lng: 2, altitude: 200 }
    ];
    const result = interpolateAltitudes(waypoints, 100, 200);
    
    expect(result.length).toBe(3);
    expect(result[0]).toBe(100); // Start altitude
    expect(result[1]).toBeGreaterThan(100); // Interpolated
    expect(result[1]).toBeLessThan(200);
    expect(result[2]).toBe(200); // End altitude
  });

  test("should handle empty waypoints array", () => {
    const result = interpolateAltitudes([], 100, 200);
    expect(result).toEqual([]);
  });

  test("should handle negative altitudes", () => {
    const waypoints = [
      { lat: 0, lng: 0, altitude: -100 },
      { lat: 0, lng: 1, altitude: -50 }
    ];
    const result = interpolateAltitudes(waypoints, -100, -50);
    
    expect(result.length).toBe(2);
    expect(result[0]).toBe(-100);
    expect(result[1]).toBe(-50);
  });

  test("should handle same start and end altitudes", () => {
    const waypoints = [
      { lat: 0, lng: 0, altitude: 100 },
      { lat: 0, lng: 1, altitude: 150 },
      { lat: 0, lng: 2, altitude: 200 }
    ];
    const result = interpolateAltitudes(waypoints, 100, 100);
    
    expect(result.every(alt => alt === 100)).toBe(true);
  });
});

describe("calculateInterpolatedAltitudes", () => {
  const waypoints = [
    { params: { latitude: 0, longitude: 0, altitude: 100 } },
    { params: { latitude: 0, longitude: 1, altitude: 150 } },
    { params: { latitude: 0, longitude: 2, altitude: 200 } },
    { params: { latitude: 0, longitude: 3, altitude: 300 } }
  ];

  test("should return empty result for invalid indices", () => {
    const result = calculateInterpolatedAltitudes(waypoints, 2, 1); // start >= end
    expect(result.interpolatedAltitudes).toEqual([]);
    expect(result.totalDistance).toBe(0);
  });

  test("should return empty result for out-of-bounds indices", () => {
    const result = calculateInterpolatedAltitudes(waypoints, -1, 2);
    expect(result.interpolatedAltitudes).toEqual([]);
    expect(result.totalDistance).toBe(0);
  });

  test("should calculate interpolated altitudes correctly", () => {
    const result = calculateInterpolatedAltitudes(waypoints, 0, 3);
    
    expect(result.interpolatedAltitudes.length).toBe(2); // Intermediate points between 0 and 3
    expect(result.totalDistance).toBeGreaterThan(0);
    
    // Check that interpolated values are between start and end
    expect(result.interpolatedAltitudes[0]).toBeGreaterThan(100);
    expect(result.interpolatedAltitudes[0]).toBeLessThan(300);
    expect(result.interpolatedAltitudes[1]).toBeGreaterThan(100);
    expect(result.interpolatedAltitudes[1]).toBeLessThan(300);
    
    // Second interpolated value should be greater than first
    expect(result.interpolatedAltitudes[1]).toBeGreaterThan(result.interpolatedAltitudes[0]);
  });

  test("should handle adjacent waypoints", () => {
    const result = calculateInterpolatedAltitudes(waypoints, 0, 1);
    
    expect(result.interpolatedAltitudes).toEqual([]); // No intermediate points
    expect(result.totalDistance).toBeGreaterThan(0);
  });

  test("should handle single intermediate waypoint", () => {
    const result = calculateInterpolatedAltitudes(waypoints, 0, 2);
    
    expect(result.interpolatedAltitudes.length).toBe(1);
    expect(result.totalDistance).toBeGreaterThan(0);
    expect(result.interpolatedAltitudes[0]).toBeGreaterThan(100);
    expect(result.interpolatedAltitudes[0]).toBeLessThan(200);
  });

  test("should handle equal start and end indices", () => {
    const result = calculateInterpolatedAltitudes(waypoints, 1, 1);
    expect(result.interpolatedAltitudes).toEqual([]);
    expect(result.totalDistance).toBe(0);
  });

  test("should handle negative start index", () => {
    const result = calculateInterpolatedAltitudes(waypoints, -1, 2);
    expect(result.interpolatedAltitudes).toEqual([]);
    expect(result.totalDistance).toBe(0);
  });

  test("should handle end index beyond array length", () => {
    const result = calculateInterpolatedAltitudes(waypoints, 0, 10);
    expect(result.interpolatedAltitudes).toEqual([]);
    expect(result.totalDistance).toBe(0);
  });

  test("should handle empty waypoints array", () => {
    const result = calculateInterpolatedAltitudes([], 0, 1);
    expect(result.interpolatedAltitudes).toEqual([]);
    expect(result.totalDistance).toBe(0);
  });

  test("should handle waypoints with same coordinates", () => {
    const sameLocationWaypoints = [
      { params: { latitude: 0, longitude: 0, altitude: 100 } },
      { params: { latitude: 0, longitude: 0, altitude: 150 } },
      { params: { latitude: 0, longitude: 0, altitude: 200 } }
    ];
    
    const result = calculateInterpolatedAltitudes(sameLocationWaypoints, 0, 2);
    expect(result.totalDistance).toBe(0);
    expect(result.interpolatedAltitudes.length).toBe(1);
    expect(result.interpolatedAltitudes[0]).toBe(100); // Should be start altitude when distance is 0
  });

  test("should handle negative altitudes", () => {
    const negativeWaypoints = [
      { params: { latitude: 0, longitude: 0, altitude: -100 } },
      { params: { latitude: 0, longitude: 1, altitude: -50 } },
      { params: { latitude: 0, longitude: 2, altitude: 0 } }
    ];
    
    const result = calculateInterpolatedAltitudes(negativeWaypoints, 0, 2);
    expect(result.interpolatedAltitudes.length).toBe(1);
    expect(result.interpolatedAltitudes[0]).toBeGreaterThan(-100);
    expect(result.interpolatedAltitudes[0]).toBeLessThan(0);
  });
});

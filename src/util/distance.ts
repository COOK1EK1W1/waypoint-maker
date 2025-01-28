function toRadians(degrees: number) {
  return degrees * Math.PI / 180;
}

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000; // Earth's radius in meters
  const deltaLat = toRadians(lat2 - lat1);
  const deltaLon = toRadians(lon2 - lon1);
  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

export function gradient(distance: number, alt1: number, alt2: number) {
  const altitudeChange = alt2 - alt1;
  const gradientRadians = Math.atan(altitudeChange / distance);
  const gradientDegrees = gradientRadians * (180 / Math.PI);
  return Number(gradientDegrees.toPrecision(3));
}

export function formatDistance(distanceInMeters: number) {
  // If the distance is less than 1 kilometer, return in meters rounded to three significant figures
  if (distanceInMeters < 1000) {
    const roundedMeters = Number(distanceInMeters.toPrecision(3));
    return `${roundedMeters} meters`;
  } else {
    // Otherwise, convert to kilometers and round to three significant figures
    let distanceInKilometers = distanceInMeters / 1000;
    const roundedKilometers = Number(distanceInKilometers.toPrecision(3));
    return `${roundedKilometers} kilometers`;
  }
}


function latLngToVector(lat: number, lng: number): [number, number, number] {
  const latRad = toRadians(lat);
  const lngRad = toRadians(lng);

  const x = Math.cos(latRad) * Math.cos(lngRad);
  const y = Math.cos(latRad) * Math.sin(lngRad);
  const z = Math.sin(latRad);

  return [x, y, z];
}

function dotProduct(v1: [number, number, number], v2: [number, number, number]): number {
  return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
}

function magnitude(v: [number, number, number]): number {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

function angleBetweenVectors(v1: [number, number, number], v2: [number, number, number]): number {
  const dot = dotProduct(v1, v2);
  const mag1 = magnitude(v1);
  const mag2 = magnitude(v2);

  return Math.acos(dot / (mag1 * mag2));
}

export function angleBetweenPoints(lat1: number, lng1: number, lat2: number, lng2: number, lat3: number, lng3: number): number {
  const v1 = latLngToVector(lat1, lng1);
  const v2 = latLngToVector(lat2, lng2);
  const v3 = latLngToVector(lat3, lng3);

  const vectorA: [number, number, number] = [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
  const vectorB: [number, number, number] = [v3[0] - v2[0], v3[1] - v2[1], v3[2] - v2[2]];

  const angleRad = angleBetweenVectors(vectorA, vectorB);

  return angleRad * (180 / Math.PI);
}


import { LatLng } from "@/types/dubins";

export function toRadians(degrees: number) {
  return degrees * Math.PI / 180;
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


function latLngToVector(pos: LatLng): [number, number, number] {
  const latRad = toRadians(pos.lat);
  const lngRad = toRadians(pos.lng);

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

export function angleBetweenPoints(pos1: LatLng, pos2: LatLng, pos3: LatLng): number {
  const v1 = latLngToVector(pos1);
  const v2 = latLngToVector(pos2);
  const v3 = latLngToVector(pos3);

  const vectorA: [number, number, number] = [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
  const vectorB: [number, number, number] = [v3[0] - v2[0], v3[1] - v2[1], v3[2] - v2[2]];

  const angleRad = angleBetweenVectors(vectorA, vectorB);

  return angleRad * (180 / Math.PI);
}


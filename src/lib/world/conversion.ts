import { LatLng, XY } from "@/types/dubins";

// Convert WGS84 to local ENU using a given reference point
export function g2l(reference: LatLng, point: LatLng): XY {
  const { lat: refLat, lng: refLng } = reference;
  const { lat, lng } = point;

  // Earth's radius in meters
  const R = 6371000;

  // Convert latitude and longitude differences to radians
  const dLat = (lat - refLat) * (Math.PI / 180);
  const dLng = (lng - refLng) * (Math.PI / 180);

  // Calculate north and east distances
  const north = dLat * R;
  const east = dLng * R * Math.cos(refLat * (Math.PI / 180));

  return { y: north, x: east };
}

// Convert local ENU to WGS84 using a given reference point
export function l2g(reference: LatLng, point: XY): LatLng {
  const { lat: refLat, lng: refLng } = reference;
  const { x: east, y: north } = point;

  // Earth's radius in meters
  const R = 6371000;

  // Convert north and east distances to latitude and longitude differences
  const dLat = north / R;
  const dLng = east / (R * Math.cos(refLat * (Math.PI / 180)));

  // Convert differences to degrees
  const lat = refLat + dLat * (180 / Math.PI);
  const lng = refLng + dLng * (180 / Math.PI);

  return { lat, lng };
}

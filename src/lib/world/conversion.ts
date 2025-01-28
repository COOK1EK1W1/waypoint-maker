import LatLonEllipsoidal, { Cartesian, Vector3d } from "geodesy/latlon-ellipsoidal";

export function g2l(reference: number[], point: number[]) {
  // Target and reference coordinates: [latitude, longitude, height]
  const targetPoint = new LatLonEllipsoidal(point[0], point[1], point[2]);
  const refPoint = new LatLonEllipsoidal(reference[0], reference[1], reference[2]);

  // Convert to ECEF (Earth-Centered, Earth-Fixed)
  const targetEcef = targetPoint.toCartesian();
  const refEcef = refPoint.toCartesian();

  // Calculate the ECEF offset vector
  const offset = targetEcef.minus(refEcef);

  // Reference point orientation in ENU frame
  const refLat = refPoint.lat / 180 * Math.PI;
  const refLon = refPoint.lon / 180 * Math.PI;

  // Rotation matrix for ECEF to ENU transformation
  const sinLat = Math.sin(refLat);
  const cosLat = Math.cos(refLat);
  const sinLon = Math.sin(refLon);
  const cosLon = Math.cos(refLon);

  const transform = [
    [-sinLon, cosLon, 0], // East
    [-sinLat * cosLon, -sinLat * sinLon, cosLat], // North
    [cosLat * cosLon, cosLat * sinLon, sinLat], // Up
  ];

  // Apply transformation
  const enu = new Vector3d(
    transform[0][0] * offset.x + transform[0][1] * offset.y + transform[0][2] * offset.z,
    transform[1][0] * offset.x + transform[1][1] * offset.y + transform[1][2] * offset.z,
    transform[2][0] * offset.x + transform[2][1] * offset.y + transform[2][2] * offset.z
  );

  return [enu.x, enu.y, enu.z];
}

export function l2g(reference: number[], point: number[]) {
  // Reference point in global coordinates [latitude, longitude, height]
  const refPoint = new LatLonEllipsoidal(reference[0], reference[1], reference[2]);

  // Convert reference point to ECEF
  const refEcef = refPoint.toCartesian();

  // Reference point orientation in ENU frame
  const refLat = refPoint.lat / 180 * Math.PI;
  const refLon = refPoint.lon / 180 * Math.PI;

  // Rotation matrix for ENU to ECEF transformation (transpose of ECEF to ENU)
  const sinLat = Math.sin(refLat);
  const cosLat = Math.cos(refLat);
  const sinLon = Math.sin(refLon);
  const cosLon = Math.cos(refLon);

  const transform = [
    [-sinLon, -sinLat * cosLon, cosLat * cosLon],
    [cosLon, -sinLat * sinLon, cosLat * sinLon],
    [0, cosLat, sinLat],
  ];

  // Convert ENU to ECEF
  const enuVector = new Vector3d(point[0], point[1], point[2]);
  const ecefVector = new Vector3d(
    transform[0][0] * enuVector.x +
    transform[0][1] * enuVector.y +
    transform[0][2] * enuVector.z,
    transform[1][0] * enuVector.x +
    transform[1][1] * enuVector.y +
    transform[1][2] * enuVector.z,
    transform[2][0] * enuVector.x +
    transform[2][1] * enuVector.y +
    transform[2][2] * enuVector.z
  );

  // Add the reference ECEF coordinates
  const targetEcef = refEcef.plus(ecefVector);

  // Convert ECEF back to geodetic
  const targetPoint = new Cartesian(targetEcef.x, targetEcef.y, targetEcef.z).toLatLon(LatLonEllipsoidal.ellipsoids.WGS84);

  return [
    targetPoint.lat,
    targetPoint.lon,
    targetPoint.height,
  ]
}

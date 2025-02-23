import { Segment, Path, XY, LatLng } from "@/types/dubins";
import { toRadians } from "@/util/distance";

export function segmentLength(seg: Segment<XY>): number {
  switch (seg.type) {
    case "Curve":
      return Math.abs(seg.theta * seg.radius)
    case "Straight":
      return dist(seg.start, seg.end)
  }
}

export function deg2rad(deg: number): number {
  return deg * Math.PI / 180
}

export function rad2deg(rad: number): number {
  return rad * 180 / Math.PI
}

export function energyRequirement(radius: number, velocity: number) {
  if (radius == 0) {
    return 0
  }
  return (Math.sqrt(radius * radius * 9.81 * 9.81 + Math.pow(velocity, 4))) / (radius * 9.81)
}

export function pathEnergyRequirements(path: Path<XY>, velocity: number, energyConstant: number = 1) {
  let totalEnergy = 0
  for (const seg of path) {
    let segLength = segmentLength(seg)
    switch (seg.type) {
      case "Curve":
        totalEnergy += segLength * energyRequirement(seg.radius, velocity) * energyConstant
        continue;
      case "Straight":
        totalEnergy += segLength * energyConstant
        continue;
    }
  }
  return totalEnergy
}

export function dist(a: XY, b: XY) {
  // euclidean distance function
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2))
}

export function pathLength(path: Path<XY>) {
  return path.map((x: Segment<XY>) => segmentLength(x)).reduce((acc, a) => acc + a, 0)
}

export function offset(a: XY, dist: number, angle: number): XY {
  return {
    x: a.x + dist * Math.sin(angle),
    y: a.y + dist * Math.cos(angle)
  }
}

export function worldOffset(a: LatLng, dist: number, angle: number): LatLng {
  const latRad = toRadians(a.lat)
  const mpld = 111320.0;
  const mplo = 111320.0 * Math.cos(latRad);
  return {
    lng: a.lng + dist * Math.sin(angle) / mplo,
    lat: a.lat + dist * Math.cos(angle) / mpld
  }
}

export function worldBearing(a: LatLng, b: LatLng): number {
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)
  const lon1 = toRadians(a.lng)
  const lon2 = toRadians(b.lng)

  const deltaLon = lon2 - lon1

  const y = Math.sin(deltaLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);

  const initialBearing = Math.atan2(y, x); // Bearing in radians
  const normalizedBearing = mod2pi(initialBearing); // Convert to degrees and normalize

  return normalizedBearing;
}

export function bearing(a: XY, b: XY): number {
  return (Math.atan2((b.x - a.x), (b.y - a.y)) + Math.PI * 2) % (Math.PI * 2)
}

export function modf(angle: number, divisor: number): number {
  return (divisor + (angle % divisor)) % divisor
}

export function mod2pi(angle: number): number {
  return modf(angle, Math.PI * 2)

}

import { Segment, Path, XY } from "@/types/dubins";

export function segmentLength(seg: Segment): number{
  switch( seg.type){
    case "Curve": 
      return Math.abs(seg.theta * seg.radius)
    case "Straight":
      return dist(seg.start, seg.end)
  }
}

export function worldSegmentLength(seg: Segment): number{
  switch( seg.type){
    case "Curve": 
      return Math.abs(seg.theta * seg.radius)
    case "Straight":
      return world_dist(seg.start, seg.end)
  }
}

export function world_dist(a: XY, b: XY){
  const R = 6371000; // Earth's radius in meters
  const lat1 = a.y * Math.PI / 180;
  const lat2 = b.y * Math.PI / 180;
  const deltaLat = (b.y - a.y) * Math.PI / 180;
  const deltaLon = (b.x - a.x) * Math.PI / 180;

  const aHav = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(aHav), Math.sqrt(1 - aHav));
  
  // Return the distance in meters
  return R * c;

}

export function dist(a: XY, b: XY){
  // euclidean distance function
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2))
}

export function pathLength(path: Path){
  return path.map((x: Segment) => segmentLength(x)).reduce((acc, a) => acc + a, 0)
}

export function worldPathLength(path: Path){
  return path.map((x: Segment) => worldSegmentLength(x)).reduce((acc, a) => acc + a, 0)
}

export function offset(a: XY, dist: number, angle: number):XY{
  return {
    x: a.x + dist * Math.sin(angle),
    y: a.y + dist * Math.cos(angle)
  }
}

export function worldOffset(a: XY, dist: number, angle: number): XY{ 
  const latRad = a.y * Math.PI / 180
  const mpld = 111320.0;
  const mplo = 111320.0 * Math.cos(latRad);
  return {
    x: a.x + dist*Math.sin(angle) / mplo,
    y: a.y + dist*Math.cos(angle) / mpld
  }
}

export function worldBearing(a: XY, b: XY): number{
  const lat1 = a.y * Math.PI / 180; // Convert latitude of point a to radians
  const lat2 = b.y * Math.PI / 180; // Convert latitude of point b to radians
  const lon1 = a.x * Math.PI / 180; // Convert longitude of point a to radians
  const lon2 = b.x * Math.PI / 180; // Convert longitude of point b to radians

  const deltaLon = lon2 - lon1;

  const y = Math.sin(deltaLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);

  const initialBearing = Math.atan2(y, x); // Bearing in radians
  const normalizedBearing = mod2pi(initialBearing); // Convert to degrees and normalize

  return normalizedBearing;
}

export function bearing(a: XY, b: XY): number{
  return (Math.atan2((b.x - a.x), (b.y - a.y)) + Math.PI * 2) % (Math.PI * 2)
}

export function modf(angle: number, divisor: number): number{
  return (divisor + (angle % divisor)) % divisor
}

export function mod2pi(angle: number): number{
  return modf(angle, Math.PI*2)

}

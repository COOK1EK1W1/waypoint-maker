import { Segment, Path, XY } from "@/types/dubins";

export function segmentLength(seg: Segment): number{
  switch( seg.type){
    case "Curve": 
      return Math.abs(seg.theta * seg.radius)
    case "Straight":
      return dist(seg.start, seg.end)
  }
}

export function dist(a: XY, b: XY){
  // euclidean distance function
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2))
}

export function pathLength(path: Path){
  return path.map((x: Segment) => segmentLength(x)).reduce((acc, a) => acc + a, 0)
}

export function offset(a: XY, dist: number, angle: number): XY{ 
  return {
    x: a.x + Math.sin(angle) * dist,
    y: a.y + Math.cos(angle) * dist
  }
}

export function bearing(a: XY, b: XY): number{
  return (Math.atan2((b.x - a.x), (b.y - a.y)) + Math.PI * 2) % (Math.PI * 2)
}

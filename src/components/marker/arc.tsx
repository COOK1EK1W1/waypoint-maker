import { Polyline } from "react-leaflet"
import { Curve } from "@/types/dubins"
import { latLng, LatLngExpression, PathOptions } from "leaflet"
import { offset, worldOffset } from "@/lib/dubins/geometry"

export default function Arc({ curve, pathOptions }: { curve: Curve, pathOptions?: PathOptions }) {

  let points: LatLngExpression[] = []

  if (curve.theta < 0) {
    for (let i = 0; i > curve.theta; i -= 0.1) {
      let a = worldOffset(curve.center, curve.radius, curve.start + i)
      points.push(latLng(a.y, a.x))
    }
    let a = worldOffset(curve.center, curve.radius, curve.start + curve.theta)
    points.push(latLng(a.y, a.x))
  } else {
    for (let i = 0; i < curve.theta; i += 0.1) {
      let a = worldOffset(curve.center, curve.radius, curve.start + i)
      points.push(latLng(a.y, a.x))
    }
    let a = worldOffset(curve.center, curve.radius, curve.start + curve.theta)
    points.push(latLng(a.y, a.x))
  }

  return (
    <Polyline pathOptions={pathOptions} positions={points} />
  )

}

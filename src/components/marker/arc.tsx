import { Polyline } from "react-leaflet"
import { latLng, LatLngExpression, PathOptions } from "leaflet"
import { worldOffset } from "@/lib/world/distance"
import { Curve } from "@/lib/dubins/types"
import { LatLng } from "@/lib/world/latlng"

export default function Arc({ curve, pathOptions }: { curve: Curve<LatLng>, pathOptions?: PathOptions }) {

  let points: LatLngExpression[] = []

  if (curve.theta < 0) {
    for (let i = 0; i > curve.theta; i -= 0.1) {
      let a = worldOffset(curve.center, curve.radius, curve.start + i)
      points.push(latLng(a.lat, a.lng))
    }
    let a = worldOffset(curve.center, curve.radius, curve.start + curve.theta)
    points.push(latLng(a.lat, a.lng))
  } else {
    for (let i = 0; i < curve.theta; i += 0.1) {
      let a = worldOffset(curve.center, curve.radius, curve.start + i)
      points.push(latLng(a.lat, a.lng))
    }
    let a = worldOffset(curve.center, curve.radius, curve.start + curve.theta)
    points.push(latLng(a.lat, a.lng))
  }

  return (
    <Polyline pathOptions={pathOptions} positions={points} />
  )

}

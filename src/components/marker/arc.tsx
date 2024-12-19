import { Polyline } from "react-leaflet"
import { Curve } from "@/types/dubins"
import { latLng, LatLngExpression } from "leaflet"
import { offset } from "@/lib/dubins/geometry"

const limeOptions = { color: 'lime' }
export default function Arc({curve} : {curve: Curve}){

  let points: LatLngExpression[] = []

  if (curve.theta < 0){
    for (let i = 0; i > curve.theta; i -= 0.1){
      let a = offset(curve.center, curve.radius, curve.start + i)
      points.push(latLng(a.y, a.x))
    }
    let a = offset(curve.center, curve.radius, curve.start+curve.theta)
    points.push(latLng(a.y, a.x))
  }else{
    for (let i = 0; i < curve.theta; i += 0.1){
      let a = offset(curve.center, curve.radius, curve.start + i)
      points.push(latLng(a.y, a.x))
    }
    let a = offset(curve.center, curve.radius, curve.start+curve.theta)
    points.push(latLng(a.y, a.x))
  }

  return (
      <Polyline pathOptions={limeOptions} positions={points} />
  )

}

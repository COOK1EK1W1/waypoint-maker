import { Waypoint, WaypointCollection } from "@/types/waypoints";
import { angleBetweenPoints, gradient, haversineDistance } from "./distance";


export enum Severity {
  Med,
  Bad
}

export function wpCheck(wps: Waypoint[], waypoints: WaypointCollection): [string, Severity][]{
  let ret: [string, Severity][] = []

  if (wps.length == 0){
    ret.push(["place a waypoint to get started", Severity.Bad])

  }

  // check for landing waypoint

  const landing_wps = wps.filter((x)=>x.type == 21)
  if (landing_wps.length == 0){
    ret.push(["No landing Waypoint", Severity.Bad])
  }else if (landing_wps.length == 1){
    // pass
  }else if (landing_wps.length >= 1){
    ret.push(["Multiple landing Waypoints", Severity.Bad])
  }

  landing_wps.map((x)=> {
    if (x.param7 >1) ret.push(["Landing above ground", Severity.Bad])
    else if (x.param7 <0) ret.push(["Landing below ground", Severity.Bad])

  })

  // check for do_land_start waypoint

  const do_landing_wps = wps.filter((x)=>x.type == 189)
  if (do_landing_wps.length == 0){
    ret.push(["No 'do land start' Waypoint", Severity.Bad])
  }else if (do_landing_wps.length == 1){
    // pass
  }else if (do_landing_wps.length >= 1){
    ret.push(["Multiple 'do land start' Waypoints", Severity.Bad])
  }

  // check for takeoff waypoint

  const takeoff_wps = wps.filter((x)=>x.type == 22)
  if (takeoff_wps.length == 0){
    ret.push(["No takeoff Waypoint", Severity.Bad])
  }else if (takeoff_wps.length == 1){
    // pass
  }else if (takeoff_wps.length >= 1){
    ret.push(["Multiple Takeoff Waypoints", Severity.Bad])
  }

  // check the takeoff has enough pitch
  takeoff_wps.map((wp) => {
    if (wp.param1 < 0){
      ret.push(["Negative pitch on Takeoff", Severity.Bad])
    }else if (wp.param1 == 0){
      ret.push(["No pitch up on Takeoff", Severity.Bad])
    }else if (wp.param1 <= 5){
      ret.push(["Not a lot of pitch up", Severity.Med])
    }else if (wp.param1 <= 40){
      // pass
    }else if (wp.param1 <= 90){
      ret.push(["Very high pitch up on Takeoff", Severity.Med])
    }
  })


  let gradients: number[] = []
  for (let i = 0; i < wps.length - 1; i++){
    gradients.push(gradient(haversineDistance(wps[i].param5, wps[i].param6, wps[i+1].param5, wps[i+1].param6), wps[i].param7, wps[i+1].param7))
  }

  gradients.map((grad) => {
    if (grad >= 30){
      ret.push(["very steep gradient", Severity.Med])
    }else if(grad <= -30){
      ret.push(["very steep gradient", Severity.Med])
    }
  })


  let angles: number[] = []

  for (let i = 0; i < wps.length - 2; i++){
    angles.push(angleBetweenPoints(wps[i].param5, wps[i].param6, wps[i+1].param5, wps[i+1].param6, wps[i+2].param5, wps[i+2].param6))
  }
  angles.map((angle) => {
    if (angle <= 40){
      ret.push(["angle between points is sharp", Severity.Med])
    }
  })
  
  /*
  getTerrain(wps.map((x)=>[x.param5, x.param6]))
    .then((terrainHeights)=>{
      if (!terrainHeights) return
      console.log(terrainHeights)
      let terrainoffset = terrainHeights[0].elevation
      for (let i = 0; i < wps.length; i++){
        let wpheight = wps[i].param7 - (terrainHeights[i].elevation - terrainoffset)
        if (wpheight < 0){
          ret.push(["waypoint is below surface", Severity.Bad])
        }else if(wpheight > 120){
          ret.push(["waypoint is above legal height for flying", Severity.Bad])

        }

      }

    })
  */



  return ret

}

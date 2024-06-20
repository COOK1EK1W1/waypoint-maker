import { Waypoint } from "@/types/waypoints";


export enum Severity {
  Med,
  Bad
}

export function wpCheck(wps: Waypoint[]): [string, Severity][]{
  let ret: [string, Severity][] = []


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


  return ret

}

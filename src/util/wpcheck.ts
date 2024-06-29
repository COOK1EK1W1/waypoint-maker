import { Fault, Severity, Waypoint, WaypointCollection } from "@/types/waypoints";
import { angleBetweenPoints, gradient, haversineDistance } from "./distance";
import { findnthwaypoint, get_waypoints, isPointInPolygon } from "./WPCollection";



export function wpCheck(wps: Waypoint[], waypoints: WaypointCollection): Fault[]{
  let ret: Fault[] = []

  if (wps.length == 0){
    ret.push({
      message: "No waypoints to analyse, place one to get started",
      severity: Severity.Bad
    })
    return ret
  }else if ( wps.length < 3){
    ret.push({
      message: "at least 3 waypoints are required for a mission",
      severity: Severity.Med
    })
    return ret
  }




/* -=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=- */
/*                            Takeoff                            */
/* -=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=- */

  const takeoff_wps = wps.filter((x)=>x.type == 22)
  if (takeoff_wps.length == 0){
    ret.push({
      message: "No takeoff Waypoint",
      severity: Severity.Bad,
    })
  }else if (takeoff_wps.length == 1){
    // pass
  }else if (takeoff_wps.length >= 1){
    ret.push({
      message: "Multiple Takeoff Waypoints",
      severity: Severity.Bad,
    })
  }

  if (wps[0].type != 22){
    let wp = findnthwaypoint("Main", 0, waypoints)
    if (wp){
      ret.push({
        message: "Takeoff Waypoint should be the first waypoint",
        severity: Severity.Bad,
        offenderMission: wp[0],
        offenderIndex: wp[1]
      })
    }
  }

  // check the takeoff has enough pitch
  wps.map((wp, idx) => {
    if (wp.type != 22) return
    const offender = findnthwaypoint("Main", idx, waypoints)
    if (offender){
      if (wp.param1 < 0){
        ret.push({
          message: "Negative pitch on Takeoff",
          severity: Severity.Bad,
          offenderMission: offender[0],
          offenderIndex: offender[1]
        })
      }else if (wp.param1 == 0){
        ret.push({
          message: "No pitch up on Takeoff",
          severity: Severity.Bad,
          offenderMission: offender[0],
          offenderIndex: offender[1]
        })
      }else if (wp.param1 <= 5){
        ret.push({
          message: "Not a lot of pitch up on Takeoff",
          severity: Severity.Med,
          offenderMission: offender[0],
          offenderIndex: offender[1]
        })
      }else if (wp.param1 <= 40){
        // pass
      }else if (wp.param1 <= 90){
        ret.push({
          message: "Very high pitch up on Takeoff",
          severity: Severity.Med,
          offenderMission: offender[0],
          offenderIndex: offender[1]
        })
      }
    }
  })






/* -=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=- */
/*                            Landing                            */
/* -=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=- */

  const landing_wps = wps.filter((x)=>x.type == 21)
  if (landing_wps.length == 0){
    ret.push({
      message: "No landing Waypoint, change the type of the last waypoint to a Landing one",
      severity: Severity.Bad
    })
  }else if (landing_wps.length == 1){
    // pass
  }else if (landing_wps.length >= 1){
    ret.push({
      message: "You have multiple landing waypoints",
      severity: Severity.Bad
    })
  }

  wps.map((x, idx)=> {
    if (x.type != 21) return
    const wp = findnthwaypoint("Main", idx, waypoints)
    if (wp){
      if (x.param7 >1) {
        ret.push({
          message: "Landing waypoint is above ground level",
          severity: Severity.Bad,
          offenderMission: wp[0],
          offenderIndex: wp[1]
        })
      }else if (x.param7 <0) {
        ret.push({
          message: "Landing waypoint is below ground level",
          severity: Severity.Bad,
          offenderMission: wp[0],
          offenderIndex: wp[1]
        })

      }
    }

  })

  // check for do_land_start waypoint
  const do_landing_wps = wps.filter((x)=>x.type == 189)
  if (do_landing_wps.length == 0){
    ret.push({
      message: "No 'do land start' Waypoint",
      severity: Severity.Bad,
    })
  }else if (do_landing_wps.length == 1){
    // pass
  }else if (do_landing_wps.length >= 1){
    ret.push({
      message: "Multiple 'do land start' Waypoints",
      severity: Severity.Med,
    })
  }

  
  if (wps[wps.length-1].type != 21){
    let wp = findnthwaypoint("Main", wps.length-1, waypoints)
    if (wp){
      ret.push({
        message: "Landing Waypoint should be the last Waypoint",
        severity: Severity.Bad,
        offenderMission: wp[0],
        offenderIndex: wp[1]
      })
    }
  }



/* -=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=- */
/*                       Gradient & Angle                        */
/* -=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=- */

  let gradients: number[] = []
  for (let i = 0; i < wps.length - 1; i++){
    gradients.push(gradient(haversineDistance(wps[i].param5, wps[i].param6, wps[i+1].param5, wps[i+1].param6), wps[i].param7, wps[i+1].param7))
  }

  gradients.map((grad, idx) => {
    const offender = findnthwaypoint("Main", idx + 1, waypoints)
    if (offender){
      if (grad >= 30){
        ret.push({
          message: "Very steep gradient between previous and this waypoint",
          severity: Severity.Med,
          offenderMission: offender[0],
          offenderIndex: offender[1]
        })
      }else if(grad <= -30){
        ret.push({
          message: "Very steep gradient between previous and this waypoint",
          severity: Severity.Med,
          offenderMission: offender[0],
          offenderIndex: offender[1]
        })
      }else{
        // pass

      }
    }
  })


  let angles: number[] = []

  for (let i = 0; i < wps.length - 2; i++){
    angles.push(angleBetweenPoints(wps[i].param5, wps[i].param6, wps[i+1].param5, wps[i+1].param6, wps[i+2].param5, wps[i+2].param6))
  }
  angles.map((angle, idx) => {
    const offender = findnthwaypoint("Main", idx + 1, waypoints)
    if (offender){
      if (angle <= 40){
        ret.push({
          message: "Angle between points is sharp",
          severity: Severity.Med,
          offenderMission: offender[0],
          offenderIndex: offender[1]
        })
      }
    }
  })

/* -=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=- */
/*                     full subMission use                       */
/* -=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=- */

  Array.from(waypoints.keys()).map((key)=>{
    if (key == "Main" || key == "Geofence" || key == "Markers") return
    let found = false
    Array.from(waypoints.keys()).map((mission)=>{
      if (mission == "Geofence" || mission == "Markers") return
      console.log("finding", key, "in mission", mission)
      let nodes = waypoints.get(mission)
      if (!nodes)return
      nodes.map((node)=>{
        if (node.type != "Collection") return
        if (node.name == key) found = true
      })

    })
    if (!found){
      ret.push({
        message: "Sub Mission is not in use",
        severity: Severity.Med,
        offenderMission: key,
      })

    }

  })
  
/* -=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=- */
/*                    all WPs inside geofence                    */
/* -=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=- */
  let all_inside = true
  wps.map((wp) => {
    if (!isPointInPolygon(get_waypoints("Geofence", waypoints), wp)){
      all_inside = false
    }
  })
  if (!all_inside){
    ret.push({
      message: "some waypoints outside the geofence",
      severity: Severity.Bad,
    })


  }
  return ret

}

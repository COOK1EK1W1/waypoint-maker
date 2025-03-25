import { WaypointCollection } from "@/lib/waypoints/waypointCollection";
import { angleBetweenPoints, gradient, haversineDistance } from "@/lib/world/distance";
import { Command, filterLatLngAltCmds } from "@/lib/commands/commands";
import { Fault, Severity } from "@/lib/wpcheck/types";
import { getLatLng, hasLocation } from "@/util/WPCollection";
import { isPointInPolygon } from "../math/geometry";
import { g2l } from "../world/conversion";
import { LatLng } from "../world/types";



export function wpCheck(wps: Command[], waypoints: WaypointCollection): Fault[] {
  let ret: Fault[] = []

  if (wps.length == 0) {
    ret.push({
      message: "No waypoints to analyse, place one to get started",
      severity: Severity.Bad
    })
    return ret
  } else if (wps.length < 3) {
    ret.push({
      message: "at least 3 waypoints are required for a mission",
      severity: Severity.Med
    })
    return ret
  }



  // convert everything to local space
  const geofenceLocs = waypoints.flatten("Geofence").map(getLatLng).filter((x) => x != null)
  const missionLocsCmds = filterLatLngAltCmds(waypoints.flatten("Main"))
  const missionLocs = waypoints.flatten("Main").map(getLatLng).filter((x) => x != null)
  const geofenceLocal = geofenceLocs.map((x) => g2l(waypoints.getReferencePoint(), x))
  const missionLocal = missionLocs.map((x) => g2l(waypoints.getReferencePoint(), x))


  /* -=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=- */
  /*                            Takeoff                            */
  /* -=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=- */

  const takeoff_wps = wps.filter((x) => x.type == 22)
  if (takeoff_wps.length == 0) {
    ret.push({
      message: "No takeoff Waypoint",
      severity: Severity.Bad,
    })
  } else if (takeoff_wps.length == 1) {
    // pass
  } else if (takeoff_wps.length >= 1) {
    ret.push({
      message: "Multiple Takeoff Waypoints",
      severity: Severity.Bad,
    })
  }

  if (wps[0].type != 22) {
    let wp = waypoints.findNthPosition("Main", 0)
    if (wp) {
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
    const offender = waypoints.findNthPosition("Main", idx)
    if (offender) {
      if (wp.params.pitch < 0) {
        ret.push({
          message: "Negative pitch on Takeoff",
          severity: Severity.Bad,
          offenderMission: offender[0],
          offenderIndex: offender[1]
        })
      } else if (wp.params.pitch == 0) {
        ret.push({
          message: "No pitch up on Takeoff",
          severity: Severity.Bad,
          offenderMission: offender[0],
          offenderIndex: offender[1]
        })
      } else if (wp.params.pitch <= 5) {
        ret.push({
          message: "Not a lot of pitch up on Takeoff",
          severity: Severity.Med,
          offenderMission: offender[0],
          offenderIndex: offender[1]
        })
      } else if (wp.params.pitch <= 40) {
        // pass
      } else if (wp.params.pitch <= 90) {
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

  const landing_wps = wps.filter((x) => x.type == 21)
  if (landing_wps.length == 0) {
    ret.push({
      message: "No landing Waypoint, change the type of the last waypoint to a Landing one",
      severity: Severity.Bad
    })
  } else if (landing_wps.length == 1) {
    // pass
  } else if (landing_wps.length >= 1) {
    ret.push({
      message: "You have multiple landing waypoints",
      severity: Severity.Bad
    })
  }

  wps.map((x, idx) => {
    if (x.type != 21) return
    const wp = waypoints.findNthPosition("Main", idx)
    if (wp) {
      if (x.params.altitude > 1) {
        ret.push({
          message: "Landing waypoint is above ground level",
          severity: Severity.Bad,
          offenderMission: wp[0],
          offenderIndex: wp[1]
        })
      } else if (x.params.altitude < 0) {
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
  const do_landing_wps = wps.filter((x) => x.type == 189)
  if (do_landing_wps.length == 0) {
    ret.push({
      message: "No 'do land start' Waypoint",
      severity: Severity.Bad,
    })
  } else if (do_landing_wps.length == 1) {
    // pass
  } else if (do_landing_wps.length >= 1) {
    ret.push({
      message: "Multiple 'do land start' Waypoints",
      severity: Severity.Med,
    })
  }


  if (wps[wps.length - 1].type != 21) {
    let wp = waypoints.findNthPosition("Main", wps.length - 1)
    if (wp) {
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

  let gradients: (number | null)[] = []
  for (let i = 0; i < missionLocsCmds.length - 1; i++) {
    if (hasLocation(wps[i])) {
      gradients.push(gradient(haversineDistance(getLatLng(missionLocsCmds[i]) as LatLng, getLatLng(missionLocsCmds[i + 1]) as LatLng), missionLocsCmds[i].params.altitude, missionLocsCmds[i + 1].params.altitude))
    } else {
      gradients.push(null)
    }
  }

  gradients.map((grad, idx) => {
    const offender = waypoints.findNthPosition("Main", idx + 1)
    if (offender && grad) {
      if (grad >= 30) {
        ret.push({
          message: "Very steep gradient between previous and this waypoint",
          severity: Severity.Med,
          offenderMission: offender[0],
          offenderIndex: offender[1]
        })
      } else if (grad <= -30) {
        ret.push({
          message: "Very steep gradient between previous and this waypoint",
          severity: Severity.Med,
          offenderMission: offender[0],
          offenderIndex: offender[1]
        })
      } else {
        // pass

      }
    }
  })


  let angles: number[] = []

  for (let i = 0; i < wps.length - 2; i++) {
    angles.push(angleBetweenPoints(
      missionLocs[i],
      missionLocs[i + 1],
      missionLocs[i + 2]))
  }
  angles.map((angle, idx) => {
    const offender = waypoints.findNthPosition("Main", idx + 1)
    if (offender) {
      if (angle <= 40) {
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

  waypoints.getMissions().map((key) => {
    if (key == "Main" || key == "Geofence" || key == "Markers") return
    let found = false
    waypoints.getMissions().map((mission) => {
      if (mission == "Geofence" || mission == "Markers") return
      let nodes = waypoints.get(mission)
      nodes.map((node) => {
        if (node.type != "Collection") return
        if (node.name == key) found = true
      })

    })
    if (!found) {
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
  missionLocal.map((wp) => {
    if (!isPointInPolygon(geofenceLocal, wp)) {
      all_inside = false
    }
  })
  if (!all_inside) {
    ret.push({
      message: "some waypoints outside the geofence",
      severity: Severity.Bad,
    })
  }

  const geofence = waypoints.get("Geofence")
  if (geofence.length == 0) {
    ret.push({
      message: "No geofence setup",
      severity: Severity.Med,
    })

  } else if (geofence.length < 3) {
    ret.push({
      message: "Not enough geofence waypoints",
      severity: Severity.Bad,
    })
  } else {
  }







  return ret

}

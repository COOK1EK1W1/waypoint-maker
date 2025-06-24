import { Mission } from "@/lib/mission/mission";
import { angleBetweenPoints, gradient, haversineDistance } from "@/lib/world/distance";
import { Command, filterLatLngAltCmds } from "@/lib/commands/commands";
import { Fault, Severity } from "@/lib/wpcheck/types";
import { deg2rad, isPointInPolygon } from "../math/geometry";
import { g2l } from "../world/conversion";
import { getLatLng, LatLng } from "../world/latlng";
import { Vehicle } from "../vehicles/types";
import { getMinTurnRadius } from "../dubins/dubinWaypoints";



export function* wpCheck(wps: Command[], waypoints: Mission, vehicle: Vehicle): Generator<Fault, void, unknown> {

  if (wps.length == 0) {
    yield {
      message: "No waypoints to analyse, place one to get started",
      severity: Severity.Bad
    }
    return
  } else if (wps.length < 3) {
    yield {
      message: "at least 3 waypoints are required for a mission",
      severity: Severity.Med
    }
    return
  }



  // convert everything to local space
  const geofenceLocs = waypoints.flatten("Geofence").map(getLatLng).filter((x) => x !== undefined)
  const missionLocsCmds = filterLatLngAltCmds(waypoints.flatten("Main"))
  const missionLocs = missionLocsCmds.map(getLatLng) as LatLng[]
  const geofenceLocal = geofenceLocs.map((x) => g2l(waypoints.getReferencePoint(), x))
  const missionLocal = missionLocs.map((x) => g2l(waypoints.getReferencePoint(), x))


  /* -=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=- */
  /*                            Takeoff                            */
  /* -=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=- */

  const takeoff_wps = wps.filter((x) => x.type == 22)
  if (takeoff_wps.length == 0) {
    yield {
      message: "No takeoff Waypoint",
      severity: Severity.Bad,
    }
  } else if (takeoff_wps.length == 1) {
    // pass
  } else if (takeoff_wps.length >= 1) {
    yield {
      message: "Multiple Takeoff Waypoints",
      severity: Severity.Bad,
    }
  }

  if (wps[0].type != 22) {
    let wp = waypoints.findNthPosition("Main", 0)
    if (wp) {
      yield {
        message: "Takeoff Waypoint should be the first waypoint",
        severity: Severity.Bad,
        offenderMission: wp[0],
        offenderIndex: wp[1]
      }
    }
  }

  // check the takeoff has enough pitch
  const wp = wps[0]
  if (wp.type === 22) {
    const offender = waypoints.findNthPosition("Main", 0)
    if (offender) {
      if (wp.params.pitch < 0) {
        yield {
          message: "Negative pitch on Takeoff",
          severity: Severity.Bad,
          offenderMission: offender[0],
          offenderIndex: offender[1]
        }
      } else if (wp.params.pitch == 0) {
        yield {
          message: "No pitch up on Takeoff",
          severity: Severity.Bad,
          offenderMission: offender[0],
          offenderIndex: offender[1]
        }
      } else if (wp.params.pitch <= 5) {
        yield {
          message: "Not a lot of pitch up on Takeoff",
          severity: Severity.Med,
          offenderMission: offender[0],
          offenderIndex: offender[1]
        }
      } else if (wp.params.pitch <= 40) {
        // pass
      } else if (wp.params.pitch <= 90) {
        yield {
          message: "Very high pitch up on Takeoff",
          severity: Severity.Med,
          offenderMission: offender[0],
          offenderIndex: offender[1]
        }
      }
    }

  }





  /* -=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=- */
  /*                            Landing                            */
  /* -=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=- */

  const landing_wps = wps.filter((x) => x.type == 21)
  if (landing_wps.length == 0) {
    yield {
      message: "No landing Waypoint, change the type of the last waypoint to a Landing one",
      severity: Severity.Bad
    }
  } else if (landing_wps.length == 1) {
    // pass
  } else if (landing_wps.length >= 1) {
    yield {
      message: "You have multiple landing waypoints",
      severity: Severity.Bad
    }
  }

  for (let i = 0; i < wps.length; i++) {
    const wp = wps[i]
    if (wp.type != 21) continue
    const offender = waypoints.findNthPosition("Main", i)
    if (offender) {
      if (wp.params.altitude > 1) {
        yield {
          message: "Landing waypoint is above ground level",
          severity: Severity.Bad,
          offenderMission: offender[0],
          offenderIndex: offender[1]
        }
      } else if (wp.params.altitude < 0) {
        yield {
          message: "Landing waypoint is below ground level",
          severity: Severity.Bad,
          offenderMission: offender[0],
          offenderIndex: offender[1]
        }

      }
    }
  }

  // check for do_land_start waypoint
  const do_landing_wps = wps.filter((x) => x.type == 189)
  if (do_landing_wps.length == 0) {
    yield {
      message: "No 'do land start' Waypoint",
      severity: Severity.Bad,
    }
  } else if (do_landing_wps.length == 1) {
    // pass
  } else if (do_landing_wps.length >= 1) {
    yield {
      message: "Multiple 'do land start' Waypoints",
      severity: Severity.Med,
    }
  }


  if (wps[wps.length - 1].type != 21) {
    let wp = waypoints.findNthPosition("Main", wps.length - 1)
    if (wp) {
      yield {
        message: "Landing Waypoint should be the last Waypoint",
        severity: Severity.Bad,
        offenderMission: wp[0],
        offenderIndex: wp[1]
      }
    }
  }



  /* -=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=- */
  /*                       Gradient & Angle                        */
  /* -=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=- */

  let gradients: (number | null)[] = []
  for (let i = 0; i < missionLocsCmds.length - 1; i++) {
    gradients.push(gradient(haversineDistance(getLatLng(missionLocsCmds[i]) as LatLng, getLatLng(missionLocsCmds[i + 1]) as LatLng), missionLocsCmds[i].params.altitude, missionLocsCmds[i + 1].params.altitude))
  }

  for (let i = 0; i < gradients.length; i++) {
    const grad = gradients[i]
    const offender = waypoints.findNthPosition("Main", i + 1)
    if (offender && grad) {
      if (grad >= 30) {
        yield {
          message: "Very steep gradient between previous and this waypoint",
          severity: Severity.Med,
          offenderMission: offender[0],
          offenderIndex: offender[1]
        }
      } else if (grad <= -30) {
        yield {
          message: "Very steep gradient between previous and this waypoint",
          severity: Severity.Med,
          offenderMission: offender[0],
          offenderIndex: offender[1]
        }
      } else {
        // pass

      }
    }
  }


  let angles: number[] = []

  for (let i = 0; i < missionLocs.length - 2; i++) {
    angles.push(angleBetweenPoints(
      missionLocs[i],
      missionLocs[i + 1],
      missionLocs[i + 2]))
  }
  if (vehicle.type === "Plane"){
    const minTurnRadius = getMinTurnRadius(vehicle.maxBank, vehicle.cruiseAirspeed)
    for (let i = 0; i < angles.length; i++) {
      const angle = angles[i]
      const distRequired = minTurnRadius * 2.85 * Math.sin(deg2rad(angle) * 0.8 + 0.6) // fancy math using two tangnet circles as the flight path
      const offender = waypoints.findNthPosition("Main", i + 1)
      if (offender) {
        if (distRequired > haversineDistance(missionLocs[i + 1], missionLocs[i + 2])) {
          yield {
            message: "Angle between points is sharp",
            severity: Severity.Med,
            offenderMission: offender[0],
            offenderIndex: offender[1]
          }
        }
      }
    }
  }

  /* -=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=- */
  /*                     full subMission use                       */
  /* -=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=-=x=- */

  for (const key of waypoints.getMissions()) {
    if (key == "Main" || key == "Geofence" || key == "Markers") continue
    let found = false
    for (const mission of waypoints.getMissions()) {
      if (mission == "Geofence" || mission == "Markers") continue
      let nodes = waypoints.get(mission)
      for (const node of nodes) {
        if (node.type != "Collection") continue
        if (node.name == key) found = true
      }
    }
    if (!found) {
      yield {
        message: "Sub Mission is not in use",
        severity: Severity.Med,
        offenderMission: key,
      }

    }
  }

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
    yield {
      message: "some waypoints outside the geofence",
      severity: Severity.Bad,
    }
  }

  const geofence = waypoints.get("Geofence")
  if (geofence.length == 0) {
    yield {
      message: "No geofence setup",
      severity: Severity.Med,
    }

  } else if (geofence.length < 3) {
    yield {
      message: "Not enough geofence waypoints",
      severity: Severity.Bad,
    }
  } else {
  }
}

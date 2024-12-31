import { Waypoint } from "@/types/waypoints";
import { deg2rad, rad2deg, worldOffset } from "./geometry";
import { DubinsBetweenDiffRad } from "./dubins";
import { Path } from "@/types/dubins";

export function splitDubinsRuns(wps: Waypoint[]): {start: number, wps: Waypoint[]}[]{
  let dubinSections: {start: number, wps: Waypoint[]}[] = []

  let curSection: Waypoint[] = []
  let start = 0
  for (let i = 0; i < wps.length; i++){
    const curWaypoint = wps[i]
    if (curWaypoint.type == 69){
      if (curSection.length == 0){
        start = i-1
        if (i > 0){
          curSection.push(wps[i-1])
        }
      }
      curSection.push(curWaypoint)
    }else{
      if (curSection.length > 0){
        if (i < wps.length){
          curSection.push(wps[i])
        }
        dubinSections.push({start: start, wps: curSection})
        curSection = []
      }
    }
  }
  if (curSection.length > 0){
    dubinSections.push({start: start, wps: curSection})
  }
  return dubinSections

}

export function dubinsBetweenWaypoint(a: Waypoint, b: Waypoint): Path{
  if (a.type == 69){
    let angleA = deg2rad(a.param2)
    if (b.type == 69){
      let angleB = deg2rad(b.param2)
      let offset_a = worldOffset({x: a.param6, y: a.param5}, a.param1, angleA - Math.PI/2)
      let offset_b = worldOffset({x: b.param6, y: b.param5}, b.param1, angleB - Math.PI/2)
      return DubinsBetweenDiffRad(offset_a, offset_b, angleA, angleB, a.param3, b.param3)
    }else{
      let offset_a = worldOffset({x: a.param6, y: a.param5}, a.param1, angleA - Math.PI/2)
      let offset_b = {x: b.param6, y: b.param5}
      return DubinsBetweenDiffRad(offset_a, offset_b, angleA, 0, a.param3, 0)
    }
  }else{
    if (b.type == 69){
      let angleB = deg2rad(b.param2)
      let offset_a = {x: a.param6, y: a.param5}
      let offset_b = worldOffset({x: b.param6, y: b.param5}, b.param1, angleB - Math.PI/2)
      return DubinsBetweenDiffRad(offset_a, offset_b, 0, angleB, 0, b.param3)

    }else{
      return []
    }

  }
}

export function getTunableParameters(wps: Waypoint[]): number[]{
  let ret: number[] = []
  for (const waypoint of wps){
    if (waypoint.type == 69){
      ret.push(deg2rad(waypoint.param2))
      ret.push(waypoint.param3)
    }
  }
  return ret
}

export function setTunableParameter(wps: Waypoint[], params: number[]): Waypoint[]{
  let localparams = [...params]
  let newWaypoints = []
  for (let i = 0; i < wps.length; i++){
    let cur = {...wps[i]}
    if (cur.type == 69){
      // radians
      let next = localparams.shift()
      if (next){
        cur.param2 = rad2deg(next)
      }
      next = localparams.shift()
      if (next){
        cur.param3 = next
      }
    }
    newWaypoints.push(cur)

  }
  return newWaypoints

}

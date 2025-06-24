import { useWaypoints } from "@/util/context/WaypointContext"
import { useEffect, useState, useMemo } from "react"
import FaultItem from "@/components/toolBar/faultItem"
import { wpCheck } from "@/lib/wpcheck/wpcheck"
import { Fault, Severity } from "@/lib/wpcheck/types"
import { filterLatLngAltCmds } from "@/lib/commands/commands"
import { getLatLng } from "@/lib/world/latlng"
import { getTerrain } from "@/lib/world/terrain"
import { useVehicle } from "@/util/context/VehicleTypeContext"

export default function WPCheckModal() {
  const { waypoints } = useWaypoints()
  const { vehicle } = useVehicle()
  const [terrain, setTerrain] = useState<Fault[] | null>(null)

  // Move variable declarations before useEffect and use useMemo for expensive computations
  const wps = useMemo(() => filterLatLngAltCmds(waypoints.flatten("Main")), [waypoints])
  const locs = useMemo(() => wps.map(getLatLng).filter((x) => x !== undefined), [wps])

  // Memoize the WP check results to avoid running the while loop on every render
  const results = useMemo(() => {
    const WPCheckGen = wpCheck(wps, waypoints, vehicle)
    let results: Fault[] = []
    let done = false
    while (!done) {
      const val = WPCheckGen.next()
      if (val.done) {
        done = true
      } else {
        results.push(val.value)
      }
    }
    return results
  }, [wps, waypoints, vehicle])

  useEffect(() => {
    getTerrain(locs)
      .then((terrainHeights) => {
        if (!terrainHeights) return
        let ret: Fault[] = []
        for (let i = 0; i < wps.length; i++) {
          let wp = waypoints.findNthPosition("Main", i)
          if (!wp) { continue }
          let wpheight = wps[i].params.altitude
          switch (wps[i].frame) {
            case 0: //AMSL (adjust to relative for graph)
              wpheight += -terrainHeights[0].alt
              break;
            case 3: // Relative to first command
              break;
            case 10: // Relative to terrain
              wpheight += terrainHeights[i].alt - terrainHeights[0].alt;
              break;
          }
          if (wpheight < 0) {
            ret.push({
              message: "The waypoint is below terrain",
              severity: Severity.Bad,
              offenderMission: wp[0],
              offenderIndex: wp[1]
            })
          } else if (wpheight > 120) {
            ret.push({
              message: "The waypoint is above legal height for flying",
              severity: Severity.Bad,
              offenderMission: wp[0],
              offenderIndex: wp[1]
            })

          }

        }
        setTerrain(ret)
      })
  }, [locs, wps, waypoints]) // Add proper dependencies

  //current fault count, used as key for lists
  let faultId = 0;

  return (
    <div>
      <h2>General Checks</h2>
      {
        results.map((x) => (
          <FaultItem fault={x} key={faultId++} onMouseDown={close} />
        ))
      }
      {
        results.length == 0 ? <FaultItem fault={{ message: "There are no errors in your waypoint mission", severity: Severity.Good }} key={faultId++} onMouseDown={close} /> : null
      }
      <h2>Terrain Check</h2>

      {
        terrain !== null ? terrain.map((x) => (
          <FaultItem fault={x} key={faultId++} onMouseDown={close} />
        )) : <FaultItem fault={{ message: "There is no terrain data available", severity: Severity.Bad }} key={faultId++} onMouseDown={close} />
      }
      {
        terrain !== null && terrain.length == 0 ?
          <FaultItem fault={{ message: "Terrain check is complete", severity: Severity.Good }} key={faultId++} onMouseDown={close} />
          : null
      }
      <p className="text-slate-500">(Beware waypoint sub-stepping is not implemented yet)</p>
    </div>
  )
}

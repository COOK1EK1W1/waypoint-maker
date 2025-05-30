import { useWaypoints } from "@/util/context/WaypointContext"
import { getTerrain } from "@/util/terrain"
import { useEffect, useState } from "react"
import FaultItem from "@/components/toolBar/faultItem"
import { wpCheck } from "@/lib/wpcheck/wpcheck"
import { Fault, Severity } from "@/lib/wpcheck/types"
import { filterLatLngAltCmds } from "@/lib/commands/commands"
import { getLatLng } from "@/lib/world/latlng"

export default function WPCheckModal() {
  const { waypoints } = useWaypoints()
  const wps = filterLatLngAltCmds(waypoints.flatten("Main"))
  const results = wpCheck(wps, waypoints)
  const [terrain, setTerrain] = useState<Fault[] | null>(null)
  const locs = wps.map(getLatLng).filter((x) => x !== undefined)

  useEffect(() => {
    getTerrain(locs)
      .then((terrainHeights) => {
        if (!terrainHeights) return
        let ret: Fault[] = []
        let terrainoffset = terrainHeights[0].elevation
        for (let i = 0; i < wps.length; i++) {
          let wp = waypoints.findNthPosition("Main", i)
          if (!wp) { continue }
          let wpheight = wps[i].params.altitude - (terrainHeights[i].elevation - terrainoffset)
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
  }, [waypoints, wps])

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

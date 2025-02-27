import { Fault, Severity } from "@/types/waypoints"
import { useWaypoints } from "@/util/context/WaypointContext"
import { getTerrain } from "@/util/terrain"
import { wpCheck } from "@/util/wpcheck"
import { useEffect, useState } from "react"
import FaultItem from "@/components/toolBar/faultItem"

export default function WPCheckModal() {
  const { waypoints } = useWaypoints()
  const wps = waypoints.flatten("Main")
  const results = wpCheck(wps, waypoints)
  const [terrain, setTerrain] = useState<Fault[] | null>(null)

  useEffect(() => {
    getTerrain(wps.map((x) => [x.param5, x.param6]))
      .then((terrainHeights) => {
        if (!terrainHeights) return
        let ret: Fault[] = []
        let terrainoffset = terrainHeights[0].elevation
        for (let i = 0; i < wps.length; i++) {
          let wp = waypoints.findNthPosition("Main", i)
          if (!wp) { continue }
          let wpheight = wps[i].param7 - (terrainHeights[i].elevation - terrainoffset)
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
      <p className="text-slate-800">(Beware waypoint sub-stepping is not implemented yet)</p>
    </div>
  )
}

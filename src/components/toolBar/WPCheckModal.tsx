import { Fault, Severity } from "@/types/waypoints"
import { findnthwaypoint, get_waypoints } from "@/util/WPCollection"
import { useWaypointContext } from "@/util/context/WaypointContext"
import { getTerrain } from "@/util/terrain"
import { wpCheck } from "@/util/wpcheck"
import { useEffect, useState } from "react"

export default function WPCheckModal({close}:{close: ()=>void}){
  const {waypoints, setSelectedWPs, setActiveMission} = useWaypointContext()
  const wps = get_waypoints("Main", waypoints)
  const results = wpCheck(wps, waypoints)
  const [terrain, setTerrain] = useState<Fault[]>([])


  function dostuff(mission: string| undefined, id: number| undefined){
    if (id){
      setSelectedWPs([id])
    }else{
      setSelectedWPs([])
    }
    setActiveMission(mission || "Main")
    close()
  }
  console.log(results)



  useEffect(()=>{
    getTerrain(wps.map((x)=>[x.param5, x.param6]))
      .then((terrainHeights)=>{
        if (!terrainHeights) return
        let ret: Fault[] = []
        console.log(terrainHeights)
        let terrainoffset = terrainHeights[0].elevation
        for (let i = 0; i < wps.length; i++){
          let wp = findnthwaypoint("Main", i, waypoints)
          if (wp){
            let wpheight = wps[i].param7 - (terrainHeights[i].elevation - terrainoffset)
            if (wpheight < 0){
              ret.push({
                message: "The waypoint is below terrain",
                severity: Severity.Bad,
                offenderMission: wp[0],
                offenderIndex: wp[1]
              })
            }else if(wpheight > 120){
              ret.push({
                message: "The waypoint is above legal height for flying",
                severity: Severity.Bad,
                offenderMission: wp[0],
                offenderIndex: wp[1]
              })

            }
          }

        }
        setTerrain(ret)

      })
  }, [])



  return (
    <div className="bg-white w-2/4 absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] rounded p-4 flex flex-col justify-between">
      <h1>Waypoint Check</h1>
      <h2>General Checks</h2>
      {results.map((x, idx)=>(
      <div key={idx} className="py-4 flex flex-row justify-between">
        {x.message}
          {(x.offenderMission !== undefined) && (
            <button onMouseDown={() => dostuff(x.offenderMission, x.offenderIndex)}>goto</button>
          )}
        </div>

      ))}
      <h2>Terrain Check</h2>
      <p>beware waypoint sub-stepping is not implemented yet</p>
      {terrain.map((x, idx)=>(
      <div key={idx} className="py-4 flex flex-row justify-between">
        {x.message}
          {(x.offenderMission !== undefined) && (
            <button onMouseDown={() => dostuff(x.offenderMission, x.offenderIndex)}>goto</button>
          )}
        </div>

      ))}
    </div>
  )

}

import { AvgLatLng, MoveWPsAvgTo, changeParam } from "@/util/WPCollection";
import { useWaypointContext } from "../../util/context/WaypointContext";
import { Node, Waypoint } from "@/types/waypoints";
import { FaArrowDown, FaArrowLeft, FaArrowRight, FaArrowUp } from "react-icons/fa";
import { FaArrowRotateLeft, FaArrowRotateRight } from "react-icons/fa6";

function Spacer(){
  return (<span className="w-4 inline-block"></span>)
}

export function LatLngEditor(){
  const { selectedWPs, waypoints, setWaypoints, activeMission, setTool} = useWaypointContext();

  const mission: Node[] | undefined = waypoints.get(activeMission);
  if (!mission) return null;

  let wps: Node[] = [];
  let wpsIds: number[] = [];
  if (selectedWPs.length === 0) {
    wps = mission;
    wpsIds = mission.map((_, index) => index);
  } else {
    wps = mission.filter((_, id) => selectedWPs.includes(id));
    wpsIds = selectedWPs;
  }

  const [lat, lng] = AvgLatLng(wps, waypoints);

  function nudge(x: number, y: number) {
    setWaypoints((prevWaypoints: Map<string, Node[]>) => {
      let waypointsUpdated = new Map(prevWaypoints);
      for (let i = 0; i < wpsIds.length; i++) {
        waypointsUpdated = changeParam(wpsIds[i], activeMission, waypointsUpdated, (wp: Waypoint) => {
          wp.param5 += 0.0001 * y;
          wp.param6 += 0.0001 * x;
          return wp;
        });
      }
      return waypointsUpdated;
    });
  }

  function move() {
    const newLat = prompt("Enter latitude");
    const newLng = prompt("Enter Longitude");
    setWaypoints(MoveWPsAvgTo(Number(newLat), Number(newLng), waypoints, selectedWPs, activeMission))
  }

  function rotateDeg(deg: number){

    const angleRadians = (deg * Math.PI) / 180;

    setWaypoints((prevWaypoints: Map<string, Node[]>) => {
      let waypointsUpdated = new Map(prevWaypoints);
      for (let i = 0; i < wps.length; i++) {
        waypointsUpdated = changeParam(wpsIds[i], activeMission, waypointsUpdated, (wp: Waypoint) => {
          const x = (wp.param6 - lng) * Math.cos(lat * Math.PI / 180);
          const y = wp.param5 - lat;

          const newX = x * Math.cos(angleRadians) - y * Math.sin(angleRadians);
          const newY = x * Math.sin(angleRadians) + y * Math.cos(angleRadians);

          wp.param6 = newX / Math.cos(lat * Math.PI / 180) + lng;
          wp.param5 = newY + lat;

          return wp;
        });
      }
      return waypointsUpdated;
    });
  }

  function rotate() {
    const angleDegrees = prompt("Enter rotation angle in degrees");
    if (!angleDegrees) return;
    rotateDeg(Number(angleDegrees))
  }

  function place(){
    setTool("Place")

  }

  return (
    <div className="flex flex-row m-2">
        <div>
          <p>Latitude: </p>
          <button onMouseDown={()=>nudge(0, -1)}><FaArrowDown className="inline m-1 cursor"/></button> 
            {lat.toFixed(6)} 
          <button onMouseDown={()=>nudge(0, 1)}><FaArrowUp className="inline m-1"/></button>
        </div>
      <Spacer/>
        <div>
          <p>Longitude: </p>
          <button onMouseDown={()=>nudge(-1, 0)}><FaArrowLeft className="inline m-1" /></button>
            {lng.toFixed(6)}
          <button onMouseDown={()=>nudge(1, 0)}><FaArrowRight className="inline m-1"/></button>
        </div>
      <Spacer/>
      <button onMouseDown={move} className="m-1"> move</button>
      <Spacer/>
      <div>
        <button onMouseDown={()=>rotateDeg(5)} className="m-1"> <FaArrowRotateLeft/></button>
        <button onMouseDown={rotate} className="m-1"> rotate</button>
        <button onMouseDown={()=>rotateDeg(-5)} className="m-1"> <FaArrowRotateRight/></button>
      </div>
      <Spacer/>
      <button onMouseDown={place} className="m-1"> place</button>
    </div>
  );
};

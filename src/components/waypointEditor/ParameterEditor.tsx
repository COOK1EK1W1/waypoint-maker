import Parameter from "./Parameter";
import { Node } from "@/types/waypoints";


export default function ParameterEditor({commanddesc, change, wps}: {commanddesc: Command, change: (e: React.ChangeEvent<HTMLInputElement>) => void, wps: Node[]}){

  const hasLocationParams = commanddesc.parameters[4] && 
  commanddesc.parameters[5] &&
  commanddesc.parameters[4].label == "Latitude" &&
  commanddesc.parameters[5].label == "Longitude"

  return (
    <div className="flex flex-wrap">
      <Parameter param={commanddesc.parameters[0]} name="param1" change={change} value={(x)=>x.wps.param1} wps={wps}/>
      <Parameter param={commanddesc.parameters[1]} name="param2" change={change} value={(x)=>x.wps.param2} wps={wps}/>
      <Parameter param={commanddesc.parameters[2]} name="param3" change={change} value={(x)=>x.wps.param3} wps={wps}/>
      <Parameter param={commanddesc.parameters[3]} name="param4" change={change} value={(x)=>x.wps.param4} wps={wps}/>
      {!hasLocationParams && <Parameter param={commanddesc.parameters[4]} name="param5" change={change} value={(x)=>x.wps.param5} wps={wps}/>}
      {!hasLocationParams && <Parameter param={commanddesc.parameters[5]} name="param6" change={change} value={(x)=>x.wps.param6} wps={wps}/>}
      <Parameter param={commanddesc.parameters[6]} name="param7" change={change} value={(x)=>x.wps.param7} wps={wps}/>
    </div>
  )
}

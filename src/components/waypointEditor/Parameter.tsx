import { Node, WPNode } from "@/types/waypoints";

export default function Parameter({param, name, value, change, wps}: {param: Parameter | null, name: string, value: (n: WPNode)=>number, change: (e: React.ChangeEvent<HTMLInputElement>)=>void, wps: Node[]}){
  if (param == null){
    return
  }  

  let allSame = true;
  if (wps[0].type == "Collection") return
  const val = value(wps[0])
  for (let i = 1; i < wps.length; i++){
    const cur = wps[i]
    if (cur.type == "Collection") return
    if (value(cur) != val){
      allSame = false;
    }
  }

  if (allSame){
    return (
      <div className="p-2">
        <p>{param.label} ({param.units})</p>
        <input type="number" name={name} onChange={change} value={val}/>
      </div>
    );

  }else{

    return (
      <div className="p-2">
        <p>{param.label} ({param.units})</p>
        <input type="number" name={name} onChange={change} value='-'/>
      </div>
    );
  }
}

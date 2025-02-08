import { Node, WPNode } from "@/types/waypoints";
import DraggableNumberInput from "@/components/ui/draggableNumericInput";

export default function Parameter({ param, name, value, change, wps }: { param: Parameter | null, name: string, value: (n: WPNode) => number, change: (event: { target: { name?: string; value: number } }) => void, wps: Node[] }) {
  if (param == null) {
    return
  }

  let allSame = true;
  if (wps[0].type == "Collection") return
  const val = value(wps[0])
  for (let i = 1; i < wps.length; i++) {
    const cur = wps[i]
    if (cur.type == "Collection") return
    if (value(cur) != val) {
      allSame = false;
    }
  }

  if (allSame) {
    return (
      <div className="p-2">
        <label>
          <span className="block">{param.label} ({param.units})</span>
          <DraggableNumberInput className="w-40 border-slate-200" name={name} onChange={change} value={val} min={param.minValue} max={param.maxValue} />
        </label>
      </div>
    );

  } else {

    return (
      <div className="p-2">
        <label>
          <span className="block">{param.label} ({param.units})</span>
          <DraggableNumberInput className="w-40 border-slate-200" name={name} onChange={change} value={0} />
        </label>
      </div>
    );
  }
}

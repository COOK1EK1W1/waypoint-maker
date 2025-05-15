import { createEvaluate } from "@/components/toolBar/bakeDubins";
import { getBounds, getTunableDubinsParameters } from "@/lib/dubins/dubinWaypoints";
import { pathLength } from "@/lib/dubins/geometry";
import { dubinsPoint } from "@/lib/dubins/types";
import { particleOptimise } from "../particleSwarm";
import { geneticOptimise } from "../genetic";
import { gradientOptimise } from "../gradient";
import { Plane } from "@/lib/vehicles/types";

const file = Bun.file("output.txt");
const writer = file.writer();

const vehicle: Plane = {
  type: "Plane",
  maxBank: 45,
  cruiseAirspeed: 5,
  energyConstant: 1,
}

const randomPoint: () => dubinsPoint = () => {
  return { pos: { x: Math.random() * 20, y: Math.random() * 20 }, heading: 0, radius: 10, tunable: true, passbyRadius: 0, bounds: {} }
}

const randomPoints: (n: number) => dubinsPoint[] = (n) => {
  return Array.from({ length: n }, randomPoint)
}
const funcs = [geneticOptimise, particleOptimise]

const numTrials = 50
// write headers
writer.write("optimal, ")
for (let trial = 0; trial < numTrials; trial++) {
  writer.write(`genetic ${trial}, `)
}
for (let trial = 0; trial < numTrials; trial++) {
  writer.write(`particle ${trial}, `)
}
writer.write("\n")

for (let amounts = 0; amounts < 20; amounts++) {
  const dubinsPoints = randomPoints(10)
  const bounds = getBounds(dubinsPoints, vehicle)

  const evalFunc = createEvaluate(dubinsPoints, pathLength)

  console.log("starting: ", evalFunc(getTunableDubinsParameters(dubinsPoints)))
  let a = particleOptimise(getTunableDubinsParameters(dubinsPoints), bounds, evalFunc).finalVals
  a = particleOptimise(a, bounds, evalFunc).finalVals
  let b = particleOptimise(a, bounds, evalFunc)
  let c = gradientOptimise(a, bounds, evalFunc).fitness
  let res = Math.min(b.fitness, c)
  console.log("optimal: ", res)
  const output = [res]

  for (let func = 0; func < funcs.length; func++) {
    for (let trial = 0; trial < numTrials; trial++) {
      dubinsPoints.map((x) => x.heading = Math.random() * 360)
      const res = funcs[func](getTunableDubinsParameters(dubinsPoints), bounds, evalFunc)
      console.log(res.fitness)
      output.push(res.fitness)
    }
  }
  console.log(output)
  writer.write(output.join(", "))
  writer.write("\n")
}
writer.flush()
writer.end()


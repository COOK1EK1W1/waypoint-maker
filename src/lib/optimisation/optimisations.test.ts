import { expect, test } from "bun:test";
import { geneticOptimise } from "./genetic";
import { particleSwarmOptimisation } from "./particleSwarm";

const square = (x: number[]) => Math.pow(x[0], 2)
const squareStargingValues = [[0], [1], [-1], [10], [-10]]

test.each(squareStargingValues)("particle optimise square function", (...starting) => {
  let ans = particleSwarmOptimisation(starting, [{}], square)
  expect(ans[0]).toBeCloseTo(0, 1)
})

test.each(squareStargingValues)("genetic optimise square function", (...starting) => {
  let ans = geneticOptimise(starting, [{}], square)
  expect(ans[0]).toBeCloseTo(0, 1)
})

const bowl = (x: number[]) => x.reduce((acc, cur) => acc + Math.pow(cur, 2), 0)
const bowlStarting: number[][] = []
let bowlDim = 20
for (let i = 0; i < 10; i++) {
  bowlStarting.push([...Array(bowlDim)].map(e => Math.random() * bowlDim))
}
test.each(bowlStarting)("particle optimise bowl function", (...starting) => {
  let ans: number[] = particleSwarmOptimisation(starting, [...Array(bowlDim)].map(e => ({})), bowl)
  expect(ans.reduce((a, b) => a + b, 0)).toBeCloseTo(0, 0)
})

test.each(bowlStarting)("genetic optimise bowl function", (...starting) => {
  let ans: number[] = geneticOptimise(starting, [...Array(bowlDim)].map(e => ({})), bowl)
  expect(ans.reduce((a, b) => a + b, 0)).toBeCloseTo(0, -1)
})

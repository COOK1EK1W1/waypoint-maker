import { expect, test } from "bun:test";
import { geneticOptimise } from "./genetic";
import { particleOptimise } from "./particleSwarm";
import { binaryGradient } from "./binaryGradient";

const square = (x: number[]) => Math.pow(x[0], 2)
const squareStargingValues = [[0], [1], [-1], [10], [-10]]

test.each(squareStargingValues)("particle optimise square function", (...starting) => {
  let res = particleOptimise(starting, [{}], square)
  expect(res.finalVals[0]).toBeCloseTo(0, 1)
  expect(res.fitness).toBeCloseTo(0, 1)
  expect(res.time).toBeGreaterThan(0)
})

test.each(squareStargingValues)("genetic optimise square function", (...starting) => {
  let res = geneticOptimise(starting, [{}], square)
  expect(res.finalVals[0]).toBeCloseTo(0, 1)
  expect(res.fitness).toBeCloseTo(0, 1)
  expect(res.time).toBeGreaterThan(0)
})

test.each(squareStargingValues)("gradient optimise square function", (...starting) => {
  let res = binaryGradient(starting, [{}], square)
  expect(res.finalVals[0]).toBeCloseTo(0, 1)
  expect(res.fitness).toBeCloseTo(0, 1)
  expect(res.time).toBeGreaterThan(0)
})

const bowl = (x: number[]) => x.reduce((acc, cur) => acc + Math.pow(cur, 2), 0)
const bowlStarting: number[][] = []
let bowlDim = 20
for (let i = 0; i < 10; i++) {
  bowlStarting.push([...Array(bowlDim)].map(_ => Math.random() * bowlDim))
}
test.each(bowlStarting)("particle optimise bowl function", (...starting) => {
  let res = particleOptimise(starting, [...Array(bowlDim)].map(_ => ({})), bowl)
  expect(res.finalVals.reduce((a, b) => a + b, 0)).toBeCloseTo(0, -1)
  expect(res.fitness).toBeCloseTo(0, 0)
  expect(res.time).toBeGreaterThan(0)
})

test.each(bowlStarting)("genetic optimise bowl function", (...starting) => {
  let res = geneticOptimise(starting, [...Array(bowlDim)].map(_ => ({})), bowl)
  expect(res.finalVals.reduce((a, b) => a + b, 0)).toBeCloseTo(0, -1)
  expect(res.fitness).toBeCloseTo(0, -1)
  expect(res.time).toBeGreaterThan(0)
})

test.each(bowlStarting)("gradient optimise bowl function", (...starting) => {
  let res = binaryGradient(starting, [...Array(bowlDim)].map(_ => ({})), bowl)
  expect(res.finalVals.reduce((a, b) => a + b, 0)).toBeCloseTo(0, -1)
  expect(res.fitness).toBeCloseTo(0, -1)
  expect(res.time).toBeGreaterThan(0)
})

import { bound } from "../dubins/types"

export type res = { finalVals: number[], fitness: number, time: number }

export type optimisationAlgorithm = (initialGuess: readonly number[], bounds: bound[], fn: (a: number[]) => number) => res 

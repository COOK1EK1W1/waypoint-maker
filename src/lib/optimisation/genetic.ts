import { bound } from "@/types/dubins";
import { applyBounds } from "../dubins/dubinWaypoints";

export function geneticOptimise(initialGuess: number[], bounds: bound[], fn: (a: number[]) => number, popsize: number): number[] {
  let population: number[][] = []
  let bestValues = [...initialGuess]

  const ELITES = 5
  const CHILDREN = Math.round((popsize - ELITES) / 2)
  const MUTANTS = popsize - (ELITES + CHILDREN)
  console.assert(ELITES + CHILDREN + MUTANTS == popsize, `${ELITES} ${CHILDREN} ${MUTANTS} ${popsize}`)
  console.assert(ELITES > 0, CHILDREN > 0, MUTANTS > 0)

  for (let x = 0; x < popsize; x++) {
    let value = []
    for (let y = 0; y < initialGuess.length; y++) {
      value.push(initialGuess[y] + (Math.random() - 0.5) * 2)
    }
    console.assert(value.length == initialGuess.length, `${value.length}`)
    population.push(value)
  }

  console.log("Starting fitness: ", fn(initialGuess))

  for (let i = 0; i < 200; i++) {
    let newpop: number[][] = []
    population.sort((x, y) => fn(x) - fn(y))
    //console.log(fn(population[0]))

    if (fn(population[0]) < fn(bestValues)) {
      bestValues = [...population[0]]
    }



    // copy over elites
    for (let j = 0; j < ELITES; j++) {
      newpop.push(population[j]);
    }
    //console.assert(newpop.length == ELITES, `${newpop.length}`)

    // crossover
    for (let j = 0; j < CHILDREN; j++) {
      const parent1 = population[Math.floor(Math.random() * popsize)]
      const parent2 = population[Math.floor(Math.random() * popsize)]
      newpop.push(crossover(parent1, parent2));

    }
    //console.assert(newpop.length == ELITES + CHILDREN, `${newpop.length} ${ELITES + CHILDREN}`)

    // mutate
    for (let j = 0; j < MUTANTS; j++) {
      const parent = population[Math.floor(Math.random() * popsize)]
      newpop.push(mutate(parent, bounds));

    }

    //console.assert(newpop.length == popsize)
    population = newpop

  }
  console.log("ending fitness: ", fn(bestValues))
  return bestValues
}

function crossover(a: number[], b: number[]): number[] {
  console.assert(a.length == b.length)
  let newVal = []

  for (let i = 0; i < a.length; i++) {
    if (Math.random() > 0.5) {
      newVal.push(a[i])
    } else {
      newVal.push(b[i])
    }

  }
  return newVal
}

function mutate(a: number[], bounds: bound[]): number[] {
  let newVal = [...a]
  for (let i = 0; i < a.length; i++) {
    a[i] += (Math.random() - 0.5) * 0.3
  }
  applyBounds(newVal, bounds)
  return newVal

}

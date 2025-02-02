import { bound } from "@/types/dubins";
import { applyBounds } from "../dubins/dubinWaypoints";

export function geneticOptimise(initialGuess: readonly number[], bounds: bound[], fn: (a: number[]) => number): res {
  const start = performance.now()
  let population: number[][] = []
  let bestValues = [...initialGuess]

  const popsize = initialGuess.length * 20

  const ELITES = Math.ceil(popsize * 0.1)
  const CHILDREN = Math.ceil((popsize - ELITES) * 0.4)
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
  for (let i = 0; i < 200; i++) {
    let newpop: number[][] = []
    population.sort((x, y) => fn(x) - fn(y))

    if (fn(population[0]) < fn(bestValues)) {
      bestValues = [...population[0]]
    }



    // copy over elites
    for (let j = 0; j < ELITES; j++) {
      newpop.push(population[j]);
    }

    // crossover
    for (let j = 0; j < CHILDREN; j++) {
      const parent1 = tournamentSelection(population, fn)
      const parent2 = tournamentSelection(population, fn)
      newpop.push(crossover(parent1, parent2));

    }

    // mutate
    for (let j = 0; j < MUTANTS; j++) {
      const parent = population[Math.floor(Math.random() * (popsize - ELITES)) + ELITES]
      newpop.push(mutate(parent, bounds));
    }

    //console.assert(newpop.length == popsize)
    population = newpop

  }
  const end = performance.now()
  return { finalVals: bestValues, fitness: fn(bestValues), time: end - start }
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
    a[i] += (Math.random() - 0.5) * 2
  }
  applyBounds(newVal, bounds)
  return newVal
}

function tournamentSelection(population: number[][], fn: (a: number[]) => number, k = 3) {
  let best = population[Math.floor(Math.random() * population.length)];

  for (let i = 1; i < k; i++) {
    let challenger = population[Math.floor(Math.random() * population.length)];
    if (fn(challenger) < fn(best)) {
      best = challenger;
    }
  }
  return best;

}

import { applyBounds } from "@/lib/dubins/dubinWaypoints";
import { optimisationAlgorithm } from "@/lib/optimisation/types";
import { bound } from "../dubins/types";

type populi = { vals: number[], fitness: number }

export const geneticOptimise: optimisationAlgorithm = (initialGuess, bounds, fn) => {
  // an implementation of the genetic algorithm
  const start = performance.now()
  let population: populi[] = []
  let bestpop: populi = { vals: [...initialGuess], fitness: fn([...initialGuess]) }

  const popsize = initialGuess.length * 20

  const ELITES = Math.ceil(popsize * 0.1)
  const CHILDREN = Math.ceil((popsize - ELITES) * 0.4)
  const MUTANTS = popsize - (ELITES + CHILDREN)
  console.assert(ELITES + CHILDREN + MUTANTS == popsize, `${ELITES} ${CHILDREN} ${MUTANTS} ${popsize}`)
  console.assert(ELITES > 0, CHILDREN > 0, MUTANTS > 0)

  let previous_global_best: number[] = []
  const improvementThreshold = 1e-6

  for (let x = 0; x < popsize; x++) {
    let value = []
    for (let y = 0; y < initialGuess.length; y++) {
      value.push(initialGuess[y] + (Math.random() - 0.5) * 2)
    }
    console.assert(value.length == initialGuess.length, `${value.length}`)
    population.push({ vals: value, fitness: fn(value) })
  }
  for (let i = 0; i < 200; i++) {

    if (previous_global_best.length == 5) {
      previous_global_best.shift()
    }
    previous_global_best.push(bestpop.fitness)
    if (previous_global_best.length == 5 && (previous_global_best[0] - previous_global_best[4]) < improvementThreshold) {
      //break;
    }


    let newpop: { vals: number[], fitness: number }[] = []
    population.sort((x, y) => x.fitness - y.fitness)

    if (population[0].fitness < bestpop.fitness) {
      bestpop = { vals: [...population[0].vals], fitness: population[0].fitness }
    }



    // copy over elites
    for (let j = 0; j < ELITES; j++) {
      newpop.push(population[j]);
    }

    // crossover
    for (let j = 0; j < CHILDREN; j++) {
      const parent1 = tournamentSelection(population)
      const parent2 = tournamentSelection(population)
      const vals = crossover(parent1, parent2)
      newpop.push({ vals, fitness: fn(vals) });

    }

    // mutate
    for (let j = 0; j < MUTANTS; j++) {
      const parent = population[Math.floor(Math.random() * (popsize - ELITES)) + ELITES]
      const vals = mutate(parent, bounds)
      newpop.push({ vals, fitness: fn(vals) });
    }

    //console.assert(newpop.length == popsize)
    population = newpop
    //console.log(bestpop.fitness)

  }
  const end = performance.now()
  return { finalVals: bestpop.vals, fitness: bestpop.fitness, time: end - start }
}

function crossover(a: populi, b: populi): number[] {
  console.assert(a.vals.length == b.vals.length)
  let newVal = []

  for (let i = 0; i < a.vals.length; i++) {
    if (Math.random() > 0.5) {
      newVal.push(a.vals[i])
    } else {
      newVal.push(b.vals[i])
    }

  }
  return newVal
}

function mutate(a: populi, bounds: bound[]): number[] {
  let newVal = [...a.vals]
  for (let i = 0; i < a.vals.length; i++) {
    if (Math.random() < 0.2) {
      newVal[i] += (Math.random() - 0.5) * 10
    } else if (Math.random() < 0.2) {
      let curBound = bounds[i]
      if (curBound.circular) {
        if (curBound.min != undefined && curBound.max != undefined) {
          newVal[i] = (curBound.max - curBound.min) / 2 + newVal[i]
        }
      }

    }
  }
  applyBounds(newVal, bounds)
  return newVal
}

function tournamentSelection(population: populi[], k = 3) {
  let best = population[Math.floor(Math.random() * population.length)];

  for (let i = 1; i < k; i++) {
    let challenger = population[Math.floor(Math.random() * population.length)];
    if (challenger.fitness < best.fitness) {
      best = challenger;
    }
  }
  return best;
}

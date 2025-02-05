import { optimisationAlgorithm } from "./types"

export const particleOptimise: optimisationAlgorithm = (initialGuess, bounds, fn) => {
  const start = performance.now()
  console.assert(initialGuess.length == bounds.length, `Params are different length to bounds, ${initialGuess.length} ${bounds.length}`)

  const dims = initialGuess.length
  const popsize = dims * 20
  const population: number[][] = Array.from({ length: popsize })
  const velocities: number[][] = Array.from({ length: popsize })

  const cogWeight = 0.5
  const socialWeight = 0.5

  const improvementThreshold = 1e-6

  let local_best_position = []
  let local_best_value = []
  let global_best_position = [...initialGuess]
  let global_best_value = fn(global_best_position)
  let previous_global_best = []
  //console.log("Starting fitness: ", global_best_value)

  for (let i = 0; i < popsize; i++) {
    const particle_pos = Array.from({ length: dims }, (_, j) => initialGuess[j] + (Math.random() - 0.5 * 0.1))
    const particle_vel = Array.from({ length: dims }, () => Math.random() - 0.5)
    population[i] = particle_pos
    velocities[i] = particle_vel
    local_best_position.push([...particle_pos])
    local_best_value.push(fn(particle_pos))
  }

  for (let i = 0; i < 100; i++) {
    if (previous_global_best.length == 5) {
      previous_global_best.shift()
    }
    previous_global_best.push(global_best_value)
    if (previous_global_best.length == 5 && (previous_global_best[0] - previous_global_best[4]) < improvementThreshold) {
      //break;
    }


    // update global and local best positions and values
    for (let p = 0; p < popsize; p++) {
      let current_fitness = fn(population[p])
      if (current_fitness < local_best_value[p]) {
        local_best_value[p] = current_fitness
        local_best_position[p] = [...population[p]]
      }
      if (current_fitness < global_best_value) {
        global_best_value = current_fitness
        global_best_position = local_best_position[p]
      }
    }


    for (let p = 0; p < popsize; p++) {

      for (let a = 0; a < initialGuess.length; a++) {
        let b = Math.random() * cogWeight
        let d = Math.random() * socialWeight

        let newVel = 0.9 * velocities[p][a] +
          b * (local_best_position[p][a] - population[p][a]) +
          d * (global_best_position[a] - population[p][a])
        velocities[p][a] = newVel
        population[p][a] += 1 * newVel

        let curBound = bounds[a]
        if (curBound.max && population[p][a] > curBound.max) {
          population[p][a] = curBound.max
          velocities[p][a] *= -1
        }
        if (curBound.min && population[p][a] < curBound.min) {
          population[p][a] = curBound.min
          velocities[p][a] *= -1
        }
      }
    }

  }
  //console.log("ending fitness: ", global_best_value)
  //console.timeEnd("Swarm optimisation")
  const end = performance.now()
  return {
    finalVals: global_best_position, fitness: global_best_value, time: end - start
  }
}




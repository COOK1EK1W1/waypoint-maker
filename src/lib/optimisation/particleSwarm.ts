type bound = {
  min?: number,
  max?: number,
  circular?: boolean
}

export function particleSwarmOptimise(initialGuess: number[], bounds: bound[], fn: (a: number[])=>number, popsize: number): number[]{
  let population = []
  let velocities = []
  let local_best_position = []
  let local_best_value = []
  let global_best_position = initialGuess
  let global_best_value = fn(initialGuess)
  console.log("Starting fitness: ", global_best_value)
  for (let i = 0; i < popsize; i++){
    let particle_pos = []
    let particle_vel = []
    let particle_best = []
    for (let j = 0; j < initialGuess.length; j++){
      let r = Math.random() * 0.1 - 0.05
      particle_pos.push(initialGuess[j] + r)
      particle_vel.push(Math.random() - 0.5)
      particle_best.push(initialGuess[j] + r)
    }
    population.push(particle_pos)
    velocities.push(particle_vel)
    local_best_position.push(particle_best)
    local_best_value.push(fn(particle_best))
  }

  for (let i = 0; i < 200; i++){
    // update global and local best positions and values
    for (let p = 0; p < popsize; p++){
      let current_fitness = fn(population[p])
      if (current_fitness < local_best_value[p]){
        local_best_value[p] = current_fitness
        local_best_position[p]= [...population[p]]
      }
      if (current_fitness < global_best_value){
        global_best_value = current_fitness
        global_best_position = [...population[p]]
      }
    }


    for (let p = 0; p < popsize; p++){

      for (let a = 0; a < initialGuess.length; a++){
        let b = Math.random() * 0.5 //beta cognitive
        let d = Math.random() * 0.5 //delta global

        let newVel = 0.8 * velocities[p][a] +
                     b * (local_best_position[p][a] - population[p][a]) + 
                     d * (global_best_position[a] - population[p][a])
        velocities[p][a] = newVel
        population[p][a] += 1 * newVel
      }
    }

  }
  console.log("ending fitness: ", global_best_value)
  return global_best_position

}




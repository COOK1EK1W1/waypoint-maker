import { applyBounds } from "../dubins/dubinWaypoints";
import { optimisationAlgorithm } from "./types";


export const binaryGradient: optimisationAlgorithm = (initialGuess, bounds, fn) => {

  const learningRate = 0.4
  const maxIterations = 2000
  const tolerance = 1e-6
  const minimize = true

  // Function to estimate gradients using finite differences
  function calculateGradients(params: number[]): number[] {
    const epsilon = 1e-6;
    return params.map((_, i) => {
      const paramsPlusEpsilon = [...params];
      paramsPlusEpsilon[i] += epsilon;

      const paramsMinusEpsilon = [...params];
      paramsMinusEpsilon[i] -= epsilon;

      const gradientEstimate = (
        fn(paramsPlusEpsilon) - fn(paramsMinusEpsilon)
      ) / (2 * epsilon);

      return minimize ? gradientEstimate : -gradientEstimate;
    });
  }

  let currentParams = [...initialGuess];
  let currentFitness = fn(currentParams);
  let iteration = 0;
  let improvement = Infinity;

  while (iteration < maxIterations && Math.abs(improvement) > tolerance) {
    const gradients = calculateGradients(currentParams);

    // Update parameters using gradient descent
    const newParams = currentParams.map(
      (param, i) => param - learningRate * gradients[i]
    );
    applyBounds(newParams, bounds)

    const newFitness = fn(newParams);
    improvement = currentFitness - newFitness;

    // Update current state
    currentParams = newParams;
    currentFitness = newFitness;
    iteration++;
  }

  return {
    finalVals: currentParams,
    fitness: currentFitness,
    time: iteration
  };
}

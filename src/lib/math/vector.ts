/**
 * Calculate the dot product of two vectors
 * @param {number[]} v1 - The first vector
 * @param {number[]} v2 - The second vector
 * @returns {number} The dot product of the two vectors
 */
export function dotProduct(v1: [number, number, number], v2: [number, number, number]): number {
  return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
}

/**
 * Calculate the magnitude of a vector
 * @param {number[]} v - The vector
 * @returns {number} The magnitude of the vector
 */
export function magnitude(v: [number, number, number]): number {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

/**
 * Calculate the angle between two vectors
 * @param {number[]} v1 - The first vector
 * @param {number[]} v2 - The second vector
 * @returns {number} The angle between the two vectors in radians
 */
export function angleBetweenVectors(v1: [number, number, number], v2: [number, number, number]): number {
  const dot = dotProduct(v1, v2);
  const mag1 = magnitude(v1);
  const mag2 = magnitude(v2);

  return Math.acos(dot / (mag1 * mag2));
}


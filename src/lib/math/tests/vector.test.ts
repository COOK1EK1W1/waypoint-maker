import { describe, it, expect } from 'bun:test';
import { dotProduct, magnitude, angleBetweenVectors } from '../vector';

describe('Vector Operations', () => {
  describe('dotProduct', () => {
    it('should calculate dot product of two vectors', () => {
      const v1: [number, number, number] = [1, 2, 3];
      const v2: [number, number, number] = [4, 5, 6];
      expect(dotProduct(v1, v2)).toBe(32); // 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
    });

    it('should handle zero vectors', () => {
      const v1: [number, number, number] = [0, 0, 0];
      const v2: [number, number, number] = [1, 2, 3];
      expect(dotProduct(v1, v2)).toBe(0);
    });

    it('should handle negative values', () => {
      const v1: [number, number, number] = [-1, -2, -3];
      const v2: [number, number, number] = [4, 5, 6];
      expect(dotProduct(v1, v2)).toBe(-32);
    });
  });

  describe('magnitude', () => {
    it('should calculate magnitude of a vector', () => {
      const v: [number, number, number] = [3, 4, 0];
      expect(magnitude(v)).toBe(5); // sqrt(3^2 + 4^2 + 0^2) = 5
    });

    it('should handle zero vector', () => {
      const v: [number, number, number] = [0, 0, 0];
      expect(magnitude(v)).toBe(0);
    });

    it('should handle negative values', () => {
      const v: [number, number, number] = [-3, -4, 0];
      expect(magnitude(v)).toBe(5);
    });
  });

  describe('angleBetweenVectors', () => {
    it('should calculate angle between perpendicular vectors', () => {
      const v1: [number, number, number] = [1, 0, 0];
      const v2: [number, number, number] = [0, 1, 0];
      expect(angleBetweenVectors(v1, v2)).toBeCloseTo(Math.PI / 2);
    });

    it('should calculate angle between parallel vectors', () => {
      const v1: [number, number, number] = [1, 0, 0];
      const v2: [number, number, number] = [2, 0, 0];
      expect(angleBetweenVectors(v1, v2)).toBe(0);
    });

    it('should calculate angle between opposite vectors', () => {
      const v1: [number, number, number] = [1, 0, 0];
      const v2: [number, number, number] = [-1, 0, 0];
      expect(angleBetweenVectors(v1, v2)).toBeCloseTo(Math.PI);
    });

    it('should handle zero vectors', () => {
      const v1: [number, number, number] = [0, 0, 0];
      const v2: [number, number, number] = [1, 0, 0];
      expect(angleBetweenVectors(v1, v2)).toBeNaN();
    });
  });
}); 
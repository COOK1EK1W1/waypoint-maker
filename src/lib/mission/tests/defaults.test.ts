import { describe, it, expect } from 'bun:test';
import { defaultWaypoint, defaultTakeoff, defaultDoLandStart } from '../defaults';
import { LatLng } from '../../world/latlng';

describe('Mission Defaults', () => {
  const testPosition: LatLng = { lat: 51.5074, lng: -0.1278 }; // London coordinates

  describe('defaultWaypoint', () => {
    it('should create a waypoint command with correct parameters', () => {
      const waypoint = defaultWaypoint(testPosition);
      
      expect(waypoint.frame).toBe(3);
      expect(waypoint.type).toBe(16);
      expect(waypoint.autocontinue).toBe(1);
      expect(waypoint.params['accept radius']).toBe(20);
      expect(waypoint.params.yaw).toBe(0);
      expect(waypoint.params.hold).toBe(0);
      expect(waypoint.params['pass radius']).toBe(0);
      expect(waypoint.params.latitude).toBe(testPosition.lat);
      expect(waypoint.params.longitude).toBe(testPosition.lng);
      expect(waypoint.params.altitude).toBe(100);
    });
  });

  describe('defaultTakeoff', () => {
    it('should create a takeoff command with correct parameters', () => {
      const takeoff = defaultTakeoff(testPosition);
      
      expect(takeoff.frame).toBe(3);
      expect(takeoff.type).toBe(22);
      expect(takeoff.autocontinue).toBe(1);
      expect(takeoff.params.yaw).toBe(0);
      expect(takeoff.params.pitch).toBe(15);
      expect(takeoff.params.latitude).toBe(testPosition.lat);
      expect(takeoff.params.longitude).toBe(testPosition.lng);
      expect(takeoff.params.altitude).toBe(15);
    });
  });

  describe('defaultDoLandStart', () => {
    it('should create a land start command with correct parameters', () => {
      const landStart = defaultDoLandStart(testPosition);
      
      expect(landStart.frame).toBe(0);
      expect(landStart.type).toBe(189);
      expect(landStart.params.latitude).toBe(testPosition.lat);
      expect(landStart.params.longitude).toBe(testPosition.lng);
      expect(landStart.params.altitude).toBe(100);
    });
  });
}); 
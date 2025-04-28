import { describe, it, expect } from 'bun:test';
import { importwpm1 } from '../spec';
import { defaultPlane } from '@/lib/vehicles/defaults';
import { ICommand } from '@/lib/commands/commands';
import { CollectionType } from '@/lib/mission/mission';

describe('WM1 Spec', () => {
  describe('importwpm1', () => {
    it('should import a valid WM1 mission with waypoints', () => {
      const wm1Data = JSON.stringify([
        ['main', [
          {
            type: 'Waypoint',
            wps: {
              frame: 3,
              type: 16, // MAV_CMD_NAV_WAYPOINT
              autocontinue: 1,
              param1: 0,  // hold
              param2: 20, // accept radius
              param3: 0,  // pass radius
              param4: 0,  // yaw
              param5: 51.5074, // latitude
              param6: -0.1278, // longitude
              param7: 100 // altitude
            }
          }
        ]]
      ]);

      const result = importwpm1(wm1Data);

      expect(result.error).toBeNull();
      expect(result.data).not.toBeNull();
      expect(result.data?.vehicle).toBe(defaultPlane);

      const mission = result.data?.mission;
      expect(mission?.getMissions()).toContain('main');

      const mainMission = mission?.get('main');
      expect(mainMission).toHaveLength(1);

      const waypoint = mainMission?.[0];
      expect(waypoint?.type).toBe('Command');
      if (waypoint?.type === 'Command') {
        const cmd = waypoint.cmd as ICommand<"MAV_CMD_NAV_WAYPOINT">;
        expect(cmd.frame).toBe(3);
        expect(cmd.type).toBe(16);
        expect(cmd.autocontinue).toBe(1);
        expect(cmd.params.hold).toBe(0);
        expect(cmd.params['accept radius']).toBe(20);
        expect(cmd.params['pass radius']).toBe(0);
        expect(cmd.params.yaw).toBe(0);
        expect(cmd.params.latitude).toBe(51.5074);
        expect(cmd.params.longitude).toBe(-0.1278);
        expect(cmd.params.altitude).toBe(100);
      }
    });

    it('should import a valid WM1 mission with collections', () => {
      const wm1Data = JSON.stringify([
        ['main', [
          {
            type: 'Collection',
            name: 'test_collection',
            ColType: CollectionType.Mission, // Mission type
            collectionID: 'test_collection',
            offsetLat: 0,
            offsetLng: 0
          }
        ]],
        ['test_collection', []]
      ]);

      const result = importwpm1(wm1Data);

      expect(result.error).toBeNull();
      expect(result.data).not.toBeNull();
      const mission = result.data?.mission;
      expect(mission?.getMissions()).toContain('main');

      const mainMission = mission?.get('main');
      expect(mainMission).toHaveLength(1);

      const collection = mainMission?.[0];
      expect(collection?.type).toBe('Collection');
      if (collection?.type === 'Collection') {
        expect(collection.name).toBe('test_collection');
        expect(collection.ColType).toBe(0);
        expect(collection.collectionID).toBe('test_collection');
        expect(collection.offsetLat).toBe(0);
        expect(collection.offsetLng).toBe(0);
      }
    });

    it('should return error for invalid JSON input', () => {
      const result = importwpm1('invalid json');
      expect(result.data).toBeNull();
      expect(result.error).not.toBeNull();
      expect(result.error).toBeInstanceOf(Error);
    });

    it('should handle empty missions', () => {
      const wm1Data = JSON.stringify([
        ['main', []]
      ]);

      const result = importwpm1(wm1Data);

      expect(result.error).toBeNull();
      expect(result.data).not.toBeNull();
      const mission = result.data?.mission;
      expect(mission?.getMissions()).toContain('main');
      expect(mission?.get('main')).toHaveLength(0);
    });
  });
}); 

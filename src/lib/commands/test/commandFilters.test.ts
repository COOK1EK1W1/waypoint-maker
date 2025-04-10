import { expect, test } from "bun:test";
import { makeCommand } from "../default";
import { filterLatLngCmds, filterLatLngAltCmds } from "../commands";

const waypoint = makeCommand("MAV_CMD_NAV_WAYPOINT", {
  latitude: 52,
  longitude: -3.3,
  altitude: 100
});

const dubins = makeCommand("WM_CMD_NAV_DUBINS", {
  latitude: 53,
  longitude: -3.4,
  altitude: 150
});

const vtol = makeCommand("MAV_CMD_NAV_VTOL_LAND", {});
const setServo = makeCommand("MAV_CMD_DO_SET_SERVO", {});

const commands = [waypoint, dubins, vtol, setServo];

test("filterLatLngCmds filters commands with latitude and longitude", () => {
  const filtered = filterLatLngCmds(commands);

  expect(filtered.length).toBe(3);
  expect(filtered).toContain(waypoint);
  expect(filtered).toContain(dubins);
  expect(filtered).toContain(vtol);
  expect(filtered).not.toContain(setServo);
});

test("filterLatLngAltCmds filters commands with latitude, longitude and altitude", () => {
  const filtered = filterLatLngAltCmds(commands);

  expect(filtered.length).toBe(2);
  expect(filtered).toContain(waypoint);
  expect(filtered).toContain(dubins);
  expect(filtered).not.toContain(vtol);
  expect(filtered).not.toContain(setServo);
});

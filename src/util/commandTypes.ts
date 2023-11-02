export const commandTypes = [
  { value: 16, name: "Waypoint", MAV: "MAV_CMD_NAV_WAYPOINT" },
  { value: 17, name: "Loiter Unlimited", MAV: "MAV_CMD_NAV_LOITER_UNLIM" },
  { value: 18, name: "Loiter Turns", MAV: "MAN_CMD_NAV_LOITER_TURNS" },
  { value: 20, name: "Return To Launch", MAV: "MAV_CMD_NAV_RETURN_TO_LAUNCH" },
  { value: 21, name: "Land", MAV: "MAV_CMD_NAV_LAND" },
  { value: 22, name: "Takeoff", MAV: "MAV_CMD_TAKEOFF" }
]

export function getData() {
  return fetch("https://raw.githubusercontent.com/ArduPilot/mavlink/master/message_definitions/v1.0/common.xml")
    .then(a => a.text())
    .then(xmlText => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");

      // Check for errors
      const errors = xmlDoc.getElementsByTagName('parsererror');
      if (errors.length > 0) {
        // Handle parsing errors
        throw new Error('Error parsing XML: ' + errors[0].textContent);
      }
      const enums = xmlDoc.querySelectorAll('enum[name="MAV_CMD"]');
      const entries = enums[0].getElementsByTagName('entry');
      return entries;
    });
}

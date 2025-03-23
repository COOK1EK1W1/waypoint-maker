import { commands } from "@/lib/commands/commands"

export function commandName(name: (typeof commands)[number]["name"]) {
  switch (name) {
    case "MAV_CMD_NAV_WAYPOINT":
      return "Waypoint"
    case "MAV_CMD_NAV_LOITER_UNLIM":
      return "Loiter Unlimited"
    case "MAV_CMD_NAV_LOITER_TURNS":
      return "Loiter Turns"
    case "MAV_CMD_NAV_LOITER_TIME":
      return "Loiter Time"
    case "MAV_CMD_NAV_RETURN_TO_LAUNCH":
      return "Return To Launch"
    case "MAV_CMD_NAV_LAND":
      return "Land"
    case "MAV_CMD_NAV_TAKEOFF":
      return "Takeoff"
    case "WM_CMD_NAV_DUBINS":
      return "Dubins"

    default:
      return name.toLowerCase().slice(8).replaceAll("_", " ").replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());

  }

}

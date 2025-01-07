import { WaypointCollection, CollectionType, Waypoint } from "@/types/waypoints";

export function waypointTo_waypoints_file(waypoints: WaypointCollection) {
  let returnString = "QGC WPL 110\n"

  const [cnt, wpstr] = renderWaypoints(0, "Main", waypoints)
  returnString += wpstr
  return returnString
}

function renderWaypoints(curWP: number, missionName: string, store: WaypointCollection): [number, string] {
  let returnString: string = ""
  const waypoints = store.get(missionName)
  if (waypoints == undefined) return [0, ""]

  for (let i = 0; i < waypoints.length; i++) {

    let a = waypoints[i]
    switch (a.type) {
      case "Waypoint": {
        returnString += waypointString(curWP, a.wps)
        curWP += 1
        break
      }
      case "Collection": {
        switch (a.ColType) {
          case CollectionType.Mission: {
            const [newWPnum, wpstr] = renderWaypoints(curWP, a.collectionID, store)
            returnString += wpstr
            curWP = newWPnum
            break
          }
          case CollectionType.Overlay: {
            break
          }
          case CollectionType.Geofence: {
            break
          }
          default: {
            const _exhaustiveCheck: never = a.ColType;
            return _exhaustiveCheck
          }

        }
        break
      }
      default: {
        const _exhaustiveCheck: never = a;
        return _exhaustiveCheck
      }
    }

  }
  return [curWP, returnString]

}

function waypointString(i: number, wp: Waypoint) {
  return `${i}\t${i == 0 ? "1" : "0"}\t${wp.frame}\t${wp.type}\t${wp.param1}\t${wp.param2}\t${wp.param3}\t${wp.param4}\t${wp.param5}\t${wp.param6}\t${wp.param7}\t${wp.autocontinue}\n`
}

export function downloadTextAsFile(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function waypointTo_waypoints_file(waypoints: Waypoint[]) {
  let returnString = "QGC WPL 110\n"

  for (let i = 0; i < waypoints.length; i++) {
    returnString += `${i}\t${i == 0 ? "1" : "0"}\t${waypoints[i].frame}\t${waypoints[i].type}\t${waypoints[i].param1}\t${waypoints[i].param2}\t${waypoints[i].param3}\t${waypoints[i].param4}\t${waypoints[i].param5}\t${waypoints[i].param6}\t${waypoints[i].param7}\t${waypoints[i].autocontinue}\n`
  }
  return returnString
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
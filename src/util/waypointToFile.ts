export function waypointToFile(waypoints: Waypoint[]) {
  let returnString = "QGC WPL 110\n"

  for (let i = 0; i < waypoints.length; i++) {
    returnString += `${i}\t${i == 0 ? "1" : "0"}\t${waypoints[i].frame}\t${waypoints[i].type}\t${waypoints[i].param1}\t${waypoints[i].param2}\t${waypoints[i].param3}\t${waypoints[i].param4}\t${waypoints[i].lat}\t${waypoints[i].lng}\t${waypoints[i].alt}\t${waypoints[i].autocontinue}\n`
  }
  return returnString
}

export function downloadTextAsFile(filename: string, text: string) {
  // Create a Blob object with the text content
  const blob = new Blob([text], { type: 'text/plain' });

  // Create a link element
  const link = document.createElement('a');

  // Set the link's href to point to the Blob object
  link.href = window.URL.createObjectURL(blob);

  // Set the download attribute to the desired file name
  link.download = filename;

  // Append the link to the body (it doesn't have to be visible)
  document.body.appendChild(link);

  // Programmatically trigger the click event
  link.click();

  // Remove the link from the document
  document.body.removeChild(link);
}
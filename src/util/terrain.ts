type openElevation = { elevation: number, latitude: number, longitude: number }[]

export function getTerrain(locs: [number, number][]): Promise<openElevation | null> {
  if (locs.length == 0) return Promise.resolve(null)
  let locstring = locs.map((loc) => `${loc[0].toFixed(7)},${loc[1].toFixed(7)}`).join("|")

  return fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${locstring}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (!data.results) {
        throw new Error("No results found in the response");
      }
      return data.results as openElevation;
    })
    .catch((error) => {
      console.log("Error fetching elevation data:", error);
      return null;
    });
}

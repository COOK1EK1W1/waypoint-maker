type openElevation = {elevation: number, latitude: number, longitude: number}[]
export function getTerrain(locs: [number, number][]): Promise<openElevation|null>{
  if (locs.length == 0) return new Promise(()=>null)
  let locstring = ""
  for (let i = 0; i < locs.length; i++){
    locstring += `${locs[i][0]},${locs[i][1]}|`
  }
  return fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${locstring}`)
    .then((x)=>x.json())
    .then((x)=>x.results as openElevation)
    .catch((error)=>{
      console.error("An error occurred while fetching terrain data:", error);
      return null;
    })
}

import { useWaypointContext } from "../WaypointContext";

export default function ListItem({id}: {id: number}){
  const {setWaypoints, setActive, active } = useWaypointContext()
  function open(){
    setActive(id)

  }

  function remove(e: React.MouseEvent<HTMLButtonElement>){
    e.stopPropagation()
      setActive((prevActive) => {
        if (prevActive == 0 || prevActive == null){
          return null
        }else{
          return prevActive - 1
        }
      })
    setWaypoints((prevWaypoints) =>{
      let newWaypoints = [...prevWaypoints]
      newWaypoints.splice(id, 1);
      return newWaypoints
    })
    
  }
  return (
      <div className={`rounded p-2 m-2 border-grey border-2 cursor-pointer ${active == id ? "bg-slate-200" : ""}`} onClick={open}>

        <span>{id}</span>
        <span className="pl-2">Waypoint</span>
        <button className="pl-4" onClick={remove}>delete</button>

      </div>
      
  )

}
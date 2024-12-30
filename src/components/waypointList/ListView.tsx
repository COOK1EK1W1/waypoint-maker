import { useState } from "react"
import SubMissionList from "../subMissionList/subMissionList"
import MissionList from "./MissionList"
import { cn } from "@/util/tw"
import Button from "@/components/toolBar/button"

export default function ListView(){
  const [hidden, setHidden] = useState(false)
  return <>
  {hidden?<Button className="absolute z-20 rounded-lg right-2 top-2" onClick={()=>setHidden(false)}>WP list</Button>:null}

  <div className={cn("h-[calc(100dvh-1rem)] z-20 absolute right-0 w-[calc(100vw-1rem)] md:w-60 m-2 ease-in-out duration-200 shadow-lg shadow-black", hidden ? "right-[-100vw]":"md:right-1")}>
    <div className="bg-white h-full md:w-60  flex flex-col rounded-lg">
      <MissionList onHide={()=> setHidden(true)}/>
      <SubMissionList/>
    </div>
  </div>
  </>
}

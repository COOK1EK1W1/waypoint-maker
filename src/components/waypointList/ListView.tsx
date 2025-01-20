import { useState } from "react"
import SubMissionList from "../subMissionList/subMissionList"
import MissionList from "./MissionList"
import { cn } from "@/lib/utils"
import Button from "@/components/toolBar/button"

export default function ListView() {
  const [hidden, setHidden] = useState(false)
  return <>
    {hidden ? <Button className="absolute z-20 rounded-lg right-2 top-14 md:top-2" onClick={() => setHidden(false)}>WP list</Button> : null}

    <div className={cn("h-[100dvh] p-2 top-0 pt-14 ease-in-out duration-200 absolute z-20 md:pt-2", hidden ? "right-[-100vw] md:right-[-60]" : "right-0")}>
      <div className={cn("w-full md:w-60 h-full shadow-lg shadow-black")}>
        <div className="bg-white h-full md:w-60 flex flex-col rounded-lg">
          <MissionList onHide={() => setHidden(true)} />
          <SubMissionList />
        </div>
      </div>
    </div>
  </>
}

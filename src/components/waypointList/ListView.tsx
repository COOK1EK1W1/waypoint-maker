import { useState } from "react"
import SubMissionList from "../subMissionList/subMissionList"
import MissionList from "./MissionList"
import { cn } from "@/lib/utils"
import { Button } from "../ui/button"

export default function ListView() {
  const [hidden, setHidden] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false)
  return <>
    {hidden ? <Button variant="active" className="shadow-xl absolute z-20 rounded-lg right-2 top-14 md:top-2" onClick={() => setHidden(false)}>WP list</Button> : null}

    <div className={cn("h-[100dvh] w-full md:w-72 p-2 top-0 pt-14 ease-in-out duration-200 absolute z-20 md:pt-2", hidden ? "right-[-100vw] md:right-[-60]" : "right-0")}>
      <div className={cn("w-full h-full shadow-lg shadow-black")}>
        <div className="bg-white h-full flex flex-col rounded-lg">
          <MissionList onHide={() => setHidden(true)} />
          <SubMissionList />
        </div>
      </div>
    </div>
  </>
}

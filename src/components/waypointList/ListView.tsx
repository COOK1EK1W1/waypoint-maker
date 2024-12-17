import SubMissionList from "../subMissionList/subMissionList"
import MissionList from "./MissionList"

export default function ListView(){
  return <div className="h-full z-20 absolute right-0 p-2">
    <div className="bg-white h-full w-[250px] flex flex-col rounded-lg">
      <MissionList/>
      <SubMissionList/>
    </div>
  </div>
}

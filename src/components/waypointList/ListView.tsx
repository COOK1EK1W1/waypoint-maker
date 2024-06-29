import SubMissionList from "../subMissionList/subMissionList"
import MissionList from "./MissionList"

export default function ListView(){
  return <div className="h-full w-[250px] flex flex-col">
    <MissionList/>
    <SubMissionList/>
  </div>
}

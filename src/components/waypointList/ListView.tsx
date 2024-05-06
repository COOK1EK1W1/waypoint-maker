import SubMissionList from "../subMissionList/subMissionList"
import MissionList from "./MissionList"

export default function ListView(){
  return <div style={{width: "400px"}} className="flex flex-col justify-between">
    <MissionList/>
    <SubMissionList/>
  </div>
}

import SubMissionList from "../subMissionList/subMissionList"
import MainMission from "./mainMission"

export default function ListView(){
  return <div style={{width: "400px"}}>
    <MainMission/>
    <SubMissionList/>
  </div>
}

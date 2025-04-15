import LoadJson from "@/components/modal/IO/importButtons";
import DownloadButtons from "@/components/modal/IO/exportButtons";
import CloudSync from "./cloudSync";

export default function MissionIOModal() {

  return (
    <div>
      <h2>Export</h2>
      <DownloadButtons />
      <h2>Import</h2>
      <LoadJson />
      {process.env.ALLOWLOGIN ? (<>
        <h2>Cloud Sync</h2>
        <CloudSync /></>) : null
      }
    </div>
  )
}

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Image from "next/image"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import MapSettings from "./system/mapSettings"
import { ThemeToggle } from "./system/themeSettings"

export default function SystemModal() {

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="items-center flex flex-row cursor-pointer">
          <Image width={46} height={32} className="h-9 px-2" src="/logo-192x192.png" alt="Waypoint Maker Logo" />
          <h1 className="mx-4 py-0 hidden lg:flex items-center">Waypoint Maker</h1>
        </div>
      </DialogTrigger>
      <DialogContent className="h-[610px] flex flex-col">
        <DialogTitle className="text-4xl">Settings</DialogTitle>
        <Tabs>
          <TabsList>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="map" >Map</TabsTrigger>
          </TabsList>
          <TabsContent value="system">

            <div className="w-full flex flex-col items-center">
              <Image className="hover:animate-spin" width={192} height={192} src="/logo-192x192.png" alt="Waypoint Maker Logo" />
              <p className="text-muted-foreground">Waypoint Maker</p>
              <p className="text-muted-foreground">Version 2.1 - 2025</p>
              <div className="flex items-center pt-2">
                <Link className="text-muted-foreground" href="https://github.com/COOK1EK1W1/waypoint-maker">Source</Link>
                <div className="rounded-full mx-2 w-2 h-2 bg-muted"></div>
                <Link className="text-muted-foreground" href="https://github.com/COOK1EK1W1/waypoint-maker/issues">Report an issue</Link>
              </div>

            </div>
            <h2>Apperance</h2>
            <div className="w-full flex justify-between">
              <p>Select Theme</p>
              <ThemeToggle />
            </div>
          </TabsContent>
          <TabsContent value="map">
            <div className="">
              <MapSettings />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )

}

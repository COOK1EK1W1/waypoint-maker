import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import WaypointProvider from '@/util/context/WaypointProvider'
import VehicleProvider from '@/util/context/VehicleTypeProvider'
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Waypoint Maker',
  keywords: ['waypoint', 'autonomous', 'mission planning', 'ground station', 'airplane', 'quad copter', 'arduplane', 'ardupilot', 'QGroundControl'],
  description: 'A website designed to make it easier to make waypoint missions for autonomous vehicles',
  authors: [{ name: "Ciaran Cook", url: 'https://ciarancook.com' }, { name: 'Team Aero-Watt', url: "https://www.aero-watt.com" }],
  creator: "Ciaran Cook"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Analytics />
        <WaypointProvider>
          <VehicleProvider>
            {children}
          </VehicleProvider>
        </WaypointProvider>
      </body>
    </html>
  )
}

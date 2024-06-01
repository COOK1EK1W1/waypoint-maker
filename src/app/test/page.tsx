"use client"

import { useState } from "react"

export default function Page(){
  const [count, setCount] = useState(0)
  return (
  <div className="flex flex-col w-full h-[100lvh] justify-center items-center">
      <p className="text-xl pb-2">
      Count: {count}
      </p>
      <div>
        <button className="p-2 m-2 border-2 rounded-lg shadow" onMouseDown={()=>setCount((prev) => prev+1)}>click me</button>
        <button className="p-2 m-2 border-2 rounded-lg shadow" onMouseDown={()=>setCount((prev) => prev+1)}>click me</button>
      </div>
  </div>
  )

}

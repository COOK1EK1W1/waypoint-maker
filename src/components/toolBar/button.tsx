import { ReactNode } from "react";

export default function Button({children, onClick}: {children: ReactNode, onClick?: ()=>void}){
  return (
    <div className="flex items-center">
      <button onMouseDown={onClick} className="p-1 m-1 border-1 rounded-lg bg-slate-200 flex items-center">
        {children}
      </button>
      </div>
  )
}

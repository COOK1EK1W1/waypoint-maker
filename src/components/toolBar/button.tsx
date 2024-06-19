import { ReactNode } from "react";

export default function Button({children, onClick}: {children: ReactNode, onClick?: ()=>void}){
  return (
    <button onMouseDown={onClick} className="p-1 m-1 border-1 rounded-lg bg-slate-200">
      {children}
    </button>

  )

}

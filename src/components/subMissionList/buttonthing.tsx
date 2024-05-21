import { ReactNode } from "react";

export default function Button({children, onClick}:{children: ReactNode, onClick:()=>void}){

  return <button className="m-2 p-1 border w-[180px] rounded box-shadow" onClick={onClick}>{children}</button>
}

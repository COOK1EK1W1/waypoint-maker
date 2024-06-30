"use client"

import { Modal } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowRightLong } from "react-icons/fa6";


export default function StartModal(){ 
	const [displayPopUp, setDisplayPopUp] = useState(false);
	const router = useRouter()

	function handleClose(){
		localStorage.setItem("seenPopUp", "true");
		setDisplayPopUp(false)
	}

	useEffect(()=>{
		if(localStorage.getItem("seenPopUp") != "true"){
			setDisplayPopUp(true)
		}
	}, [])


	if(displayPopUp)
	return(
		<Modal

			open={displayPopUp}
			onClose={()=>setDisplayPopUp(false)}
			>        
			
			<div className="bg-white w-80 absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] rounded-lg p-4 flex flex-col justify-between">
				<div>
					<h1>Waypoint maker</h1>
					<p className="py-2">Welcome to waypoint maker, the software developed to make it easier to write complex waypoint missions, yet keep them error free</p>
					<p className="py-2">Please read over the help page for tips<button className="mx-2 px-2 bg-slate-200 rounded-lg" onMouseDown={()=>router.push("/help")}><FaArrowRightLong/></button></p>
					<p className="py-2">DISCLAIMER: mobile devices are not supported yet. Application is still under construction</p>
				</div>
				<div className="w-full flex justify-center">
					<button className="bg-slate-200 p-2 px-4 rounded-lg hover:scale-105" onMouseDown={handleClose}> get started</button>
				</div>
			</div>
		</Modal>
	)
}

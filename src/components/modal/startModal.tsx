"use client"

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import Button from "@/components/toolBar/button";

export default function StartModal() {
	const [displayPopUp, setDisplayPopUp] = useState(false);

	function handleClose() {
		localStorage.setItem("seenPopUp", "true");
		setDisplayPopUp(false)
	}

	useEffect(() => {
		if (localStorage.getItem("seenPopUp") != "true") {
			setDisplayPopUp(true)
		}
	}, [])


	return (
		<Dialog open={displayPopUp}>
			<DialogContent>

				<DialogTitle>Waypoint Maker</DialogTitle>
				<div>
					<p className="py-2">Welcome to waypoint maker, the software developed to make it easier to write complex waypoint missions, yet keep them error free</p>
					{//<p className="py-2">Please read over the help page for tips<button className="mx-2 px-2 bg-slate-200 rounded-lg" onMouseDown={()=>router.push("/help")}><FaArrowRightLong/></button></p>

					}
					<h2 className="py-2">Ethical Use Statement</h2>
					<p className="py-2">While this software is released under the GNU General Public Licence (GPL) to ensure freedom for all users, the author(s) explicitly discourage its use for military, harmful, or unethical purpose. We urge users to consider the potential impact of their actions and to prioritise peaceful and ethical applications of this software.</p>
				</div>
				<DialogFooter>
					<Button className="hover:scale-105" onClick={handleClose}> Get Started</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

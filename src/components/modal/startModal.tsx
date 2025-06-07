"use client"

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";

const displayName = "seenPopUpv2"

export default function StartModal() {
	const [displayPopUp, setDisplayPopUp] = useState(false);

	function handleClose() {
		localStorage.setItem(displayName, "true");
		setDisplayPopUp(false)
	}

	useEffect(() => {
		if (localStorage.getItem(displayName) !== "true") {
			setDisplayPopUp(true)
		}
	}, [])


	return (
		<Dialog open={displayPopUp}>
			<DialogContent>

				<DialogTitle>Waypoint Maker</DialogTitle>
				<div>
					<p className="py-2">Welcome to waypoint maker, the software developed to make it easier to write complex waypoint missions, yet keep them error free.</p>
					{//<p className="py-2">Please read over the help page for tips<button className="mx-2 px-2 bg-card rounded-lg" onMouseDown={()=>router.push("/help")}><FaArrowRightLong/></button></p>

					}
					<h2 className="py-2">Ethical Use Statement</h2>
					<p className="py-2">While this software is released under the GNU General Public Licence (GPL) to ensure freedom for all users, the author(s) explicitly discourage its use for military, harmful, or unethical purpose. We urge users to consider the potential impact of their actions and to prioritise peaceful and ethical applications of this software.</p>

					<p className="py-2 text-sm text-gray-600">
						{`By clicking "Get Started", you agree to our `}
						<Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
						{" "}and{" "}
						<Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
					</p>
				</div>
				<DialogFooter>
					<Button variant="active" className="w-36" onClick={handleClose}>Get Started<ArrowRight className="ml-1 w-5 h-5" /></Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

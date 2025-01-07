import { ReactNode } from "react";
import { Modal as MUIModal } from "@mui/material"
import { twMerge } from "tailwind-merge";

export default function Modal({ children, open, onClose, className }: { className?: string, children: ReactNode, open: boolean, onClose: () => void }) {
	return (
		<MUIModal open={open} onClose={onClose}>
			<div className={twMerge("absolute z-30 bg-white w-80 absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] rounded-lg p-4 flex flex-col justify-between", className)}>
				{children}
			</div>
		</MUIModal>
	)
}

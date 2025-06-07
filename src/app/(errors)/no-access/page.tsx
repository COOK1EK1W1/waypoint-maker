import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function noAccess() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center">
      <h1>You do not have access to this mission</h1>
      <Link href="/" className="no-underline text-black"><Button >Return</Button></Link>
    </div>
  )
}

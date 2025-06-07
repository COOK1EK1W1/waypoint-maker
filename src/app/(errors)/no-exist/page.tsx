import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function noExist() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center">
      <h1>This mission does not exist, it may have been deleted</h1>
      <Link href="/" className="no-underline text-black"><Button >Return</Button></Link>
    </div>
  )
}

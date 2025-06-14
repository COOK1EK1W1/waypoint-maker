import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function noParse() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center">
      <h1>The mission is corrupt or possibly using an older version</h1>
      <Link href="/" className="no-underline text-black"><Button >Return</Button></Link>
    </div>
  )
}

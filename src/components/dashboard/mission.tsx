import { Mission } from "@prisma/client";
import Link from "next/link";

export default function MissionTile({ mission }: { mission: { title: string, modifiedAt: Date, id: string } }) {

  return (
    <Link href={`/m/${mission.id}`} className="block no-underline text-inherit border-2 border-slate-200 w-full rounded-lg p-1 m-1 bg-slate-100">
      <p>{mission.title}</p>

    </Link>
  )

}

import { getServerSession } from "next-auth";
import Button from "./button";

export default async function User() {
  const data = await getServerSession()
  console.log(data)
  if (data) {
    return (<Button>{data.user?.name}</Button>)
  } else {
    return null

  }

}

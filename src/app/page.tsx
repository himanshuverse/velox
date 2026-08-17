import { requireAuth } from "@/lib/auth-utils"
import { caller } from "@/trpc/server"

const page = async  () => {

  await requireAuth()

  const data=await caller.getUsers()

  return (
    <div className="text-green-400 min-h-screen min-w-screen flex items-center justify-center">
      server protected component
      {JSON.stringify(data , null , 2)}
    </div>
  )
}

export default page
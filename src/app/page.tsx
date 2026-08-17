import { requireAuth } from "@/lib/auth-utils"

const page = async  () => {

  await requireAuth()

  return (
    <div className="text-green-400 min-h-screen min-w-screen flex items-center justify-center">
      server protected component
    </div>
  )
}

export default page
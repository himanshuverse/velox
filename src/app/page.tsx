'use client'

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

const page =  () => {
  const { data } =authClient.useSession()
  return (
    <div className="text-green-400 min-h-screen min-w-screen flex items-center justify-center">
      {JSON.stringify(data)}
      <Button onClick={()=>authClient.signOut()}>
        Logout
      </Button>
    </div>
  )
}

export default page
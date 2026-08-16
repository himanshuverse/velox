import { Button } from "@/components/ui/button"
import { caller, getQueryClient } from "@/trpc/server"
import { trpc } from "@/trpc/server"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { Suspense } from "react"
import { Client } from "./client"
const page = async () => {

  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(trpc.getUsers.queryOptions())
  return (
    <div className="text-green-400 min-h-screen min-w-screen flex items-center justify-center">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<p>loading....</p>}>
          <Client />
        </Suspense>
      </HydrationBoundary>
    </div>
  )
}

export default page
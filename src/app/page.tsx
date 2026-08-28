'use client'


import { Button } from "@/components/ui/button"
import { requireAuth } from "@/lib/auth-utils"
import { useTRPC } from "@/trpc/client"
import { caller } from "@/trpc/server"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

const page =   () => {

  const trpc=useTRPC()
  const queryClient =useQueryClient()
  const {data} =useQuery(trpc.getWorkflows.queryOptions())
  // await requireAuth()

  const create= useMutation(trpc.createWorkflow.mutationOptions({
    onSuccess:()=>{
      queryClient.invalidateQueries(trpc.getWorkflows.queryOptions())
    }
  }))

  return (
    <div className="text-green-400 min-h-screen min-w-screen flex items-center justify-center ">
      server protected component
      {JSON.stringify(data , null , 2)}

      <Button className="bg-white"  disabled={create.isPending} onClick={()=>create.mutate()}>
        Create Workflow
      </Button>
    </div>
  )
}

export default page
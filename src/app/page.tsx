import { Button } from "@/components/ui/button"
import prisma from "@/lib/db"


const   page =async () => {
  return (
    <div className="text-red-400 min-h-screen min-w-screen flex items-center justify-center">
      <Button >
        click me 
      </Button>
    </div>
  )
}

export default page
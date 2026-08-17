
import { LoginForm } from "@/features/components/auth/login-form"
import { requireUnauth } from "@/lib/auth-utils"

export default async function page() {

  await requireUnauth()
  return (
    <div>
      <LoginForm/>
    </div>
  )
}

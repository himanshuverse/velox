"use client"
import { useForm } from "react-hook-form"
import z from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { FieldGroup } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"


const loginSchema =z.object(
    {
      email: z.string().email("please provide valid email "),
      password:z.string().min(6,"password should at least 6 char")
    }
)

type loginFormValue = z.infer<typeof loginSchema>

export function LoginForm(){

    const router=useRouter()


    const form =useForm<loginFormValue>({
        resolver:zodResolver(loginSchema),
        defaultValues:{
            email:"",
            password:""
        }
    })

    const onSubmit=async (values:loginFormValue)=>{
        console.log()
    }

    const pending = form.formState.isSubmitting

    return(
   <div className="flex flex-col gap-6">
    <Card>
        <CardHeader className="text-center">
            <CardTitle>
                Welcome back
            </CardTitle>
            <CardDescription>
                Login to continue
            </CardDescription>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="grid gap-4">
                            <div className="flex flex-col gap-4">
                                <Button variant={"outline"} className="w-full" type="button" disabled={pending}>
                                    Continue With Github
                                </Button>
                                <Button variant={"outline"} className="w-full" type="button" disabled={pending}>
                                    Continue With Google
                                </Button>
                            </div>
                            <div className="grid gap-6">
                                <FormField 
                                control={form.control}
                                name="email"
                                render={({field})=>(
                                    <FormItem>
                                        <FormLabel>
                                            Email
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}>

                                </FormField>
                            </div>
                        </div>
                    </form>
                </Form>
            </CardContent>

        </CardHeader>
    </Card>
   </div>
    )
}
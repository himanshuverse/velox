"use client"
import { useForm } from "react-hook-form"
import z from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"


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
        await authClient.signIn.email({
            email:values.email,
            password:values.password,
            callbackURL :"/"
        },{
            onSuccess:()=>{
                router.push("/")
            },onError:(ctx)=>{
                toast.error(ctx.error.message)
            }
        })
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
                                            type="email"
                                            placeholder="m@example.com"
                                            {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}>

                                </FormField>
                                <FormField 
                                control={form.control}
                                name="password"
                                render={({field})=>(
                                    <FormItem>
                                        <FormLabel>
                                            Password
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                            type="password"
                                            placeholder="enter your password "
                                            {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}>

                                </FormField>
                                <Button type="submit" className="w-full" disabled={pending}>
                                    Login
                                </Button>
                                <div className="text-center text-sm"> Don't have an account ?{" "}
                                    <Link href="/signup " className="underline underline-offset-4">
                                    Sign up
                                    </Link>
                                </div>
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
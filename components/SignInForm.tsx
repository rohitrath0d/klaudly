/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-unused-vars */

"use client"

import { signInSchema } from "@/schemas/signInSchema"
import { useSignIn } from "@clerk/nextjs"
import { Button } from "@heroui/button"
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card"
import { Divider } from "@heroui/divider"
import { Input } from "@heroui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { CircleAlert, Mail, Lock, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
// import { is } from "drizzle-orm"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

export default function SignInForm(){

  const router = useRouter();

  // sign-in (useSignUp) hook from clerk -> for signUp we did useSignUp()
  const {signIn, isLoaded, setActive} = useSignIn()
  
  const [isSubmitting, setIsSubmitting] = useState(false)       // if the form is submitting, we can load the spinner there.

  const [authError, setAuthError] = useState<string | null>(null)

  const [showPassword, setShowPassword] = useState(false)

  const {register,              // register -> stores/collects all the data
        handleSubmit,           // handleSubmit -> a method, which further calls a method, and because it superimposed that it pass on all the data in the register.
        formState: {errors}
      } = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",              // -> But i've used email, and not identifier in signInSchema
      // email: "",
      password: ""
    }
  })

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    if(!isLoaded) return;

    setIsSubmitting(true);
    setAuthError(null);

    // submitting the information to the clerk
    try {
      const result = await signIn.create({
        identifier: data.identifier,
        password: data.password,
      })
      
      // here, we've stored the result, and now will check that if the status is completed or not (because this process of verification has been already done).. and this is taken care by the clerk itself.
      // from documentation of clerk
      if(result.status === "complete"){
        await setActive({session: result.createdSessionId})                 // creating a session id, using result (handled by clerk itself)
        router.push("/dashboard");
      } else{
        console.error("Sign-in incomplete:", result);
        setAuthError("Sign in could not be completed. Please try again!")
      }

    } catch (error: any) {
      console.error("Sign-in error:", error);
      //  setting the auth errors correctly
      setAuthError(
        error.errors?.[0]?.message || "An error occurred during sign in. Please try again."

      )
    } finally{
      setIsSubmitting(false)
    }

  };

  return(
    <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">

      <CardHeader className="flex flex-col gap-1 items-center pb-2">
        <h1 className="text-2xl font-bold text-default-900"> Welcome Back </h1>
          <p className="text-default-500 text-center">
              Sign in to access your secure cloud storage
          </p>

      </CardHeader>

      <Divider />

      <CardBody className="py-6">
        {
          authError && (
            <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
              <CircleAlert className="h-5 w-5 flex-shrink-0"/>
              <p>{authError}</p>
            </div>
          )
        }

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label 
              htmlFor="identifier"
              className="text-sm font-medium text-default-900"
              >
                Email
            </label>
            <Input
              id="identifier"
              type="email"
              placeholder="youremail@example.com"
              startContent = {<Mail className="h-4 w-4 text-default-500" />}
              isInvalid= {!!errors.identifier}
              errorMessage={errors.identifier?.message}
              {...register("identifier")}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label 
                htmlFor="password"
                className="text-sm font-medium text-default-900"
              >
                Password
              </label>
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              startContent= {<Lock className="h02 2-4 text-default-500"/>}
              endContent = {
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onClick={()=> setShowPassword(!showPassword)}
                  type="button"
                >
                  {
                    showPassword ? (
                      <EyeOff className="h-4 w-4 text-default-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-default-500"/>
                    )
                  }
                </Button>
              }
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
              {...register("password")}
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            color="primary"
            className="w-full"
            isLoading={isSubmitting}
          >
            {isSubmitting? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardBody>

      <Divider/>

      <CardFooter className="flex justify-center py-4">
     
        <p className="text-sm text-default-600">
          Don't have an account?{" "}
          <Link
            href= "/sign-up"
            className="text-primary hover:underline font-medium"
          > 
          Sign up
          </Link>
        </p>
    
      </CardFooter>

    </Card>
  )

}
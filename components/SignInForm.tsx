/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { signInSchema } from "@/schemas/signInSchema"
import { useSignIn } from "@clerk/nextjs"
import { zodResolver } from "@hookform/resolvers/zod"
import { is } from "drizzle-orm"
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

  const {register,              // register -> stores/collects all the data
        handleSubmit           // handleSubmit -> a method, which further calls a method, and because it superimposed that it pass on all the data in the register.
  } = useForm({
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
      if(result.status === "complete"){
        await setActive({session: result.createdSessionId}) 
      } else{
        setAuthError("Sign in error!")
      }

    } catch (error: any) {
      //  setting the auth errors correctly
      setAuthError(
        error.errors?.[0]?.message || "An error occured during sign in process"

      )
    } finally{
      setIsSubmitting(false)
    }

  }

  return(
    <h1>Return a sign in form</h1>
  )

}
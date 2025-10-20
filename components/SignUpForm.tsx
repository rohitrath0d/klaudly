/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import {useForm} from "react-hook-form"

// clerk also provides their own UI, even with all the components used for signUp, and signIn. 
// but, for making our own custom UI, we have to bring-in a method (useSignUp -> which is a hook), from the clerk/nextjs
import {useSignUp} from "@clerk/nextjs"     

import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod" 
// zod custom schema
// bring-in the schema for signUp. we wrote for zod validation, so we can use it now for the validation.
import { signUpSchema } from "@/schemas/signUpSchema"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {Card, CardHeader, CardBody, CardFooter} from "@heroui/card";
import {Divider} from "@heroui/divider";
import {Input} from "@heroui/input";
import {Button, ButtonGroup} from "@heroui/button";
import { AlertCircle, CheckCircle, CircleAlert, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Link from "next/link"


export default function SignUPForm(){

  const router = useRouter();

  // signUp -> from useSignUp -> provides -> name, email, password initialization -> and hence sends all this to clerk and initiates the process of sending the OTP.
  // hence to maintain the track of verification process state, we will be initializing the state.
  const [ verifying, setVerifying ] =  useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")        // we can also have a schema for the OTP code for the number of characters and all, but for now attaching it to a state.
  const [authError, setAuthError] = useState<string | null>(null)         // <string | null>

  const [verificationError, setVerificationError] = useState<string | null>(null)

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // we gonna submit the form using -> useSignUp() -> from clerk, which is a hook
  // and we have to destructure this hook -> read documentation for this.
  const {signUp, isLoaded, setActive} = useSignUp()

  // react hook form -> from documentation of react hook form.
  const {
    register,                                               // useForm()  -> comes from react-hook-form.
    handleSubmit,                                           // register (property/object) -> collects all of the data.      handleSubmit (property/object) -> submits the form.    formState -> deals with errors
    formState: {errors},
  } = useForm<z.infer<typeof signUpSchema>>({            // useForm<z.infer<typeof signUpSchema>  --> inputs (data) coming from 'z' -. from zod -> and using signUpSchema using 'infer' selection -> which marks the mandate and generates the updated schema for the migrated changes.
    resolver: zodResolver(signUpSchema),                 // this is a clear indication that this schema will have zod schema validation.
    defaultValues: {                                    // defaultValues -> each of the input fields we have, what default values that they have, so that i dont run the schema based on that default values
      email: "",
      password: "",
      passwordConfirmation: "",
    }
  })

   
  // Step 1:  to decide, which component, do we want to return. 
  // We are doing 2 things at the same time in this application.
  // 1st: Submitting the form (user signUp)
  // 2nd: Verification (when the user enters the OTP...sended through clerk)
  
  const onSubmit = async (data: z.infer <typeof signUpSchema>) => {
    if(!isLoaded) return;         // it's just a boolean flag, stating if isLoaded is true. then something is loaded. and something is being loaded.

    // if not running
    setIsSubmitting(true)
    setAuthError(null)

    // sending values to clerk
    try {
      // creating the user in the clerk
      await signUp.create({                    // signUp from -> useSignUp() -> from clerk   
        emailAddress: data.email,              // .create, .createEmail is all method provided by clerk itself, read docs.
        password: data.password,
      })

      // verifying the user now.
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code"
      })
      setVerifying(true)                        // why this needs to be true? -> because based on this state we are having OTP entering field.
    } catch (error: any) {
      console.error("Signup error: ", error);
      
      setAuthError(
        error.errors?.[0]?.message  || "An error occured during the sign up. Please try again"
      )
    } finally{
      setIsSubmitting(false)
    }

  }
  const handleVerificationSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if(!isLoaded || !signUp) return;

    setIsSubmitting(true);
    setAuthError(null);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code : verificationCode
      })

      // todo: console result
      if(result.status === "complete"){                         // session is created, through sessionActive (by clerk)
        await setActive({session: result.createdSessionId})
        // if the sessionId is created, route user to the  other page.
        router.push("/dashboard")
      } else {
          console.error("Verification incomplete: ", result);
          setVerificationError(
            "Verification could not be completed. Please try again."
          );
      }
    } catch (error: any) {
      console.error("Verification error: ", error);
      setVerificationError(
        error.errors?.[0]?.message || "An error occurred during verification. Please try again."
      )
    } finally {
      setIsSubmitting(false)  
    }
  }


  if(verifying){
    return(
      <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">

        <CardHeader className="flex flex-col gap-1 items-center pb-2">

          <h1 className="text-2xl font-bold text-default-900">
            Verify your email
          </h1>

          <p className="text-default-500 text-center">
              We have sent a verification code to your email
          </p>

        </CardHeader>

        <Divider />

        <CardBody className="py-6">
          {verificationError  && (
            <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">

            {/* AlertCircle to be added */}
            <CircleAlert className="h-5 w-5 flex-shrink-0" /> 

            <p>
              {verificationError}
            </p>
        </div>
          )}

        <form onSubmit={handleVerificationSubmit} className="space-y-6">

          <div className="space-y-2">
            <label 
              htmlFor="verificationCode"
              className="text-sm font-medium text-default-900">
                Verification Code
            </label>

            <Input 
              id="verificationCode"
              type="text"
              placeholder="Enter the 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>

          <Button 
            type="submit"
            color="primary"
            className="w-full"
            isLoading = {isSubmitting}
          >
            {isSubmitting ? "Verifying..." : "Verify Email" }
          </Button>
        </form>

        {/* if didn't receive the code */}
        <div className="mt-6 text-center">
          <p className="text-sm text-default-500">
            Didn't receive a code? {" "}
            <button
               onClick = { 
                async()  => {
                  if(signUp){
                    await signUp.prepareEmailAddressVerification({
                      strategy: "email_code"
                    });
                  }
                }}
                className="text-primary hover:underline font-medium"
            >
              Resend code
            </button>
          </p>
        </div>
        </CardBody>
      </Card>
    );
  }

  // returning a complete sign-up form
  return(
    <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
      <CardHeader className="flex flex-col gap-1 items-center pb-2">
        <h1 className="text-2xl font-bold text-default-900">
            Create Your Account
        </h1>

        <p className="text-default-500 text-center">
          Sign up to start managing your images securely
        </p>
      </CardHeader>

      <Divider/>
     
      <CardBody className="py-6">
      
      {
        // auth error
        authError && (
          <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{authError}</p>
          </div>
        )
      }


      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-default-900"
            >
              Email
          </label>

            <Input
            id="email"
            type="email"
            placeholder="youremail@example.com"
            startContent = {<Mail className="h-4 w-4 text-default-500" />}
            isInvalid= {!!errors.email}
            errorMessage = {errors.email?.message}
            {...register("email")}
            className="w-full"
            /> 
        </div>

        <div className="space-y-2">
          <label 
            htmlFor="password"
            className="text-sm font-medium text-default-900"
            >
            Password
          </label>
          
          <Input
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          startContent= {<Lock className="h-4 w-4 text-default-500" />}
          endContent = {
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onClick={() => setShowPassword(!showPassword)}
              type="button"
            >
              {showPassword ? (
                <EyeOff  className= "h-4 w-4 text-default-500"/>
              ):(
                <Eye className="h-4 w-4 text-default-500" />
              )}
              
            </Button>
          }
          isInvalid = {!!errors.password}
          errorMessage = {errors.password?.message}
          {...register("password")}
          className= "w-full"
         />  
        </div>

        <div className="space-y-2">
          <label 
            htmlFor="passwordConfirmation"
            className="text-sm font-medium text-default-900"
            >
              Password confirmation
          </label>

          <Input
            id="passwordConfirmation"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            startContent = {<Lock className="h-4 w-4 text-default-500"/>}
            endContent={
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                type="button"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-default-500" />
                ): (
                  <Eye  className="h-4 w-4 text-default-500"/> 
                )}
              </Button>
            }
            isInvalid= {!!errors.passwordConfirmation}
            errorMessage={errors.passwordConfirmation?.message}
            {...register("passwordConfirmation")}
            className="w-full"
          />
        </div>    
        
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
            <p className="text-sm text-default-600">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

        <Button
          type="submit"
          color="primary"
          className="w-full"
          isLoading={isSubmitting}
        >
            {isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>

      </form>
      </CardBody>
      
      <Divider />

      <CardFooter className="flex justify-center py-4">
        <p className="text-sm text-default-600">
          Already have an account? {" "}
          <Link
            href="/sign-in"
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
import * as z from "zod";

export const signUpSchema = z
    .object({
      email: z
            .string()
            .min(1, {message: "Email is required!"})
            .email({message: "Please enter a valid email"}),
      
      password: z
              .string()
              .min(1, {message:"Password is required!"})                          // first required field will be checked for atleast 1 character
              .min(8, {message: "Password should be at-least 8 characters"})      // then, the minimum of 8 characters required, will be checked.
              .max(20, {message: "Password length can be maximum 20 characters"}),

      passwordConfirmation: z
              .string()
              .min(1, {message: "Please confirm your password"})
    })    
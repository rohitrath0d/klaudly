import * as z from "zod";

export const signInSchema = z
    .object({
      // identifier: z         // why used identifier -> for working with clerk, this makes more sense.
      email: z
        .string()
        .min(1, {message: "Email can't be an empty field"})
        .email({message: "Please enter a valid email"}),
      
      password: z
          .string()
          .min(1, {message: "Password can't be an empty field"})
          .min(8, {message: "Password should be at-least of 8 characters"})
          .max(20, {message: "Password length can be maximum of 20 characters"} )
    })
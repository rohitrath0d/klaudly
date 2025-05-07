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

              // Summary to note: password -> has many validation phases and passwordConfirmation -> has only 2 validation phases -> the string one and the minimum one.
              // now we have no way to recognize the matching/being-equal of the password & the passwordConfirmation 
    })      // once we get the object of the validation, the upper signUpSchema object, then we can use the refine -> it takes 2 thing as paramters 
            // 1st thing:- is the method itself (is called as predicate function), and 2nd thing: configuration.
            // Predicate function -> gets all the data stored inside the object.
    .refine((data) => data.password === data.passwordConfirmation, // this is the policy where password and the passwordConfirmation needs to be checked, and needs to be accurate.
    {
      // configuration
      // if something goes wrong, this is some of the parameters, that needs to be set.
      message: "Password do not match",

      // whenever, we will use this zod, they will come from the input field, in our react hook form
      // when the password will be validated, it needs to be go through the checking of minimum & maximum & string check. and for passwordConfirmation:- string & minimum check.
      
      // but for refine, we must explicitly specify the path, of, setting the message of the confirmation to be globally or within the defined input box.
      // i want, that this message property, should go as error field in a particular path (globally, or defined input) -> and hence this is where, the property 'path' comes in picture.
      path: ["passwordConfirmation"]      // passwordConfirmation, and its need to be a string
    })
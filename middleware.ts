/* eslint-disable @typescript-eslint/no-unused-vars */
import { clerkMiddleware, createRouteMatcher, auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'


// creating public routes, inside the middleware, the user should be able to access it, only if user is logged in.

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"])

// we gonna have request -> intercepting all the middleware properties, and also the "auth -> states about user's authenticated or not"
export default clerkMiddleware(async(auth, request) => {
  // from clerk nextjs documentation 
  // extract some of the things from the auth
  const user = auth()                     // await can also be applied here, but it works sometimes, and sometimes it doesn't work.
  const userId = (await user).userId      // needs user info ->hence await
  const url = new URL(request.url)

  //  if user is authenticated, we dont want user to access the '/sign-up" and the "/sign-in"
  if(userId && isPublicRoute(request) && url.pathname !== "/"){
    return NextResponse.redirect(new URL("/dashboard", request.url)) 
  }

  // Protect non-public routes
  if(!isPublicRoute(request)){
    await auth.protect()                // if the user is not authenticated, it will do all the protection, the redirection protection, and it will automatically get it to the "/sign-in"
  }                                     // all done by clerk
})


export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
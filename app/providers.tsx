/* eslint-disable @typescript-eslint/no-unused-vars */
// sometimes we gonna realise that, there are not only ClerkProvider, but more providers available to you.
// ClerkProvider -> easily can be wrapped up in the layout. But there might be an ImageKit Provider / HeroUI Provider / Toast library also we are using -> that also has a provider.
// So it is a very common practice -> that we have a separate Provider's file -> and we wrap up some of the components in a customised Prover -> which is an abstraction for many Providers (very common practice in the NextJS ecosystem).

"use client"
import type {ThemeProviderProps} from "next-themes"
import {ThemeProvider as NextThemesProvider} from "next-themes"

export interface ProviderProps {
  children: React.ReactNode,
  themeProps?: ThemeProviderProps
}


export function Providers({children, themeProps}: ProviderProps){
  return(
    <h1>
      {/* this children really interesting way of dealing with the things -> anything that comes a prop, it will wrap around. */}
      {children}
    </h1>
  )
}
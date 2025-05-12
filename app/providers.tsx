/* eslint-disable @typescript-eslint/no-unused-vars */
// sometimes we gonna realise that, there are not only ClerkProvider, but more providers available to you.
// ClerkProvider -> easily can be wrapped up in the layout. But there might be an ImageKit Provider / HeroUI Provider / Toast library also we are using -> that also has a provider.
// So it is a very common practice -> that we have a separate Provider's file -> and we wrap up some of the components in a customised Prover -> which is an abstraction for many Providers (very common practice in the NextJS ecosystem).

"use client"
import type { ThemeProviderProps } from "next-themes"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ImageKitProvider } from "imagekitio-next"      // This provider needs you to make you a request on the endpoint(api/imagekit-auth) and gets this authenticator function, because there are props (credential keys and functionalities/flow) that needs to be passed on this provider (ImagekitProvider),and then we can use it in the frontend using an authenticator function.
import { ToastProvider } from "@heroui/toast"
import { HeroUIProvider } from "@heroui/system"
import * as React from "react"
import { useRouter } from "next/navigation"
import { createContext, useContext } from "react";


declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

// Create a context for ImageKit authentication
export const ImageKitAuthContext = createContext<{
  authenticate: () => Promise<{
    signature: string;
    token: string;
    expire: number;
  }>;
}>({
  authenticate: async () => ({ signature: "", token: "", expire: 0 }),
});

export const useImageKitAuth = () => useContext(ImageKitAuthContext);


export interface ProviderProps {
  children: React.ReactNode,
  themeProps?: ThemeProviderProps
}

// authenticator function:-
// we using the frontend part for imagekit ("use client") and not for the backend (backend api endpoint hitting -> we need imagekit initialization with its credentials.)
// hence, Since, we are using a client component (use client), it is expected to wrap the things with this kinds of things.Specially an "authenticator function". (read documentation of uploading files examples) 

// ImageKitProvider wraps components and provides image upload features.
// It needs authentication parameters, which must come from a secure backend endpoint (/api/imagekit-auth).
// Since this is a client component, we can't expose credentials here, so we use an authenticator function that fetches these parameters from our backend.
const authenticator = async () => {
  try {
    const response = await fetch("/api/imagekit-auth");       // makes fetch request to our own endpoint (api/imagekit-auth), which gives us a response data.
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Authentication error: ", error);
    throw error;
  }
};

export function Providers({ children, themeProps }: ProviderProps) {
  const router = useRouter();

  return (
    
      // {/* this children really interesting way of dealing with the things -> anything that comes a prop, it will wrap around. */}
      // {/* just talked about that there are many providers and hence we are providing here, the imagekitProvider and wrapping {children} in it */}

      <HeroUIProvider navigate={router.push}>
        <ImageKitProvider
          authenticator={authenticator}     // authenticator -> takes the authenticator function to pass it on.

          // IMPORTANT:- this is client side, and hence the things which are marked here as public, only that can go up here.
          publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || ""}
          urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
        >
          {/* now grabbing another provider and wrapping it up */}
          <ImageKitAuthContext.Provider value={{ authenticate: authenticator }}>
          <ToastProvider placement="top-right" />
          <NextThemesProvider {...themeProps}>
          {children}
          </NextThemesProvider>
          </ImageKitAuthContext.Provider>
        </ImageKitProvider>
      </HeroUIProvider>
    
  )
}
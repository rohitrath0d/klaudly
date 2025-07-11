import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/global.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // we can add ClerkProvider at many places, but in layout.tsx wrapping it in html rendering makes it super simple to work with. now any provider of clerk will directly be able to access it on the frontend part.
    // Suppose, in any of the pages -> we might need clerk provider and all of that -> just because we have imported clerkProvider in the layout.tsx -> we can use the clerk anywhere now. -> even in backend , also frontend (has some equal hooks for it)
    <ClerkProvider>

      <html lang="en"  suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {/* we have the clerkProvider wrapping up everything, all we have to do is wrap up the {children}, as did same in the ClerkProvider */}
          <Providers>

            {/* wrapping the whole layout, with Providers function that provides all the Providers*/}
          {children}
          </Providers>
        </body>
      </html>

    </ClerkProvider>

  );
}

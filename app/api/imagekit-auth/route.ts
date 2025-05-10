/* eslint-disable @typescript-eslint/no-unused-vars */
import { auth } from "@clerk/nextjs/server";        // we will be using this auth on the backend part, and that's why it needs to come with the server.
import { NextResponse } from "next/server";
import ImageKit from "imagekit";


// from imagekit documentation
// SDK initialization

// var ImageKit = require("imagekit");

const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

export async function GET() {
    // in the nextJS, there was a vulnerability, not in the newer version (which i am currently building on), but the previous one.
    // security vulnerability in nextJS -> if there is any endpoint, that endpoint and whole middleware thing can be bypassed.
    // so the dev team of nextJS- suggested/mentioned that the every single endpoint, you should actually authenticate, whether the user is authenticated to access that endpoint, whether it is validated by middleware or not. 

    try {
        const {userId} = await auth()
        if(!userId){
            return NextResponse.json({error: "Unauthorized"},
                {status: 401}
            )
        }
    
        
        const authParams = imagekit.getAuthenticationParameters()
        
        return NextResponse.json(authParams)
    } catch (error) {
        return NextResponse.json({error: "Failed to generate authentication parameters for imagekit"}, {status: 500})
    }
    

}
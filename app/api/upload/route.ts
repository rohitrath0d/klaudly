/* eslint-disable @typescript-eslint/no-unused-vars */
// incase, we be using any video/audio component -> we have to make sure that we are using provider ->so that the application is always authenticated

import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { use } from "react";

//  IMPORTANT:- 
// How do we upload any data? --> whenever any data is uploaded, we use the imagekit component and the image/video goes inside the imagekit component
// --> because the endpoint automatically hits it
// --> it uploads that image/video and 
// --> returns back the body 

// in this file -> we only gonna work on route
// our job in the upload is that take the data (userID and image) from the frontend -> take it onto the upload endpoint and save it in the database.


// POST endpoint
export async function POST(request: NextRequest) {
  try {

    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" },
        { status: 401 }
      )
    }

    // if user is successfully authenticated -> Parse request body
    const body = await request.json()             // every single time in nextJs, we have to await that, if used express -> we dont await it there.
    const {imagekit, userId: bodyUserId} = body   // we have added (imagekit-auth folder), because it requires authentication.
                                                  // There will be a provider, just like clerk, which will wrap up the application and imagekit provides the upload zone(just drag&drop the file)  and give u the response back. and we need that response (in the form of body).

    if(bodyUserId === userId){
      return NextResponse.json({ error: "Unauthorized" },
        { status: 401 }
      )
    }

  // validating the data coming in the imagekit is also correct or not
  if(!imagekit || !imagekit.url){
    return NextResponse.json({ error: "Invalid file upload data." },
      { status: 401 }
    )
  }

  // extract the data and construct our own file data -> and save it.
  const fileData = {
    name: imagekit.name || "untitled",
    path: imagekit.filePath || `/droply/${userId}/${imagekit.name}`,
    size: imagekit.size || 0,
    type: imagekit.fileType || "image",
    fileUrl: imagekit.url,
    thumbnailUrl: imagekit.thumbnailUrl || null,
    userId: userId,
    parentId: null,         // Root level by default
    isFolder: false,
    isStarred: false,
    isTrash: false
  }

  // insert the file into the record / database.
  const [newFile] = await db.insert(files).values(fileData).returning()            // In Drizzle ORM (and SQL in general), .returning() returns an array of rows
                                                                                  // Even if you're inserting just one row, it still comes back as a 1-element array.  [newFile] -> destructuring from array   &&  {newFile} -> destructuring from objects.
  // sends the response
  return NextResponse.json(newFile)

  
  } catch (error) {
    return NextResponse.json({error: "Failed to save info to database"}, {status: 500})
  }
}


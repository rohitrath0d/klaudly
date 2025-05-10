/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import {eq, and} from "drizzle-orm"               // eq -> test two values are equal  and -> both/two of the case should be true.
import { NextRequest, NextResponse } from "next/server";
import {v4 as uuidv4} from "uuid"

export async function POST(request: NextRequest){
  try {
    const {userId} = await auth()
    if(!userId){
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // grab data from the body, so we can verify that.
    const body = await request.json()
    // destructure some data -> coming from body
    const {name, userId: bodyUserId, parentId = null} = body

    // userId coming from the response body, needs to match with the userId coming from auth() -> from clerk
    if(bodyUserId !== userId){
      return NextResponse.json({ error: "Unauthorized" },
        { status: 401 });
    }
    
    //  
    if(!name || typeof name !== "string" || name.trim() === ""){
      return NextResponse.json({ error: "Unauthorized" },
        { status: 400 });
    } 

    // validation through sql
    // check whether the parentId exists or not -> it could be null too. but still check first -> if exists , we want to move into the yes part (verifications)of the parentId.
    if(!parentId){
      const [parentFolder] = await db
          .select()
          .from(files)
          .where(
            and(
              eq(files.id, parentId),         // if providing me the parentId and i'm selecting it from the files, it should match the parentId that the file's id there.
              eq(files.userId, userId),       // it needs to belong to that user
              eq(files.isFolder, true)        // it needs to be a folder
            )
          )

      // if parentFolder, does not exist.
      if(!parentFolder){
        return NextResponse.json({ error: "Parent folder not found" },
          { status: 401 }
        )
      }
    }

    // create a folder in database
    // IMPORTANT:- folder doesn't actually exist, it's just a path which we have, so we upload any files, we upload after this and make this as a path -> and this path is just used for displaying in the frontend and the actual data will come up from the fileUrl
    // EVEN IN OPERATING SYSTEM -> FOLDER DOESN'T EXIST, IT'S JUST CONTAINER OF THE FILE, TO GIVE USER THE FILE, THAT THEY ACTUALLY EXIST.
    const folderData = {
      // needs an id 
      id: uuidv4(),
      name: name.trim(),
      path: `/folders/${userId}/${uuidv4()}`,
      size: 0,
      type: "folder",
      fileUrl: "",
      thumbnailUrl: null,
      userId,
      parentId,
      isFolder: true,
      isStarred: false,
      isTrash: false,
    }

    const [newFolder] = await db.insert(files).values(folderData).returning()
    
    return NextResponse.json({
      success: true, 
      message: "Folder Created Successfully!",
      folder: newFolder                               // returning this folder as newFolder
    })
  } catch (error) {
    
  }
}

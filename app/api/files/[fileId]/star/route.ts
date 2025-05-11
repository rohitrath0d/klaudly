/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";


// Why not get/post, but patch -> because we are putting up some instructions on that
// props: {params: Promise} -> in the latest version of the NextJS, this param is a promise. 
// nextJs devs keep changing things -> first they were called as regular params -> directly access them, but now "await" for it. 
export async function PATCH(request: NextRequest, props: { params: Promise<{ fileId: string }> }) {

  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({
        error: "Unauthorized"
      }, { status: 401 });
    }

    // grab the file id -> await it
    // everything is await now, including body, formData
    const {fileId} = await props.params

    // if fileId doesn't exist
    if(!fileId){
      return NextResponse.json({error: "File id is required"}, {status: 401})
    }

    // what's next -> put the query into the database, because someday has raised a flag/clicked -> that they want to mark this as star
    // await db -> find the file with the fileId, and mark one field as changed.
    const [file] = await db.select().from(files).where(
      and(
        eq(files.id, fileId),
        eq(files.userId, userId)
      )
    )
    // check if file, exists or not. 
    if(!file){
      return NextResponse.json({error: "File not found"}, {status: 401})
    }

    // toggle the star status
    // one time -> request comes, mark as ON || another time -> request comes, mark as OFF
    // hence querying the db again ->  updating the state here. hence update(files) -> now i want to set one thing -> set() -> what->isStarred property -> where () -> matching the conditions defined.
    const updatedFiles = await db.update(files).set({isStarred: !file.isStarred}).where(         //   !file.isStarred -> this ! here, just gets done the toggle being here.
      and(
        // same parameters to be checked as above
        eq(files.id, fileId),
        eq(files.userId, userId)
      )
    ).returning()
    // log the whole updatedFiles
    console.log(updatedFiles);
     
    const updatedFile =  updatedFiles[0]        // extracting just the [0] -> 1st one out of it.
    return NextResponse.json(updatedFile)
  
  } catch (error) {
    return NextResponse.json({error: "Failed to update the file"}, {status: 500})
  }

}
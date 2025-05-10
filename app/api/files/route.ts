/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import {eq, and, isNull} from "drizzle-orm"                     // the parentId could be null -> for root Folder. 
import { NextRequest, NextResponse } from "next/server";



// if i am seeing the basic home folder -> how should i see my files?
// all the files that i have created in the root folder, they should be available there.
// or, if i double click on any folder -> it means that -> i'm passing the user, the parentId, and just give me those files under this parentId.
// so now, we have to design a GET route, for getting files -> 1. Passed parentId (viewing files inside the parentFolder) or 2. Not Passed parentId (viewing root files.)

export async function GET (request: NextRequest){
   try {
     const {userId} = await auth()
    if(!userId){
      return NextResponse.json({
        error: "Unauthorized"}, {status: 401});
    }

    // now there could be many ways of how user might be requesting for a file.
    // so we will be extracting them, from the searchParam, queryId -> (from the queryId -> we need to get the userId and also the parentId )
    
    // how to grab info from the searchParams in NextJS:-
    // in the request, we have nextUrl, we can grab searchParams easily
    // just like queryParams -> we have searchParams -> searching for a particular file.  
    const searchParams = request.nextUrl.searchParams
    const queryUserId =  searchParams.get("userId") 
    const parentId = searchParams.get("parentId")
   
    // now verifying the queryId is the id that we have grabbed from userId
    if(!queryUserId || queryUserId !== userId){
      return NextResponse.json({
        error: "Unauthorized"}, {status: 401});
    }

    // now how do we access files, from the database -> based on the parentId
    // 2 cases can be here -> parentId can be there || cannot be there.
    // fetch files from database
    let userFiles;
    if(parentId){
      // if parentId is there, than it means, parentId is not null.

      // fetching from a specific folder
      userFiles= await db
          .select()
          .from(files)
          .where(                                 // want to select all-> no!  Hence put some of the where clauses/conditions (and & eq), for filtering
            and(  
              eq(files.userId, userId),
              eq(files.parentId, parentId)        // specific files from a particular folder
            )
          )
    } else{
      // what if don't have the parentId -> isNull
      userFiles= await db
          .select()
          .from(files)
          .where(
            and(
              eq(files.userId, userId),                   // meaning: files -> will have a userId field, which needs to be matched with the userId provided by us(clerk).
              isNull(files.parentId)                      // if for a particular file, parentId is null -> that means it's a root folder (because they are file, which don't have any parentId).
            )
          )
    }
    return NextResponse.json(userFiles)

   } catch (error) {
    return NextResponse.json({error: "Error fetching files"}, {status: 500}); 
   }
}
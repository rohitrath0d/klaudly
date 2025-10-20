/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, isNull } from "drizzle-orm";
import ImageKit from "imagekit";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";                             // Provides the unique names

// initialization of imagekit object (from documentation)
// imagekit credentials
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});


// initialization of endpoint
export async function POST(request: NextRequest) {

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("auth userId", userId)


    // parse a formData
    // IMPORTANT:- EVERYTHING REQUIRES AWAIT IN THE NEXTJS, WHENEVER YOU RECEIVE THE DATA BODY OR FROM WHATEVER YOU LIKE IT.
    const formData = await request.formData()

    // extract 3 things from the formData
    // parse form data
    const file = formData.get("file") as File                        // basically it's a buffer ->blob/buffer (read about this in detail)
    console.log("File", file);
    const formUserId = formData.get("userId") as string
    console.log("formUserId", formUserId)
    const parentId = formData.get("parentId") as string || null

    // match the id with the userId
    if (formUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    }
    // if file doesn't exists
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 401 });
    }
    // 
    if (parentId) {
      // if have parentId -> query the database to match the conditions
      const [parentFolder] = await db
        .select()
        .from(files)
        .where(
          and(
            eq(files.id, parentId),              // folder parent id of that file -> it exists
            eq(files.userId, userId),
            eq(files.isFolder, true)              // should be a folder (boolean flag)
          )
        )
      console.log("ParentFolder", parentFolder);

    }
     else{
      return NextResponse.json({error: "Parent folder not found"},{status: 401})
    }

    // totally optional based on your flow. 
    // if (!parentId) {
    //   return NextResponse.json({ error: "Parent folder not found" }, { status: 401 })
    // }

    // check if the file is of type image/pdf         -> for png it could be simply "image/png"
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only images and pdf are supported" }, { status: 401 });
    }


    // any files/images/pdf handling -> we need to transfer it to the imagekit -> we already have an instantiated object of imagekit, but it requires a buffer to be passed on. -> whenever we pass on files to any such "uploads services"(specially imagekit) -> we need to convert that file into buffer.
    // buffer -> it's like an array, but in different format (hex-format)
    const buffer = await file.arrayBuffer()

    // create a file buffer
    const fileBuffer = Buffer.from(buffer)


    // how the parent structure or the folder path exist, when you want to upload to the root directory and when you want to upload in the subfolder 
    const folderPath = parentId ? `/klaudly/${userId}/folder/${parentId}` : `/klaudly/${userId}`        // how the folder path looks, when parenId exists, and when does it not.

    const originalFilename = file.name

    // fileExtension 
    // originalFilename is your file name — like "photo.png" or "document.pdf"
    // .split(".") breaks that name into pieces wherever there's a dot: "photo.png" becomes ["photo", "png"]    ||    "resume.final.pdf" becomes ["resume", "final", "pdf"]   ||   "noextension" becomes ["noextension"] (here no . exists)
    // .pop() takes the last item from that list — this is what we consider the file extension:  ["photo", "png"] → pops "png"     ||       ["resume", "final", "pdf"] → pops "pdf"       ||        ["noextension"] → pops "noextension" (which is wrong — but that’s why we add a check)
    //    || "" — this is a fallback:   If pop() returns undefined (e.g., if the file was just ""), then use an empty string instead, to avoid crashing the code.
    const fileExtension = originalFilename.split(".").pop() || ""

    // check for empty extension
    // if(!fileExtension || fileExtension === originalFilename){            //
    // --> So why do we need !originalFilename.includes(".")?
    // Because for files like "file" (no dot at all):       split(".") gives ["file"]  &   .pop() gives "file" — which is not an actual extension! That slips past the !fileExtension check unless you do something extra. hence originalname must include "."
    if (!fileExtension || !originalFilename.includes(".")) {
      return NextResponse.json({ error: "File type not supported or allowed." }, { status: 401 });
    }

    console.log("File extension of uploaded file:", fileExtension);


    // validation for not storing exe, php -> (for preventing injection of malware files )
    const blockedExtensions = ["exe", "php"];
    if (blockedExtensions.includes(fileExtension.toLowerCase())) {
      return NextResponse.json({ error: "File type not supported or allowed" }, { status: 401 });
    }

    // creating unique fileName
    const uniqueFilename = `${uuidv4()}.${fileExtension}`

    // upload the files/pdf to imagekit
    // its a fileupload and hence will take some time -> hence await.
    // upload() function -> coming from imagekit itself (read documentation)
    const uploadResponse = await imagekit.upload({
      file: fileBuffer,           // file in the buffer format
      fileName: uniqueFilename,
      folder: folderPath,
      useUniqueFileName: false,   // if turn this true -> don't need to do (but get more control) originalFilename and fileExtension
    })

    // create a fileData
    const fileData = {
      name: originalFilename,
      path: uploadResponse.filePath,
      size: file.size,
      type: file.type,
      fileUrl: uploadResponse.url,
      thumbnailUrl: uploadResponse.thumbnailUrl || null,
      userId: userId,
      parentId: parentId,
      isFolder: false,
      isStarred: false,
      isTrash: false,
    }
    const [newFile] = await db.insert(files).values(fileData).returning()     // we have to provide the value. can't insert directly.

    return NextResponse.json(newFile)
  } catch (error) {
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}


// the main basis understanding for this upload is ->
// even if i don't want to upload it through the frontend itself, i can have my own endpoint, more validations, and how can i have an endpoint to upload files to the imagekit.
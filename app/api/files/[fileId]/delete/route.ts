/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import ImageKit from "imagekit";
import { NextRequest, NextResponse } from "next/server";


// initialization of imagekit object (from documentation)
// imagekit credentials
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});


// initialize DELETE endpoint

export async function DELETE(request: NextRequest, props: { params: Promise<{ fileId: string }> }) {

  try {

    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({
        error: "Unauthorized"
      }, { status: 401 });
    }

    const { fileId } = await props.params

    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 })
    }

    const [file] = await db.select().from(files).where(
      and(
        eq(files.id, fileId),
        eq(files.userId, userId)
      )
    )
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 401 })
    }

    // upar ka part was same as star/route.ts

    // deleting files logic

    // Delete file from Imagekit if it's not a folder (because root folder and folder are just facade.)
    if (!file.isFolder) {
      try {
        let imagekitFileId = null;

        if (file.fileUrl) {
          const urlWithoutQuery = file.fileUrl.split("?")[0];
          imagekitFileId = urlWithoutQuery.split("/").pop();
        }

        if (!imagekitFileId && file.path) {
          imagekitFileId = file.path.split("/").pop();
        }

        if (imagekitFileId) {
          try {
            const searchResults = await imagekit.listFiles({
              name: imagekitFileId,
              limit: 1,
            });

            if (searchResults && searchResults.length > 0) {
              await imagekit.deleteFile(searchResults[0].fileId);
            } else {
              await imagekit.deleteFile(imagekitFileId);
            }

          } catch (searchError) {
            console.error(`Error searching for file in ImageKit:`, searchError);
            await imagekit.deleteFile(imagekitFileId);
          }
        }

      } catch (error) {
        console.error(`Error deleting file ${fileId} from ImageKit:`, error);
      }
    }
    // Delete file from database
    const [deletedFile] = await db
      .delete(files)
      .where(and(eq(files.id, fileId), eq(files.userId, userId)))
      .returning();

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
      deletedFile,
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}

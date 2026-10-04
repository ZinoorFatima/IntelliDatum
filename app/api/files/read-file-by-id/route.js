import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import { getUserIdFromRequest, unauthorizedResponse } from "../../../lib/verifyToken";
import { findUserFile } from "../../../../controllers/fileController";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json({ success: false, message: "Missing fileId" }, { status: 400 });
    }

    const userId = await getUserIdFromRequest(req);
    if (!userId) return unauthorizedResponse();

    await connectDB();
    const file = await findUserFile(fileId, userId);

    if (!file) {
      return NextResponse.json({ success: false, message: "File not found" }, { status: 404 });
    }

    const decodedFileContent = file.fileData?.toString("utf-8") || "";

    return NextResponse.json({
      success: true,
      file: {
        ...file.toObject(),
        fileContent: decodedFileContent, // 👈 add this decoded string
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

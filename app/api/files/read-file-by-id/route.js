import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import fileModel from "../../../../models/fileModel"; 
import { verifyToken } from "../../../lib/verifyToken"; 

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json({ success: false, message: "Missing fileId" }, { status: 400 });
    }

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized: No token provided" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Unauthorized: Invalid token" }, { status: 401 });
    }

    await connectDB();
    const file = await fileModel.findById(fileId);

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

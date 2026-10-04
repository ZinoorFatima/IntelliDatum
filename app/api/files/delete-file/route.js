import { connectDB } from "../../../lib/db";
import { getUserIdFromRequest, unauthorizedResponse } from "../../../lib/verifyToken";
import { findUserFile } from "../../../../controllers/fileController";

export async function DELETE(req) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return unauthorizedResponse();

    await connectDB();
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return new Response(JSON.stringify({ success: false, message: "File ID is required" }), { status: 400 });
    }

    const file = await findUserFile(fileId, userId);
    if (!file) {
      return new Response(JSON.stringify({ success: false, message: "File not found" }), { status: 404 });
    }

    await file.deleteOne();

    return new Response(JSON.stringify({ success: true, message: "File deleted successfully" }), { status: 200 });
  } catch (error) {
    console.error("Delete error:", error);
    return new Response(JSON.stringify({ success: false, message: "Error deleting file" }), { status: 500 });
  }
}

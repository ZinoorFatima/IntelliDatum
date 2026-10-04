// app/api/files/get-dictionary/route.js
import { connectDB } from "../../../lib/db";
import { getUserIdFromRequest, unauthorizedResponse } from "../../../lib/verifyToken";
import { findUserFile } from "../../../../controllers/fileController";

export async function GET(req) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return unauthorizedResponse();

    await connectDB();
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId");

    const file = await findUserFile(fileId, userId, "dictionaryName dictionaryFile");
    if (!file) {
      return new Response(JSON.stringify({ success: false, message: "File not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({
      success: true,
      dictionary: {
        name: file.dictionaryName,
        content: file.dictionaryFile,
        type: file.dictionaryFile?.trim().startsWith("<") ? "xml" : "text"
      }
    }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, message: "Server error" }), {
      status: 500,
    });
  }
}

// app/api/files/get-dictionary/route.js
import { connectDB } from "../../../lib/db";
import fileModel from "../../../../models/fileModel";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId");

    const file = await fileModel.findById(fileId).select("dictionaryName dictionaryFile");
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
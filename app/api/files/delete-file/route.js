import { connectDB } from "../../../lib/db";
import fileModel from "../../../../models/fileModel";

export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return new Response(JSON.stringify({ success: false, message: "File ID is required" }), { status: 400 });
    }

    await fileModel.findByIdAndDelete(fileId);

    return new Response(JSON.stringify({ success: true, message: "File deleted successfully" }), { status: 200 });
  } catch (error) {
    console.error("Delete error:", error);
    return new Response(JSON.stringify({ success: false, message: "Error deleting file" }), { status: 500 });
  }
}

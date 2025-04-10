import { connectDB } from "../../../lib/db";
import { getProfilePictureController } from "../../../../controllers/userController";

export async function GET(req) {
  try {
    await connectDB();
    return await getProfilePictureController(req);
  } catch (error) {
    console.error("Profile picture API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
import { connectDB } from "../../../lib/db";
import { getUserIdFromRequest, unauthorizedResponse } from "../../../lib/verifyToken";
import { getProfilePictureController } from "../../../../controllers/userController";

export async function GET(req) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return unauthorizedResponse();

    await connectDB();
    return await getProfilePictureController(req, userId);
  } catch (error) {
    console.error("Profile picture API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

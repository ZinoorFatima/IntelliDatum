import { connectDB } from "../../../lib/db";
import { getUserIdFromRequest, unauthorizedResponse } from "../../../lib/verifyToken";
import { updateProfileController } from "../../../../controllers/authcontroller";

export async function POST(req) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return unauthorizedResponse();

    await connectDB();
    return updateProfileController(req, userId);
  } catch (error) {
    console.error("Update Profile Error:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}

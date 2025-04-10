import { connectDB } from "../../../lib/db";
import { updateProfileController } from "../../../../controllers/authcontroller";

export async function POST(req) {
  try {
    await connectDB();
    return updateProfileController(req);
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

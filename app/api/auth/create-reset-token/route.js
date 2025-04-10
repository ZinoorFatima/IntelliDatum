import { createResetTokenController } from "../../../../controllers/authcontroller";
import { connectDB } from "../../../lib/db";

export async function POST(req) {
  try {
    await connectDB();
    return createResetTokenController(req);
  } catch (error) {
    console.error("Error in reset token API:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET() {
  return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}

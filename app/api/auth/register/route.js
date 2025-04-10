import { registerController } from "../../../../controllers/authcontroller"; // Adjust path as needed
import { connectDB } from "../../../lib/db";
export async function POST(req) {
    try {
        await connectDB();
        const data = await req.json(); // Parse the stream
        console.log("Request data:", data);
        return registerController(data); // Pass parsed data
      } catch (error) {
        console.error("Registration error:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500 }
        );
      }
}

export async function GET() {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
    });
}

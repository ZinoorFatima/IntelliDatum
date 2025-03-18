import { registerController } from "../../../../controllers/authcontroller"; // Adjust path as needed
import { connectDB } from "../../../lib/db";
export async function POST(req) {
    await connectDB();
    console.log("hejrhe")
    return registerController(req);
}

export async function GET() {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
    });
}

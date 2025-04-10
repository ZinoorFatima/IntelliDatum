import { registerController } from "../../../../controllers/authcontroller";
import { connectDB } from "../../../lib/db";
export async function POST(req) {
    try {
        await connectDB();
        console.log("hejrhe")
        return registerController(req);
    } catch (error) {
        console.error("Registration error from api:", error);
    }
}

export async function GET() {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
    });
}

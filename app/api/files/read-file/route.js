// app/api/files/read-file/route.js

import { readFilesController } from "../../../../controllers/fileController";
import { connectDB } from "../../../lib/db";

export async function GET(req) {
    try {
        await connectDB(); // Ensure DB connection
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        console.log("User id in api: ", userId);
        return readFilesController(req); // Pass req to controller
    } catch (error) {
        console.error("Error fetching files from API route:", error);
        return new Response(
            JSON.stringify({ message: "Internal Server Error" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}

export async function POST() {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
    });
}

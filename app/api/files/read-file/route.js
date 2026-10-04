// app/api/files/read-file/route.js

import { readFilesController } from "../../../../controllers/fileController";
import { connectDB } from "../../../lib/db";
import { getUserIdFromRequest, unauthorizedResponse } from "../../../lib/verifyToken";

export async function GET(req) {
    try {
        const userId = await getUserIdFromRequest(req);
        if (!userId) return unauthorizedResponse();

        await connectDB(); // Ensure DB connection
        return readFilesController(req, userId);
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

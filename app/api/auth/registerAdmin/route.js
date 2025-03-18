import { registerAdminController } from "../../../../controllers/authcontroller";

export const POST = async (req) => {
    try {
        return await registerAdminController(req);
    } catch (error) {
        console.error("API Error:", error);
        return new Response(JSON.stringify({ success: false, message: "Internal Server Error", error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};

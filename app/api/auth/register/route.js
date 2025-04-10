//import { registerController } from "../../../../controllers/authcontroller"; // Adjust path as needed
//import { connectDB } from "../../../lib/db";
export async function POST(req) {
    
    console.log("Register request body:", req); // Check Amplify logs
    await connectDB();
    return new Response(
        JSON.stringify({
          success: true,
          message: "API CALLED",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    /*try {
        await connectDB();
        console.log("hejrhe")
        return registerController(req);
        //res.status(200).json({ success: true });
    } catch (error) {
        console.error("Registration error:", error);
        //res.status(500).json({ error: error.message });
    }*/
}

export async function GET() {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
    });
}

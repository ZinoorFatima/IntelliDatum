import { loginController } from "../../../../controllers/authcontroller"; 
import { connectDB } from "../../../lib/db";
export async function POST(req) {
    try {
        await connectDB();
        return loginController(req);
    } catch (error) {
        console.error("LOGIN error from api:", error);
    }
}


import { loginController } from "../../../../controllers/authcontroller"; 
import { connectDB } from "../../../lib/db";
export async function POST(req) {
    await connectDB();
    return loginController(req);
}


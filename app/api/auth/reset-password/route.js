import { ResetPasswordController } from "../../../../controllers/authcontroller"; 
import {connectDB} from "../../../lib/db";

export async function POST(req) {
    await connectDB();
    return ResetPasswordController(req);
}


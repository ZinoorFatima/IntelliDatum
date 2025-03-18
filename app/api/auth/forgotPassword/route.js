import { ForgotPasswordController } from "../../../../controllers/authcontroller"; 

export async function POST(req) {
    return ForgotPasswordController(req);
}


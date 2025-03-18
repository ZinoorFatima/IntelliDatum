import { ResetPasswordController } from "../../../../controllers/authcontroller"; 

export async function POST(req) {
    return ResetPasswordController(req);
}


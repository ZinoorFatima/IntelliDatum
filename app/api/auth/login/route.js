import { loginController } from "../../../../controllers/authcontroller"; 

export async function POST(req) {
    return loginController(req);
}


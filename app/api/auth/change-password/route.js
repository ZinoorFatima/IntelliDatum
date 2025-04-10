
import { connectDB } from "../../../lib/db";
import {changePasswordController} from "../../../../controllers/authcontroller"
export async function POST(req) {
  await connectDB();
  return changePasswordController(req);
}

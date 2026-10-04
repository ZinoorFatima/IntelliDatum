
import { connectDB } from "../../../lib/db";
import { getUserIdFromRequest, unauthorizedResponse } from "../../../lib/verifyToken";
import {changePasswordController} from "../../../../controllers/authcontroller"
export async function POST(req) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return unauthorizedResponse();

  await connectDB();
  return changePasswordController(req, userId);
}

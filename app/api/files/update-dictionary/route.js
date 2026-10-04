import { connectDB } from "../../../lib/db";
import { getUserIdFromRequest, unauthorizedResponse } from "../../../lib/verifyToken";
import { updateDictionaryController } from "../../../../controllers/fileController";

export async function PUT(req) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return unauthorizedResponse();

  await connectDB();
  return updateDictionaryController(req, userId);
}

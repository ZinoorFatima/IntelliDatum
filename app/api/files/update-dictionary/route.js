import { connectDB } from "../../../lib/db";
import { updateDictionaryController } from "../../../../controllers/fileController";

export async function PUT(req) {
  await connectDB();
  return updateDictionaryController(req);
}

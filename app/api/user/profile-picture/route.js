// app/api/user/profile-picture/route.js
import { NextResponse } from "next/server";
import userModel from "../../../../models/usermodel"; // adjust to your actual path
import { connectDB } from "../../../lib/db";
export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return new NextResponse("Email required", { status: 400 });
  }

  const user = await userModel.findOne({ email });

  if (!user || !user.profilePicture?.data) {
    return new NextResponse("Image not found", { status: 404 });
  }

  return new NextResponse(user.profilePicture.data, {
    headers: {
      "Content-Type": user.profilePicture.contentType || "image/jpeg",
      "Content-Length": user.profilePicture.data.length,
    },
  });
}

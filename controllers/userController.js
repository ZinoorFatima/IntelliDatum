// controllers/userController.js
import userModel from "../models/usermodel";
import { NextResponse } from "next/server";

export const getProfilePictureController = async (req) => {
  try {
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
  } catch (error) {
    console.error("Error fetching profile picture:", error);
    return new NextResponse("Server error", { status: 500 });
  }
};

// controllers/userController.js
import userModel from "../models/usermodel";
import { NextResponse } from "next/server";

// Profile picture of the signed-in user
export const getProfilePictureController = async (req, userId) => {
  try {
    const user = await userModel.findById(userId).select("profilePicture");

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

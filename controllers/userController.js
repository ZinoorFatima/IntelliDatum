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


// Get User ID by Email Controller
export const getUserIdController = async (req, email) => {
  try {
    console.log("Get User ID by Email API called", email);

    // Input validation
    if (!email) {
      return new Response(JSON.stringify({ message: "Email is required" }), { status: 400 });
    }

    // Find the user by email
    const user = await userModel.findOne({ email });
    
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, message: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Return the user ID (which is the ObjectId in MongoDB)
    return new Response(
      JSON.stringify({
        success: true,
        userId: user._id.toString(),  // Convert ObjectId to string
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching user ID:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error fetching user ID", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

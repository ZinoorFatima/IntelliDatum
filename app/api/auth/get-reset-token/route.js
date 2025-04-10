import  resetTokenModel  from "../../../../models/resetTokenModel";
import  userModel  from "../../../../models/usermodel";
import { connectDB } from "../../../lib/db";

export async function POST(req) {
  await connectDB();

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({
        success: false,
        message: "Email is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        message: "User not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    const latestToken = await resetTokenModel.findOne({ user_id: user._id })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!latestToken) {
      return new Response(JSON.stringify({
        success: false,
        message: "Reset token not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      userId: user._id,
      token: latestToken.token
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error in get-reset-token:", error);
    return new Response(JSON.stringify({
      success: false,
      message: "Internal Server Error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

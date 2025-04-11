import { getUserIdController } from "../../../../controllers/userController";
import { connectDB } from "../../../lib/db";

export async function GET(req) {
  try {
    // Connect to the database
    await connectDB();
    console.log("Database connected");

    // Extract the email from query parameters (GET request)
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    // If email is not provided, return a bad request response
    if (!email) {
      return new Response(
        JSON.stringify({ success: false, message: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Call the getUserIdController to fetch the user by email
    return await getUserIdController(req, email);
  } catch (error) {
    console.error("Error fetching user from API:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal Server Error", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

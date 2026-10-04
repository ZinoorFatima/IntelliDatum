import { comparePassword, hashPassword } from "../helpers/authhelper.js";
import userModel from "../models/usermodel.js";
import JWT from 'jsonwebtoken'
import resetTokenModel from "../models/resetTokenModel.js";
import { sendEmail,mailTemplate } from "../helpers/email.js";
import crypto from 'crypto'
import path from "path";
import fs from "fs";

const RESET_CODE_TTL_MS = 15 * 60 * 1000;
const MAX_RESET_ATTEMPTS = 5;

// The only user fields sent to the browser (never the password hash)
const publicUser = (user) => ({
  FirstName: user.FirstName,
  LastName: user.LastName,
  email: user.email,
  phone: user.phone,
  role: user.role,
});

// Compared against when there's no code to check, so failed resets take the same time either way
let dummyCodeHash;
const getDummyCodeHash = async () => (dummyCodeHash ??= await hashPassword("000000"));


//register controller
export const registerController = async (req) => {
  try {
    console.log("Register API called");

    const { FirstName, LastName, email, password, phone } = await req.json();

    // Validation
    if (!FirstName) return new Response(JSON.stringify({ message: "First name is required" }), { status: 400 });
    if (!LastName) return new Response(JSON.stringify({ message: "Last name is required" }), { status: 400 });
    if (!email) return new Response(JSON.stringify({ message: "Email is required" }), { status: 400 });
    if (!password) return new Response(JSON.stringify({ message: "Password is required" }), { status: 400 });
    if (!phone) return new Response(JSON.stringify({ message: "Phone number is required" }), { status: 400 });

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return new Response(JSON.stringify({ success: false, message: "Already registered, please login" }), { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    // Load default profile picture from file
    const imagePath = path.join(process.cwd(), "public", "default-profile.jpg");
    const defaultImage = fs.readFileSync(imagePath);

    const newUser = await new userModel({
      FirstName,
      LastName,
      email,
      phone,
      password: hashedPassword,
      profilePicture: {
        data: defaultImage,
        contentType: "image/jpeg",
      },
    }).save();

    return new Response(
      JSON.stringify({ success: true, message: "User registered successfully!", user: publicUser(newUser) }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in registration:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error in registration", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};



  //login controller

  export const loginController = async (req) => {
    try {
      console.log("Login API called");
  
      const { email, password } = await req.json();
  
      // Validation
      if (!email || !password) {
        return new Response(JSON.stringify({ success: false, message: "Invalid email or password" }), { status: 400 });
      }
  
      // Check if user exists
      const user = await userModel.findOne({ email });
      if (!user) {
        return new Response(JSON.stringify({ success: false, message: "Not a valid account" }), { status: 404 });
      }
  
      // Compare passwords
      const match = await comparePassword(password, user.password);
      if (!match) {
        return new Response(JSON.stringify({ success: false, message: "Invalid password" }), { status: 401 });
      }
  
      // Generate JWT token
      const token = await JWT.sign({ _id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
      return new Response(
        JSON.stringify({
          success: true,
          message: "Login successful",
          user: publicUser(user),
          token,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Error in login:", error);
      return new Response(
        JSON.stringify({ success: false, message: "Error in login", error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  };

  

  //reset password controller
  export const ResetPasswordController = async (req) => {
    try {
      const { password, token, email } = await req.json();

      if (typeof email !== "string" || !email || !token || !password) {
        return new Response(
          JSON.stringify({ success: false, message: "All fields are required." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const user = await userModel.findOne({ email });
      const resetCode = user
        ? await resetTokenModel.findOne({ user_id: user._id.toString() }).sort({ createdAt: -1 })
        : null;

      // Count the attempt before checking the code, so parallel guesses can't get past the limit.
      // Expired codes and locked codes (5 wrong attempts) never match.
      const attempt = resetCode
        ? await resetTokenModel.findOneAndUpdate(
            { _id: resetCode._id, expiresAt: { $gt: new Date() }, attempts: { $lt: MAX_RESET_ATTEMPTS } },
            { $inc: { attempts: 1 } },
            { new: true }
          )
        : null;

      // Always run one bcrypt comparison, so the response time doesn't reveal whether a code exists
      const match = await comparePassword(String(token), attempt ? attempt.token : await getDummyCodeHash());

      // Unknown email, missing, expired, locked or wrong code: all get the same answer
      if (!attempt || !match) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Invalid or expired code. After 5 wrong attempts, wait 15 minutes and request a new code.",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Codes are single use
      await resetTokenModel.deleteMany({ user_id: user._id.toString() });

      user.password = await hashPassword(password);
      await user.save();

      return new Response(
        JSON.stringify({ success: true, message: "Password reset successfully." }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err) {
      console.error("Reset Password Error:", err);
      return new Response(
        JSON.stringify({ success: false, message: "Internal Server Error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  };

  // UPDATE PROFILE CONTROLLER
  export const UpdateProfileController = async (req) => {
    try {
      const { FirstName, LastName, OldPassword, NewPassword, RepeatNewPassword, email, phone } = await req.json();
      const user = await userModel.findById(req.user._id);
  
      if (!user) return { success: false, message: "User not found", status: 404 };
      if (!OldPassword) return { success: false, message: "Current password is required", status: 400 };
  
      const match = await comparePassword(OldPassword, user.password);
      if (!match) return { success: false, message: "Invalid current password", status: 400 };
  
      if (NewPassword && NewPassword.length < 6) {
        return { success: false, message: "New password must be at least 6 characters", status: 400 };
      }
  
      if (NewPassword && NewPassword !== RepeatNewPassword) {
        return { success: false, message: "New passwords do not match", status: 400 };
      }
  
      const hashedPassword = NewPassword ? await hashPassword(NewPassword) : undefined;
      await userModel.findByIdAndUpdate(req.user._id, {
        FirstName: FirstName || user.FirstName,
        LastName: LastName || user.LastName,
        password: hashedPassword || user.password,
        email: email || user.email,
        phone: phone || user.phone,
      });
  
      return { success: true, message: "Profile Updated" };
  
    } catch (err) {
      console.error(err);
      return { success: false, message: "Server Error", status: 500 };
    }
  };

  //update-profile controller
  export const updateProfileController = async (req, userId) => {
    try {
      const formData = await req.formData();

      const FirstName = formData.get("FirstName");
      const LastName = formData.get("LastName");
      const file = formData.get("profilePicture"); // type: File

      const user = await userModel.findById(userId);
      if (!user) {
        return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
      }

      user.FirstName = FirstName || user.FirstName;
      user.LastName = LastName || user.LastName;

      if (file && file.name !== "undefined") {
        const buffer = Buffer.from(await file.arrayBuffer());
        user.profilePicture = {
          data: buffer,
          contentType: file.type,
        };
      }

      await user.save();

      return new Response(JSON.stringify({ success: true, message: "Profile updated", user: publicUser(user) }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      return new Response(JSON.stringify({ success: false, message: "Error updating profile", error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  };

  //change password controller
  export const changePasswordController = async (request, userId) => {
    try {
      console.log("Change Password API called");
  
      const body = await request.json(); // ✅ Fix is here
      const { currentPassword, newPassword } = body;

      if (!currentPassword || !newPassword) {
        return new Response(
          JSON.stringify({ success: false, message: "All fields are required" }),
          { status: 400 }
        );
      }
  
      const user = await userModel.findById(userId);
  
      if (!user) {
        return new Response(
          JSON.stringify({ success: false, message: "User not found" }),
          { status: 404 }
        );
      }
  
      const isMatch = await comparePassword(currentPassword, user.password);
      if (!isMatch) {
        return new Response(
          JSON.stringify({ success: false, message: "Incorrect current password" }),
          { status: 401 }
        );
      }
  
      const hashed = await hashPassword(newPassword);
      user.password = hashed;
      await user.save();
  
      return new Response(
        JSON.stringify({ success: true, message: "Password changed successfully" }),
        { status: 200 }
      );
    } catch (error) {
      console.error("Error in change password:", error);
      return new Response(
        JSON.stringify({ success: false, message: "Failed to change password", error: error.message }),
        { status: 500 }
      );
    }
  };

  //resetToken controller

// Stores a new hashed reset code for the user and emails them the plain code
const issueResetCode = async (user, code, codeHash) => {
  const userId = user._id.toString();
  const current = await resetTokenModel.findOne({ user_id: userId }).sort({ createdAt: -1 });
  const active = current && current.expiresAt > new Date();

  // A locked code (5 wrong attempts) blocks new codes until it expires
  if (active && current.attempts >= MAX_RESET_ATTEMPTS) return;

  await resetTokenModel.deleteMany({ user_id: userId });
  await resetTokenModel.create({
    token: codeHash,
    user_id: userId,
    expiresAt: new Date(Date.now() + RESET_CODE_TTL_MS),
    // wrong attempts carry over, so asking for a new code doesn't reset the limit
    attempts: active ? current.attempts : 0,
  });

  await sendEmail({
    email: user.email,
    subject: "Your IntelliDatum password reset code",
    message: mailTemplate(
      `Your password reset code is <b style="font-size: 22px; letter-spacing: 4px;">${code}</b><br/><br/>` +
      "It expires in 15 minutes and can only be used once. If you didn't ask to reset your password, you can ignore this email."
    ),
  });
};

export const createResetTokenController = async (req) => {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ success: false, message: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 6-digit code from a cryptographically secure generator; only its hash is stored
    const code = crypto.randomInt(0, 1000000).toString().padStart(6, "0");
    const codeHash = await hashPassword(code);

    const user = await userModel.findOne({ email });
    if (user) {
      // Not awaited: the response must look and take the same time whether or not the account exists
      issueResetCode(user, code, codeHash).catch((error) =>
        console.error("Failed to issue reset code:", error.message)
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "If an account exists for that email, we've sent it a 6-digit reset code. It expires in 15 minutes.",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Reset token error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

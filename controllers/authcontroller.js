import { comparePassword, hashPassword } from "../helpers/authhelper.js";
import userModel from "../models/usermodel.js";
import resetToken from "../models/resetTokenModel.js";
import JWT from 'jsonwebtoken'
import resetTokenModel from "../models/resetTokenModel.js";
import { sendEmail,mailTemplate } from "../helpers/email.js";
const NumSaltRounds = Number(process.env.NO_OF_SALT_ROUNDS);
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import {toast} from "react-hot-toast";
import path from "path";
import fs from "fs";


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
    const imagePath = path.join(process.cwd(), "public", "images", "default-profile.jpg");
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
      JSON.stringify({ success: true, message: "User registered successfully!", user: newUser }),
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



  export const registerAdminController = async (req) => {
    try {
      console.log("Register Admin API called");
  
      const { FirstName, LastName, email, password, phone, role } = await req.json();
  
      // Validation checks
      if (!FirstName) return new Response(JSON.stringify({ message: "First name is required" }), { status: 400 });
      if (!LastName) return new Response(JSON.stringify({ message: "Last name is required" }), { status: 400 });
      if (!email) return new Response(JSON.stringify({ message: "Email is required" }), { status: 400 });
      if (!password) return new Response(JSON.stringify({ message: "Password is required" }), { status: 400 });
      if (!phone) return new Response(JSON.stringify({ message: "Phone number is required" }), { status: 400 });
  
      // Check if admin already exists
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return new Response(JSON.stringify({ success: false, message: "Already registered, please login" }), { status: 409 });
      }
  
      // Hash the password
      const hashedPassword = await hashPassword(password);
  
      // Register admin
      const newAdmin = await new userModel({ FirstName, LastName, email, phone, password: hashedPassword, role }).save();
  
      return new Response(
        JSON.stringify({ success: true, message: "Admin registered successfully!", user: newAdmin }),
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
      console.log("user login: ", user )
      return new Response(
        JSON.stringify({
          success: true,
          message: "Login successful",
          user: {
            FirstName: user.FirstName,
            LastName: user.LastName,
            email: user.email,
            phone: user.phone,
            role: user.role,
          },
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

  

//forgot Password controller

export const ForgotPasswordController = async (req, res) => {
    try {
      const email = req.body.email;
      const user = await userModel.findOne({email})

      if (!user ) {
        toast.error("not registered")
        res.json({
          success: false,
          message: "Your are not registered!",
        });
      } else {
        const token = crypto.randomBytes(20).toString("hex");
        const resetToken = crypto
          .createHash("sha256")
          .update(token)
          .digest("hex");
        //await db.update_forgot_password_token(user[0].id, resetToken);   
        const CreatedAt = new Date().toISOString();
        const ExpiresAt = new Date(Date.now() + 60 * 60 * 24 * 1000).toISOString();
        await resetTokenModel.insertMany([{
            token:resetToken,
            createdAt:CreatedAt,
            expiresAt:ExpiresAt,
            user_id:user.id
        }])

        const mailOption = {
          email: email,
          subject: "Forgot Password Link",
          message: mailTemplate(
            "We have received a request to reset your password. Please reset your password using the link below.", 
            `/ResetPassword?id=${user.id}&token=${resetToken}`,
            "Reset Password"
          ),
        };
        await sendEmail(mailOption);
        toast.success("A password reset link has been sent to your email.")
        res.json({
          success: true,
          message: "A password reset link has been sent to your email.",
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  //reset password controller
  export const ResetPasswordController = async (req) => {
    try {
      const { password, token, email } = await req.json();
  
      if (!email || !token || !password) {
        return new Response(
          JSON.stringify({ success: false, message: "All fields are required." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
  
      const user = await userModel.findOne({ email });
      if (!user) {
        return new Response(
          JSON.stringify({ success: false, message: "User not found." }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
  
      const userToken = await resetTokenModel.findOne({ user_id: user._id.toString() })
        .sort({ createdAt: -1 })
        .limit(1);
  
      if (!userToken) {
        return new Response(
          JSON.stringify({ success: false, message: "No valid reset token found." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
  
      if (new Date() > new Date(userToken.expiresAt)) {
        return new Response(
          JSON.stringify({ success: false, message: "Reset token has expired." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
  
      if (userToken.token !== token) {
        return new Response(
          JSON.stringify({ success: false, message: "Invalid reset token." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
  
      // Delete all reset tokens for the user
      await resetTokenModel.deleteMany({ user_id: user._id.toString() });
  
      // Hash and update password
      const hashedPassword = await bcrypt.hash(password, 10);
      await userModel.findByIdAndUpdate(user._id, { password: hashedPassword });
  
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
  export const updateProfileController = async (req) => {
    try {
      const formData = await req.formData();
  
      const email = formData.get("email");
      const FirstName = formData.get("FirstName");
      const LastName = formData.get("LastName");
      const file = formData.get("profilePicture"); // type: File
  
      if (!email) {
        return new Response(JSON.stringify({ message: "Email is required" }), { status: 400 });
      }
  
      const user = await userModel.findOne({ email });
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
  
      return new Response(JSON.stringify({ success: true, message: "Profile updated", user }), {
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
  export const changePasswordController = async (request) => {
    try {
      console.log("Change Password API called");
  
      const body = await request.json(); // ✅ Fix is here
      const { email, currentPassword, newPassword } = body;
  
      if (!email || !currentPassword || !newPassword) {
        return new Response(
          JSON.stringify({ success: false, message: "All fields are required" }),
          { status: 400 }
        );
      }
  
      const user = await userModel.findOne({ email });
  
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
  
export const createResetTokenController = async (req) => {
  try {
    const { email, token } = await req.json();

    if (!email || !token) {
      return new Response(
        JSON.stringify({ success: false, message: "Email and token are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, message: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Remove existing tokens
    await resetToken.deleteMany({ user_id: user._id.toString() });

    const now = new Date();
    const expiry = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now

    const newToken = new resetToken({
      token,
      createdAt: now,
      expiresAt: expiry,
      user_id: user._id.toString(),
    });

    await newToken.save();

    return new Response(
      JSON.stringify({ success: true, message: "Reset token created successfully." }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Reset token error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
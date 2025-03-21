import { comparePassword, hashPassword } from "../helpers/authhelper.js";
import userModel from "../models/usermodel.js";
import JWT from 'jsonwebtoken'
import resetTokenModel from "../models/resetTokenModel.js";
import { sendEmail,mailTemplate } from "../helpers/email.js";
const NumSaltRounds = Number(process.env.NO_OF_SALT_ROUNDS);
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import {toast} from "react-hot-toast";

//register controller
export const registerController = async (req) => {
    try {
      console.log("Register API called");
  
      // Parse request body
      const { FirstName, LastName, email, password, phone } = await req.json();
  
      // Validation checks
      if (!FirstName) return new Response(JSON.stringify({ message: "First name is required" }), { status: 400 });
      if (!LastName) return new Response(JSON.stringify({ message: "Last name is required" }), { status: 400 });
      if (!email) return new Response(JSON.stringify({ message: "Email is required" }), { status: 400 });
      if (!password) return new Response(JSON.stringify({ message: "Password is required" }), { status: 400 });
      if (!phone) return new Response(JSON.stringify({ message: "Phone number is required" }), { status: 400 });
      console.log(FirstName)
      // Check if user already exists
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return new Response(JSON.stringify({ success: false, message: "Already registered, please login" }), { status: 409 });
      }
  
      // Hash the password
      const hashedPassword = await hashPassword(password);
  
      // Register user
      const newUser = await new userModel({ FirstName, LastName, email, phone, password: hashedPassword }).save();
  
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
      const { password, token, userId } = await req.json();
      const userToken = await resetTokenModel.findOne({ user_id: userId })
        .sort({ createdAt: -1 })
        .limit(1);
  
      if (!userToken) {
        return new Response(
          JSON.stringify({ success: false, message: "Some problem occurred!" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
  
      if (new Date() > new Date(userToken.expires_at)) {
        return new Response(
          JSON.stringify({ success: false, message: "Reset Password link has expired!" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
  
      if (userToken.token !== token) {
        return new Response(
          JSON.stringify({ success: false, message: "Reset Password link is invalid!" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
  
      await resetTokenModel.deleteMany({ user_id: userId });
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await userModel.findByIdAndUpdate(userId, { password: hashedPassword });
  
      return new Response(
        JSON.stringify({ success: true, message: "Your password was reset successfully!" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (err) {
      console.error(err);
      return new Response(
        JSON.stringify({ success: false, message: "Internal Server Error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
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
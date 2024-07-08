import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import cookieParser from "cookie-parser";

import User from "../Models/userModel.js";

import sendEmail from "../utlies/sendEmail.js";

//  for user register
const userRegister = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ mes: "User already exists" });
    }

    user = new User({
      name,
      email,
      password,
      verificationToken: crypto.randomBytes(20).toString("hex"),
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const verificationUrl = `http://localhost:5173/verify/${user.verificationToken}`;
    await sendEmail(
      email,
      "Verify your email",
      `please verify your email by clicking the following link:${verificationUrl}`
    );
    res.status(201).json({ msg: "User registered. Please verify your email." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  for email verification
const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });

    if (!user) {
      return res.status(400).json({ msg: "Invalid Token" });
    }
    user.isVerified = true;
    await user.save();

    setTimeout(async () => {
      user.verificationToken = undefined;
      await user.save();
    }, 3000);

    res.status(200).json({ msg: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Failed to verify email" });
  }
};

// for chaging password

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User does not find" });
    }
    user.resetPasswordToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${user.resetPasswordToken}`;
    await sendEmail(
      email,
      "Password Reset",
      `Please reset your password by clicking the following link: ${resetUrl}`
    );
    res.status(200).json({ msg: "Password reset link sent to email" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// for add new password

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ msg: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// user login
const userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }
    if (!user.isVerified) {
      return res.status(400).json({ msg: "Please verify your email to login" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "invalid credentials" });
    }
    const payload = {
      userId: user._id,
    };
    const token = jwt.sign(payload, process.env.KEY, { expiresIn: "1h" });

    res.cookie("token", token, { httpOnly: true });
    return res.json({
      status: true,
      msg: "login successfully",
      token: token,
      user: user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// for user authenting form home page

const authentication = async (req, res) => {
  const { userId } = req;

  try {
    const user = await User.findOne({ _id: userId });
    console.log("dsdasd", user);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      authenticated: true,
      userId: userId,
      userData: user,
      id: user._id,
    });
  } catch (err) {
    console.error("Error in authentication:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
// for logout
const logOut = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

export {
  userRegister,
  verifyEmail,
  forgotPassword,
  resetPassword,
  userLogin,
  authentication,
  logOut,
};

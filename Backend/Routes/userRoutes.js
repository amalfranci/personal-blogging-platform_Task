import express from "express";
import authMiddleware from "../Middleware/userAuth.js";

import {
  authentication,
  forgotPassword,
  logOut,
  resetPassword,
  userLogin,
  userRegister,
  verifyEmail,
} from "../Controllers/userController.js";
import {
  createPost,
  deletePost,
  getPosts,
  updatePost,
} from "../Controllers/blogController.js";

const router = express.Router();

router.post("/register", userRegister);
router.get("/verify/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/login", userLogin);

router.post("/create", authMiddleware, createPost);
router.get("/", getPosts);
router.put("/update/:id", authMiddleware, updatePost);
router.delete("/delete/:id", authMiddleware, deletePost);

router.get("/check-auth", authMiddleware, authentication);
router.post("/logout", logOut);

export default router;

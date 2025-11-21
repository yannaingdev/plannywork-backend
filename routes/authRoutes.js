import {
  register,
  login,
  updateUser,
  listUsers,
  getCurrentUser,
} from "../controllers/authController.js";
import authenticateUser from "../middleware/authenticateUser.js";
import express from "express";
const router = express.Router();

/* all the route after the path "/api/v1/auth" will be handled by router */
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/updateUser").patch(authenticateUser, updateUser);
router.route("/listusers").get(authenticateUser, listUsers);
router.route("/getCurrentUser").get(authenticateUser, getCurrentUser);

export default router;

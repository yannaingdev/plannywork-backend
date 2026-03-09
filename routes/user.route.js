import express from "express";
import { getUserJobs } from "../controllers/jobController.js";
import { updateUser, listUsers } from "../controllers/authController.js";
import verifySession from "../middleware/verifySession.js";
const router = express.Router();

router.route("/updateUser").patch(verifySession, updateUser);
router.route("/listusers").get(verifySession, listUsers);

export default router;

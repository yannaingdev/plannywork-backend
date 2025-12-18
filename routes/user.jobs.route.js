import express from "express";
import { getUserJobs } from "../controllers/jobController.js";
const router = express.Router();

router.route("/user").get(getUserJobs);

export default router;

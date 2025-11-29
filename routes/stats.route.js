import express from "express";
const router = express.Router();
import { showStats } from "../controllers/jobController.js";

router.route("/").get(showStats);
export default router;

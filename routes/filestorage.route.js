import express from "express";
import { generateUploadUrls } from "../controllers/fileController.js";
const router = express.Router();

router.route("/:jobId").post(generateUploadUrls);

export default router;

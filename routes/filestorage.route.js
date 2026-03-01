import express from "express";
import {
  generateDownloadUrl,
  generateUploadUrls,
  updateFileStatus,
} from "../controllers/fileController.js";
const router = express.Router();

router.route("/:jobId").post(generateUploadUrls);
router.route("/:jobId").get(generateDownloadUrl);
router.route("/:fileId/status").patch(updateFileStatus);

export default router;

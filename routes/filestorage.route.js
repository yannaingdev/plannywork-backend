import express from "express";
import {
  generateDownloadUrl,
  generateUploadUrls,
  updateFileStatus,
} from "../controllers/fileController.js";
const router = express.Router();

// to-do: migrate to use this controller to generate uploadUrls
// router.route("/:jobId").post(generateUploadUrls);
router.route("/:fileId").post(generateDownloadUrl);
router.route("/:fileId/status").patch(updateFileStatus);

export default router;

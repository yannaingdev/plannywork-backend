import express from "express";
const router = express.Router();
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";
import {
  saveJobDraft,
  submitJob,
  deleteJob,
  getAllJobs,
  updateJob,
  getJobDetail,
} from "../controllers/jobController.js";
import { generateUploadUrls } from "../controllers/fileController.js";
import multer from "multer";
const __dirname = dirname(fileURLToPath(import.meta.url));
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // have to adjust for vite config
    // cb(null, path.resolve(__dirname, "../client/public/uploads"));
    cb(null, path.resolve(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "--" + file.originalname);
  },
});
let upload = multer({
  storage: storage,
  limits: { fileSize: 3000000 },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.includes("jpeg") ||
    file.mimetype.includes("png") ||
    file.mimetype.includes("jpg")
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

router.route("/draft").post(upload.none(), saveJobDraft);
router.route("/:jobId/intents").post(generateUploadUrls);
router.route("/:id/submit").post(submitJob);
router.route("/").get(getAllJobs);
router.route("/:id").get(getJobDetail);
router.route("/:id").patch(upload.single("attachedFile"), updateJob);
/* refactor into main and sub-path for sending user jobs and supervisor job */
router.route("/:id").delete(deleteJob);
export default router;

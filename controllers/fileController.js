import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { S3Client } from "@aws-sdk/client-s3";
import { canDeleteFile, canReadFile } from "../utils/filePermissions.js";
import Job from "../model/Job.js";
import File from "../model/File.js";
import { canTransition } from "../utils/canTransition.js";
import getUserSession from "../utils/getUserSession.js";
/* console.log({
  key: process.env.AWS_ACCESS_KEY_ID,
  secret: process.env.AWS_SECRET_ACCESS_KEY?.slice(0, 4),
}); */
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});
export const generateUploadUrls = async (req, res, next) => {
  const { jobId } = req.params;
  const files = req.body;
  const job = await Job.findById({ _id: jobId });
  if (!job) {
    return res.status(404).json({ message: "job not found" });
  }
  const userId = await getUserSession(req);
  // const userIdFormatted = userId.toString;
  /*   if (canTransition(job.status, "UPLOADING")) {
    job.status = "UPLOADING";
    await job.save();
  } */
  const uploadUrls = await Promise.all(
    files.map(async (file) => {
      const key = `uploads/${uuidv4()}`;
      const record = await File.create({
        ownerId: userId,
        jobId: jobId,
        bucket: process.env.S3_BUCKET,
        s3Key: key,
        mimeType: file.type,
        size: file.size,
        originalName: file.name,
        status: "PENDING",
      });
      const command = new PutObjectCommand({
        Bucket: record.bucket,
        Key: record.s3Key,
        // ContentType: record.mimeType,
        // ChecksumAlgorithm: undefined,
        // SDKChecksumAlgorithm: undefined,
      });
      const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
      return {
        fileId: record._id,
        signedUrl,
        s3Key: record.s3Key,
      };
    }),
  );
  res.status(200).json(uploadUrls);
};
export const generateDownloadUrl = async (req, res, next) => {
  const requestedFile = req.params.fileId;
  const file = await File.findById({ _id: requestedFile });
  if (!file) return res.status(404).json({ message: "file not found" });
  if (file.status !== "UPLOADED")
    return res.status(400).json({ message: "file not ready" });
  /* get user from session */
  if (!canReadFile(user, file)) {
    return res.status(403).json({ message: "permission not allowed" });
  }
  const command = new GetObjectCommand({
    Bucket: file.bucket,
    Key: file.s3Key,
  });
  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 400 });
  res.json({ signedUrl });
};
export const fileDelete = async (req, res, next) => {
  const requestedFile = req.params.fileId;
  const file = await File.findById({ _id: requestedFile });
  if (!file) return res.status(404).json({ message: "file not found" });
  /* get user from session */
  if (!canDeleteFile(user, file)) {
    return res.status(403).json({ message: "permission not allowed" });
  }
  const command = new DeleteObjectCommand({
    Bucket: file.bucket,
    Key: file.s3Key,
  });
  await s3.send(command);
  await file.deleteOne();
  res.status(204).json({ message: "file deleted" });
};
export const updateFileStatus = async (req, res, next) => {
  const { fileId } = req.params;
  const updateFields = req.body;
  console.log(fileId, updateFields);
  const fileFound = await File.findOne({ _id: fileId });
  if (!fileFound) {
    return res.status(404).json({ message: "file not found" });
  }
  await Job.findByIdAndUpdate(fileFound.jobId, {
    $inc: { attachementCount: 1 },
  });
  Object.assign(fileFound, updateFields);
  await fileFound.save();
  res.sendStatus(204);
};

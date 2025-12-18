import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
const { v4: uuidv4 } = require("uuid");
import { S3Client } from "@aws-sdk/client-s3";
import { canDeleteFile, canReadFile } from "../utils/filePermissions";
const s3 = new S3Client({ region: process.env.AWS_REGION });

const File = require("../model/File");
export const fileUpload = async (req, res, next) => {
  const { mimeType, visibility = "private" } = req.body;
  const { jobId } = req.params;
  const key = `uploads/${uuidv4()}`;
  const file = await File.create({
    ownerId: userId,
    jobId: jobId,
    bucket: process.env.S3_BUCKET,
    s3Key: key,
    mimeType,
    visibility,
  });
  const command = new PutObjectCommand({
    Bucket: file.bucket,
    Key: file.s3Key,
    ContentType: mimeType,
  });
  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 120 });
  res.json({
    fileId: file._id,
    signedUrl,
  });
};
export const fileDownload = async (req, res, next) => {
  const requestedFile = req.params.fileId;
  const file = await File.findById({ _id: requestedFile });
  if (!file) return res.status(404).json({ message: "file not found" });
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

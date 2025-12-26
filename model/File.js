import mongoose from "mongoose";

const FileSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobId: {
      type: mongoose.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    s3Key: {
      type: String,
      required: true,
      unique: true,
    },
    originalName: { type: String },
    bucket: { type: String },
    mimeType: { type: String },
    size: { type: Number },
    visibility: {
      type: String,
      enum: ["PRIVATE", "PUBLIC"],
      default: "PRIVATE",
    },
    status: {
      type: String,
      enum: ["PENDING", "UPLOADING", "UPLOADED", "FAILED"],
      default: "PENDING",
    },
    statusUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("File", FileSchema);

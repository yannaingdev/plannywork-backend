import mongoose from "mongoose";

const JobAssignmentSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    assigneeId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assignedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "DECLINED", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    acceptedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

JobAssignmentSchema.index({ jobId: 1, assigneeId: 1 }, { unique: true });

export default mongoose.model("JobAssignment", JobAssignmentSchema);

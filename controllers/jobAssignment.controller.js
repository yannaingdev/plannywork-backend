import mongoose from "mongoose";
import Job from "../model/Job.js";
import User from "../model/User.js";
import JobAssignment from "../model/JobAssignment.js";
import { BadRequestError, NotFoundError } from "../errors/ErrorIndex.js";
import getUserSession from "../utils/getUserSession.js";

const validateObjectId = (value, label) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new BadRequestError(`${label} is invalid`);
  }
};

const shapeAssignment = (doc) => {
  const obj = doc.toJSON ? doc.toJSON() : doc;
  return {
    id: obj._id?.toString(),
    jobId: obj.jobId?.toString(),
    assigneeId: obj.assigneeId?.toString(),
    assignedBy: obj.assignedBy?.toString(),
    status: obj.status,
    note: obj.note,
    acceptedAt: obj.acceptedAt,
    completedAt: obj.completedAt,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
};

export const assignJob = async (req, res, next) => {
  const { jobId, assigneeId, note } = req.body;
  try {
    validateObjectId(jobId, "jobId");
    validateObjectId(assigneeId, "assigneeId");
  } catch (err) {
    return next(err);
  }
  let assignedBy;
  try {
    assignedBy = await getUserSession(req);
  } catch (error) {
    return next(error);
  }

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      throw new NotFoundError("Job not found");
    }
    const user = await User.findById(assigneeId);
    if (!user) {
      throw new NotFoundError("Assignee not found");
    }
    const assignment = await JobAssignment.findOneAndUpdate(
      { jobId, assigneeId },
      {
        $setOnInsert: { jobId, assigneeId, assignedBy },
        $set: { note },
      },
      { new: true, upsert: true }
    );
    res.status(201).json({ assignment: shapeAssignment(assignment) });
  } catch (error) {
    next(error);
  }
};

export const listAssignments = async (req, res, next) => {
  const { jobId, assigneeId, status, page = 1, limit = 20 } = req.query;
  const query = {};
  try {
    if (jobId) {
      validateObjectId(jobId, "jobId");
      query.jobId = jobId;
    }
    if (assigneeId) {
      validateObjectId(assigneeId, "assigneeId");
      query.assigneeId = assigneeId;
    }
  } catch (err) {
    return next(err);
  }
  if (status) query.status = status;
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  try {
    const assignments = await JobAssignment.find(query)
      .sort("-createdAt")
      .skip(skip)
      .limit(limitNum);
    const total = await JobAssignment.countDocuments(query);
    res.status(200).json({
      assignments: assignments.map(shapeAssignment),
      total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAssignmentStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    validateObjectId(id, "assignment id");
  } catch (err) {
    return next(err);
  }
  if (!status) {
    return next(new BadRequestError("status is required"));
  }
  try {
    const assignment = await JobAssignment.findById(id);
    if (!assignment) {
      throw new NotFoundError("Assignment not found");
    }
    assignment.status = status;
    if (status === "ACCEPTED") assignment.acceptedAt = new Date();
    if (status === "COMPLETED") assignment.completedAt = new Date();
    await assignment.save();
    res.status(200).json({ assignment: shapeAssignment(assignment) });
  } catch (error) {
    next(error);
  }
};

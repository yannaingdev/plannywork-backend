import express from "express";
import {
  assignJob,
  listAssignments,
  updateAssignmentStatus,
} from "../controllers/jobAssignment.controller.js";

const jobAssignmentRouter = express.Router();

jobAssignmentRouter.route("/").post(assignJob).get(listAssignments);
jobAssignmentRouter.route("/:id/status").patch(updateAssignmentStatus);

export default jobAssignmentRouter;

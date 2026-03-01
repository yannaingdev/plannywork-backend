import verifySession from "./middleware/verifySession.js";
import jobAssignmentRouter from "./routes/jobAssignment.route.js";

const mountJobAssignmentFeature = (
  app,
  { basePath = "/api/v1/job-assignments", requireSession = true } = {}
) => {
  if (!app || typeof app.use !== "function") {
    throw new Error("An express app instance is required to mount routes");
  }
  if (requireSession) {
    app.use(basePath, verifySession, jobAssignmentRouter);
    return;
  }
  app.use(basePath, jobAssignmentRouter);
};

export default mountJobAssignmentFeature;

import verifySession from "./middleware/verifySession.js";
import keyAccountRouter from "./routes/keyAccount.route.js";

const mountKeyAccountFeature = (
  app,
  { basePath = "/api/v1/key-accounts", requireSession = true } = {}
) => {
  if (!app || typeof app.use !== "function") {
    throw new Error("An express app instance is required to mount routes");
  }
  if (requireSession) {
    app.use(basePath, verifySession, keyAccountRouter);
    return;
  }
  app.use(basePath, keyAccountRouter);
};

export default mountKeyAccountFeature;

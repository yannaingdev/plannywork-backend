import { UnAuthorizedRequest } from "../errors/ErrorIndex.js";

const verifySession = async (req, res, next) => {
  const sessionId = req.session?.user?.email;
  if (!sessionId) {
    const error = new UnAuthorizedRequest("invalid request");
    return next(error);
  }
  next();
};
export default verifySession;

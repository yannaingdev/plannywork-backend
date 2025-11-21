import { UnAuthorizedRequest } from "../errors/ErrorIndex.js";

const checkAuthorization = (requestUser, resourceUserId) => {
  if (requestUser.userId === resourceUserId.toString()) return;

  throw new UnAuthorizedRequest("Not authorized for request");
};

export default checkAuthorization;

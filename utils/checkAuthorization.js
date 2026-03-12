import { UnAuthorizedRequest } from "../errors/ErrorIndex.js";

const checkAuthorization = (requestUser, resourceUserId) => {
  if (requestUser._id.toString() === resourceUserId.toString()) return;
  // or use method .equals -< resourceUserId.equals(requestUser._id)

  throw new UnAuthorizedRequest("Not authorized for request");
};

export default checkAuthorization;

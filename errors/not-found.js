import CustomAPIError from "./custom-api.js";
import { StatusCodes } from "http-status-codes";

class NotFoundError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.StatusCodes = StatusCodes.NOT_FOUND; //StatusCodes should be statusCode for consistency.
  }
}

export default NotFoundError;

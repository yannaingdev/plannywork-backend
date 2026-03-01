import mongoose from "mongoose";
export function assertObjectId(value, label = "id") {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    const err = new Error(`${label} is invalid`);
    err.statusCode = 400;
    throw err;
  }
}

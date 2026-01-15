export default function createQueryObject(user, status, jobType, sort) {
  const query = { createdBy: user._id };
  //   const normalized
  return {
    createdBy: user._id,
    status: status?.trim() || "all",
    jobType: jobType?.trim() || "all",
    sort: sort?.trim() || "latest",
  };
}

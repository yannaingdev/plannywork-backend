import User from "../model/User.js";
const getUserSession = async (req) => {
  const userEmail = req.session?.user?.email;
  if (!userEmail) {
    const err = new Error("User not Authenicated");
    err.status = 401;
    throw err;
  }
  const user = await User.findOne({ email: userEmail }).lean().exec();
  if (!user) {
    const err = new Error("User not found");
    err.status = 401;
    throw err;
  }
  return user._id;
};
export default getUserSession;

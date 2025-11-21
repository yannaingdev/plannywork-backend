import User from "../model/User.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, UnAuthorizedRequest } from "../errors/ErrorIndex.js";
import autoCatch from "../utils/autoCatch.js";
import bcrypt from "bcryptjs";

const register = async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    const error = new BadRequestError("Please provide all the fields");
    return next(error);
  }
  try {
    const existingUser = await User.findOne({ email }).lean().exec();
    if (existingUser) {
      return res.status(409).json({ message: "duplicate username" });
    }
    const hashedPwd = await bcrypt.hash(password, 10);
    const userObject = { name: name, email: email, password: hashedPwd };
    const user = await User.create(userObject);
    if (user) {
      res.status(200).json({ message: `new user ${name} is created` });
    } else {
      throw new Error("user could not be created");
    }
  } catch (error) {
    next(error);
  }
};
const login = async (req, res, next) => {
  const { email, password } = req.body;
  console.log(password);
  if (!email || !password) {
    const error = new UnAuthorizedRequest("Plese provide all fields..");
    return next(error);
  }
  try {
    const user = await User.findOne({ email }).select("+password");
    console.log(user);
    if (!user) {
      const error = new UnAuthorizedRequest("Invalid Login Request.");
      return next(error);
    }
    /* comparePassword function of user object returned from User model 
       is invoked and validate password provided 
    */
    const isPasswordCorrect = await user.comparePassword(password);
    console.log(isPasswordCorrect);
    if (isPasswordCorrect === true) {
      // const token = user.createJWT();
      user.password = undefined;
      req.session.user = {
        email,
        isLoggedIn: true,
        id: user._id,
      };
      try {
        await req.session.save();
      } catch (error) {
        next(error);
      }
      res.status(200).json({ user, location: user.location, role: user.role });
    } else {
      throw new Error("Invalid Login.");
    }
  } catch (error) {
    next(error);
  }
};
const getCurrentUser = async (req, res, next) => {
  const user = await User.findOne({ _id: req.user.userId });
  res
    .status(StatusCodes.OK)
    .json({ user, role: user.role, location: user.location });
};
const updateUser = async (req, res, next) => {
  const { email, name, lastName, location } = req.body;
  console.log({ UpdateUserEmail: email });
  if (!email || !name || !lastName || !location) {
    const error = new BadRequestError("Please provide all the fields");
    return next(error);
  }
  try {
    // findOneAndUpdate would also simly do the job..
    const user = await User.findOne({ _id: req.user.userId });
    console.log(user);
    user.email = email;
    user.name = name;
    user.lastName = lastName;
    user.location = location;
    /* Mongodb Pre Save hooks will run here */
    await user.save();
    /* creating a new token for update user info is optional..
    Have removed new token creation and re-sending token via res.status */
    res.status(StatusCodes.OK).json({ user, location: user.location });
  } catch (error) {
    next(error);
  }
};
const listUsers = async (req, res, next) => {
  const { role } = req.body;
  if (!role && !role == "supervisor") {
    const error = new BadRequestError("Invalid Request");
    next(error);
    return;
  }
  try {
    const users = await User.find({ role: "user" });
    res.status(StatusCodes.OK).json({ userRoles: users });
  } catch (error) {
    next(error);
    return;
  }
};
export { register, login, updateUser, listUsers, getCurrentUser };

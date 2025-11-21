import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide name"],
    minlength: 3,
    maxlenght: 21,
    trim: true,
  },
  lastName: {
    type: String,
    maxlenght: 21,
    trim: true,
    default: "lastName",
  },
  email: {
    type: String,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw Error("Invalid Email");
      }
    },

    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: 8,
    select: false,
  },
  location: {
    type: String,
    maxlenght: 21,
    trim: true,
    default: "Yangon",
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "supervisor", "admin"], //pitfall: the user can assume only one role a time
  },
});

/* mongoDB pre save Hooks to pre-validate if the password field is being modified */
/* UserSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
}); */

/* Use MongoDB instance methods schema.methods.customfunction create JWT 
   Alternatively: handle this logic in function(login) in authController 
*/
UserSchema.methods.createJWT = function () {
  return jwt.sign({ userId: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
    // expiresIn: "100",
  });
};

// Use MongoDB instance methods schema.methods.customfunction comparePassword to validate password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};
export default mongoose.model("User", UserSchema);

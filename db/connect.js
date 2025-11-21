import mongoose from "mongoose";
// use PlannyWork-Testing with atlas
const connectDB = (url) => {
  mongoose.set("maxTimeMS", 2000);
  return mongoose.connect(url, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 2000,
    dbName: "plannywork",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

export default connectDB;

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import "express-async-errors";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import connectDB from "./db/connect.js";
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import errorHandlerMiddleware from "./middleware/errorHandlerMiddleware.js";
import notFoundMiddleware from "./middleware/notFoundMiddleware.js";
import authenticateUser from "./middleware/authenticateUser.js";
import { corsOptions } from "./config/corsOptions.js";
import {
  sanitizeMiddleware,
  validateRegisterInput,
  validateUserLoginInput,
} from "./middleware/sanitize.js";
import verifySession from "./middleware/verifySession.js";

mongoose.set("strictQuery", true);
const app = express();
dotenv.config();
app.use(cors());
app.use(sanitizeMiddleware);
app.use(express.json());
app.use(cookieParser());
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(
  session({
    name: "sessionIdKey",
    secret: "endurancemethod",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: `${process.env.dbconnectionString}`,
      dbName: "plannywork",
      collectionName: "appSessions",
      autoRemove: "native",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 2,
      httpOnly: true,
      domain: "localhost",
      sameSite: "Lax",
    },
  })
);
app.use(
  "/uploads",
  express.static(path.resolve(__dirname, "/client/public/uploads"))
);
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}
app.get("/api/v1", (req, res) => {
  res.send({
    status: "success",
    msg: "WorkPlanner App API Root",
    version: "1.0.0",
    uptime: process.uptime(),
    timeStamp: new Date().toISOString(),
    endpoints: {
      jobs: "/api/v1/jobs",
      users: "/api/v1/users",
    },
  });
});
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/jobs", verifySession, jobRoutes);
/* a generic errorHandler middleware to handle all error: response generalization */
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);
const port = process.env.PORT || 5100;
const url = process.env.dbconnectionString;
const startServer = async () => {
  try {
    connectDB(url);
    app.listen(port, () => {
      console.log(`Running in ${process.env.NODE_ENV} environment`);
      console.log(`Server listening on port ${port}`);
    });
  } catch (error) {
    console.error(error);
  }
};
startServer();

/* app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./client/src/dist", "index.html"));
}); */

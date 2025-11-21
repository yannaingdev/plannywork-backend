import { readFile } from "fs/promises";

import dotenv from "dotenv";

import connectDB from "./db/connect.js";
import Job from "./model/Job.js";
import mongoose from "mongoose";

dotenv.config();

const url = process.env.dbconnectionString;

const start = async () => {
  try {
    // await connectDB(url);
    // await Job.deleteMany();
    await mongoose.connect(url, {
      dbName: "plannywork",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    let jsonJobs = JSON.parse(
      await readFile(
        new URL("./MOCK_DATA/MOCK_DATA_JOBSHEET_V3.json", import.meta.url)
      )
    );
    await Job.create(jsonJobs);
    console.log("populated Mock Jobs");
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();

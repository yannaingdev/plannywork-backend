/**
 * Assigns jobLocation of existing Job documents to a KeyAccount location.
 *
 * Heuristics:
 * - Only considers KeyAccounts created by the same user as the Job (createdBy).
 * - Tries to match job.company to keyAccount.name (case-insensitive substring).
 * - If no name match, falls back to the earliest KeyAccount for that user.
 *
 * Usage:
 *   node scripts/assign-job-locations-from-keyaccounts.js            # dry-run (default)
 *   node scripts/assign-job-locations-from-keyaccounts.js --commit   # apply changes
 *
 * Optional filters:
 *   --user <userId>   limit to one userId (Mongo ObjectId)
 *
 * Requirements:
 *   - .env must contain dbconnectionString
 *   - Uses existing models: Job, KeyAccount
 */
import dotenv from "dotenv";
import connectDB from "../db/connect.js";
import Job from "../model/Job.js";
import KeyAccount from "../model/KeyAccount.js";
import mongoose from "mongoose";

dotenv.config();

const args = process.argv.slice(2);
const isCommit = args.includes("--commit");
const userFilterIndex = args.findIndex((a) => a === "--user");
const userFilter =
  userFilterIndex !== -1 && args[userFilterIndex + 1]
    ? args[userFilterIndex + 1]
    : null;

const dbUrl = process.env.dbconnectionString;

if (!dbUrl) {
  console.error("Missing dbconnectionString in .env");
  process.exit(1);
}

function normalize(str = "") {
  return str.toLowerCase();
}

async function main() {
  await connectDB(dbUrl);
  console.log(`Connected. Running in ${isCommit ? "COMMIT" : "DRY-RUN"} mode.`);

  const jobQuery = userFilter
    ? { createdBy: new mongoose.Types.ObjectId(userFilter) }
    : {};

  const jobs = await Job.find(jobQuery).lean();
  if (!jobs.length) {
    console.log("No jobs found for given filter.");
    process.exit(0);
  }

  // Preload key accounts by userId
  const userIds = [
    ...new Set(
      jobs.map((j) => j.createdBy?.toString()).filter((id) => Boolean(id)),
    ),
  ].map((id) => new mongoose.Types.ObjectId(id));

  const keyAccounts = await KeyAccount.find({
    createdBy: { $in: userIds },
  }).lean();

  const keyByUser = keyAccounts.reduce((acc, ka) => {
    const uid = ka.createdBy?.toString();
    if (!uid) return acc;
    if (!acc[uid]) acc[uid] = [];
    acc[uid].push(ka);
    return acc;
  }, {});

  // sort each user's key accounts by createdAt ascending for deterministic fallback
  Object.keys(keyByUser).forEach((uid) => {
    keyByUser[uid].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    );
  });

  let updated = 0;
  let skipped = 0;
  const rrIndexByUser = {};

  for (const job of jobs) {
    const uid = job.createdBy?.toString();
    if (!uid || !keyByUser[uid] || keyByUser[uid].length === 0) {
      skipped++;
      continue;
    }
    const list = keyByUser[uid];
    const company = normalize(job.company);
    let chosen =
      company &&
      list.find((ka) =>
        // loose contains match to avoid forcing the same fallback on all jobs
        normalize(ka.name).includes(company),
      );

    // Round-robin fallback per user so jobs get varied locations (not all the same)
    if (!chosen) {
      const idx = rrIndexByUser[uid] ?? 0;
      chosen = list[idx % list.length];
      rrIndexByUser[uid] = idx + 1;
    }

    const newLocation = chosen.address || chosen.name;
    if (!newLocation || newLocation === job.jobLocation) {
      skipped++;
      continue;
    }
    if (isCommit) {
      await Job.updateOne(
        { _id: job._id },
        { $set: { jobLocation: newLocation } },
      );
    }
    updated++;
  }

  console.log(
    `${isCommit ? "Updated" : "Would update"} ${updated} jobs, skipped ${skipped}.`,
  );
  await mongoose.connection.close();
}

main().catch((err) => {
  console.error(err);
  mongoose.connection.close();
  process.exit(1);
});

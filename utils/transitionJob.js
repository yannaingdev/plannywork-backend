import { canTransition } from "./canTransition.js";

export async function transitionJob(jobDoc, nextState) {
  if (!canTransition(jobDoc.jobState, nextState)) {
    const err = new Error(
      `Invalid transition ${jobDoc.status} -> ${nextState}`,
    );
    err.statusCode = 409;
    throw err;
  }
  jobDoc.jobState = nextState;
  jobDoc.statusUpdatedAt = new Date();
  await jobDoc.save();
  return jobDoc;
}

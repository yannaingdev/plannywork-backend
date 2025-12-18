import { S3Client } from "@aws-sdk/client-s3";

module.exports = new S3Client({
  region: process.env.AWS_REGION,
});

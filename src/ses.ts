import { SESClient } from "@aws-sdk/client-ses";

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!accessKeyId || !secretAccessKey) {
  throw new Error("🌴 Missing AWS credentials");
}

export const sesClient = new SESClient({
  region: "us-east-1",
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

import { SendEmailCommand } from "@aws-sdk/client-ses";
import { parse } from "csv-parse";
import { createReadStream, createWriteStream } from "fs";
import { stringify } from "csv-stringify";
import { pipeline } from "stream/promises";
import { getEmailParams } from "./email-config";
import { sesClient } from "./ses";

const CSV_FILE_PATH = "./csv/recruiters.csv";
const BLACKLIST_CSV_PATH = "./csv/blacklist.csv";

// Rate limiting configuration (to avoid hitting AWS SES limits)
const RATE_LIMIT = {
  maxEmailsPerSecond: 14, // AWS SES default limit is 14 emails/second
  delayBetweenEmails: 1000 / 14, // Delay in milliseconds between each email
};

type EmailRecord = {
  email: string;
  // Add other fields from your CSV if needed
  // name?: string;
  // company?: string;
};

type EmailResult = {
  email: string;
  status: "success" | "failure";
  timestamp: string;
  errorMessage?: string;
};

const sendEmail = async (toEmail: string) => {
  const params = getEmailParams(toEmail);

  try {
    const command = new SendEmailCommand(params);
    await sesClient.send(command);
    console.log(`✅ Email sent successfully to ${toEmail}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${toEmail}:`, error);
    throw error;
  }
};

const saveResults = async (results: EmailResult[]) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputFile = `./csv/email-results-${timestamp}.csv`;

  return new Promise<void>((resolve, reject) => {
    const writableStream = createWriteStream(outputFile);
    const stringifier = stringify({
      header: true,
      columns: {
        email: "Email",
        status: "Status",
        timestamp: "Timestamp",
        errorMessage: "Error Message",
      },
    });

    pipeline(stringifier, writableStream)
      .then(() => resolve())
      .catch(reject);

    results.forEach((result) => stringifier.write(result));
    stringifier.end();
  });
};

const readCsvData = async (filePath: string) => {
  const results: EmailRecord[] = [];
  const parser = createReadStream(filePath).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })
  );

  for await (const record of parser) {
    results.push(record as EmailRecord);
  }

  return results;
};

const getBlacklistedEmails = async (filePath?: string) => {
  const blacklist: Set<string> = new Set();
  if (!filePath) {
    return blacklist;
  }

  const parser = createReadStream(filePath).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })
  );

  const columnKey = "email";

  for await (const record of parser) {
    blacklist.add(record[columnKey].toLowerCase());
  }

  return blacklist;
};

const processEmails = async (filePath: string, blacklistPath?: string) => {
  const [resultsFromCsv, blacklist] = await Promise.all([
    readCsvData(filePath),
    getBlacklistedEmails(blacklistPath),
  ]);

  const results = resultsFromCsv.filter((record) => !blacklist.has(record.email.toLowerCase()));

  console.log(
    `📊 Found ${resultsFromCsv.length} email addresses, ${results.length} after filtering blacklisted emails`
  );

  const emailResults: EmailResult[] = [];
  let successCount = 0;
  let failureCount = 0;

  for (const [index, record] of results.entries()) {
    const timestamp = new Date().toISOString();

    try {
      await sendEmail(record.email);
      successCount++;

      emailResults.push({
        email: record.email,
        status: "success",
        timestamp,
      });

      // Add delay between emails for rate limiting
      if (index < results.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT.delayBetweenEmails));
      }
    } catch (error) {
      failureCount++;
      emailResults.push({
        email: record.email,
        status: "failure",
        timestamp,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });

      // Continue with next email even if one fails
      continue;
    }
  }

  // Save results to CSV file
  await saveResults(emailResults);

  console.log("\n📝 Summary:");
  console.log(`Total emails processed: ${results.length}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`📋 Detailed results have been saved to email-results-[timestamp].csv`);
};

const main = async () => {
  try {
    console.log("🚀 Starting email campaign...");
    await processEmails(CSV_FILE_PATH, BLACKLIST_CSV_PATH);
    console.log("✨ Email campaign completed!");
    process.exit(0);
  } catch (error) {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  }
};

main();

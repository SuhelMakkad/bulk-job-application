# Bulk Email Sender with AWS SES

This TypeScript script allows you to send bulk emails to a list of recruiters using AWS Simple Email Service (SES). It includes rate limiting, error handling, and generates a detailed CSV report of the email campaign results.

## Prerequisites

- [Bun](https://bun.sh/) installed on your system
- An AWS account with SES configured
- SES verified email address or domain
- AWS credentials with appropriate SES permissions

## Setup

1. Clone the repository and install dependencies:

```bash
git clone https://github.com/SuhelMakkad/bulk-job-application
cd bulk-job-application
bun install
```

2. Configure environment variables:
   - Copy the `.env.example` file to create a new `.env` file:

   ```bash
   cp .env.example .env
   ```

   - Update the `.env` file with your AWS credentials and configuration:

   ```env
   AWS_ACCESS_KEY_ID=your_access_key_id
   AWS_SECRET_ACCESS_KEY=your_secret_access_key
   AWS_REGION=your_aws_region
   ```

3. Prepare your CSV file:
   - Create a CSV file named `recruiters.csv` in the project root
   - The CSV should have at minimum an "email" column
   - Example format:

   ```csv
   email
   recruiter1@company.com
   recruiter2@company.com
   ```

## Configuration

You can customize the email content and rate limiting in the script:

1. Email Configuration (in `email-config.ts`):

```typescript
const EMAIL_CONFIG = {
  formName: "Your Name <your.email@domain.com>",
  replyTo: "your.email@domain.com",
  from: "your.verified@domain.com",
  subject: "Your Subject Line Here",
  body: `Dear Recruiter,

I hope this email finds you well. I am reaching out because...

Best regards,
Your Name
`,
};
```

2. Rate Limiting (in `index.ts`):

```typescript
const RATE_LIMIT = {
    maxEmailsPerSecond: 14,
    delayBetweenEmails: 1000 / 14
};
```

## Usage

1. Run the script:

```bash
bun run email-sender.ts
```

2. The script will:
   - Read emails from `data/recruiters.csv`
   - Send emails using AWS SES
   - Generate a results CSV file named `data/email-results-[timestamp].csv`

## Output

The script generates a detailed CSV report with the following information for each email:

- Email address
- Status (success/failure)
- Timestamp
- Error message (if any)

Example output file: `data/email-results-2024-12-22T15-30-45-000Z.csv`

## Error Handling

- The script includes comprehensive error handling
- Failed emails are logged with error messages
- The process continues even if individual emails fail
- A summary is provided at the end with success/failure counts

## AWS SES Limits

- Default sending limit is 14 emails per second
- The script includes rate limiting to comply with AWS limits
- Adjust `RATE_LIMIT` settings if you have different AWS SES limits

## Troubleshooting

1. **AWS Credentials Error**
   - Verify your AWS credentials in the `.env` file
   - Ensure your AWS user has appropriate SES permissions

2. **CSV File Error**
   - Verify `data/recruiters.csv` exists in the project root
   - Check CSV format and column names
   - Ensure the file is not open in another program

3. **SES Verification Error**
   - Verify your sender email is verified in AWS SES
   - Check if you're in SES sandbox mode

## Contributing

Feel free to submit issues and pull requests for improvements.

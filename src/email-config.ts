import type { SendEmailCommandInput } from "@aws-sdk/client-ses";

const EMAIL_CONFIG = {
  source: "Suhel Makkad <me@suhelmakkad.com>",
  replyTo: "makadsuhel11@gmail.com",
  from: "me@suhelmakkad.com",
  subject: "Your Subject Line Here",
  body: `Dear Recruiter,

I hope this email finds you well. I am reaching out because...

Best regards,
Your Name
`,
};

export const getEmailParams = (toEmail: string): SendEmailCommandInput => {
  return {
    Source: EMAIL_CONFIG.source,
    ReplyToAddresses: [EMAIL_CONFIG.replyTo],
    Destination: {
      ToAddresses: [toEmail],
    },
    Message: {
      Subject: {
        Data: EMAIL_CONFIG.subject,
        Charset: "UTF-8",
      },
      Body: {
        // You can also use HTML format for the email body `Html: { Data: EMAIL_CONFIG.body, Charset: "UTF-8" }`
        Text: {
          Data: EMAIL_CONFIG.body,
          Charset: "UTF-8",
        },
      },
    },
  };
};

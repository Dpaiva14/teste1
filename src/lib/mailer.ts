import "server-only";
import nodemailer from "nodemailer";
import { getEnv, isProd } from "@/lib/env";

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Sends transactional e-mail. With SMTP_URL configured it uses SMTP (nodemailer); otherwise it logs the
 * message to the server console — fine for development, and the reset link is printed there. In
 * production without SMTP_URL, links are NOT logged (they would be credentials in the logs).
 */
export async function sendMail(msg: MailMessage): Promise<void> {
  const env = getEnv();
  if (env.SMTP_URL) {
    const transport = nodemailer.createTransport(env.SMTP_URL);
    await transport.sendMail({ from: env.EMAIL_FROM, ...msg });
    return;
  }
  if (isProd()) {
    console.warn(`[mailer] SMTP_URL is not configured — e-mail "${msg.subject}" to ${msg.to} was NOT sent.`);
    return;
  }
  console.info(`\n[mailer:dev] To: ${msg.to}\n[mailer:dev] Subject: ${msg.subject}\n${msg.text}\n`);
}

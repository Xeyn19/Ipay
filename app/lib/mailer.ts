import "server-only";

import nodemailer from "nodemailer";

type MailAttachment = {
  cid?: string;
  content: Buffer;
  contentType?: string;
  filename: string;
};

type SendEmailOptions = {
  attachments?: MailAttachment[];
  from?: string;
  html: string;
  idempotencyKey: string;
  replyTo?: string;
  subject: string;
  text: string;
  to: string;
};

type SendAutoReplyEmailOptions = {
  attachments?: MailAttachment[];
  html: string;
  idempotencyKey: string;
  subject: string;
  text: string;
  to: string;
};

type SendAutoReplyEmailResponse = {
  id: string;
};

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

function parseSmtpPort(value: string) {
  const port = Number(value);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("SMTP_PORT must be a positive integer.");
  }

  return port;
}

function parseSmtpSecure(value: string) {
  const normalized = value.trim().toLowerCase();

  if (normalized === "true" || normalized === "1" || normalized === "yes") {
    return true;
  }

  if (normalized === "false" || normalized === "0" || normalized === "no") {
    return false;
  }

  throw new Error("SMTP_SECURE must be set to true or false.");
}

export function isAutoReplyEnabled() {
  return process.env.AUTO_REPLY_ENABLED !== "false";
}

function createTransporter() {
  const host = getRequiredEnv("SMTP_HOST");
  const port = parseSmtpPort(getRequiredEnv("SMTP_PORT"));
  const secure = parseSmtpSecure(getRequiredEnv("SMTP_SECURE"));
  const user = getRequiredEnv("SMTP_USER");
  const pass = getRequiredEnv("SMTP_PASS");

  return nodemailer.createTransport({
    auth: {
      pass,
      user,
    },
    host,
    port,
    secure,
  });
}

export async function sendEmail({
  attachments = [],
  from,
  html,
  idempotencyKey,
  replyTo,
  subject,
  text,
  to,
}: SendEmailOptions): Promise<SendAutoReplyEmailResponse> {
  const transporter = createTransporter();

  const info = await transporter.sendMail({
    attachments,
    from,
    headers: {
      "X-Idempotency-Key": idempotencyKey,
    },
    html,
    replyTo,
    subject,
    text,
    to,
  });

  if (!info.messageId) {
    throw new Error("SMTP server did not return a message ID.");
  }

  return {
    id: info.messageId,
  };
}

export async function sendAutoReplyEmail({
  attachments = [],
  html,
  idempotencyKey,
  subject,
  text,
  to,
}: SendAutoReplyEmailOptions): Promise<SendAutoReplyEmailResponse> {
  if (!isAutoReplyEnabled()) {
    throw new Error("Auto reply is disabled.");
  }

  const from = getRequiredEnv("AUTO_REPLY_FROM_EMAIL");
  const replyTo = getRequiredEnv("AUTO_REPLY_REPLY_TO_EMAIL");

  return sendEmail({
    attachments,
    from,
    html,
    idempotencyKey,
    replyTo,
    subject,
    text,
    to,
  });
}

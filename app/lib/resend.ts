import "server-only";

const RESEND_API_URL = "https://api.resend.com/emails";

type SendResendEmailOptions = {
  html: string;
  idempotencyKey: string;
  subject: string;
  text: string;
  to: string;
};

type ResendSendResponse = {
  id: string;
};

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

export function isAutoReplyEnabled() {
  return process.env.AUTO_REPLY_ENABLED !== "false";
}

export async function sendResendEmail({
  html,
  idempotencyKey,
  subject,
  text,
  to,
}: SendResendEmailOptions): Promise<ResendSendResponse> {
  if (!isAutoReplyEnabled()) {
    throw new Error("Auto reply is disabled.");
  }

  const apiKey = getRequiredEnv("RESEND_API_KEY");
  const from = getRequiredEnv("RESEND_FROM_EMAIL");
  const replyTo = getRequiredEnv("RESEND_REPLY_TO_EMAIL");

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      text,
      reply_to: replyTo,
    }),
  });

  const rawBody = await response.text();
  let payload: { id?: string; message?: string; name?: string } = {};

  if (rawBody) {
    try {
      payload = JSON.parse(rawBody) as typeof payload;
    } catch {
      payload = {};
    }
  }

  if (!response.ok || !payload.id) {
    const message =
      payload.message ??
      payload.name ??
      (rawBody || "Resend could not send the email.");

    throw new Error(message);
  }

  return {
    id: payload.id,
  };
}

import "server-only";

const TURNSTILE_SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type TurnstileSiteverifyResponse = {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  "error-codes"?: string[];
};

export async function verifyTurnstileToken({
  token,
  remoteIp,
}: {
  token: string;
  remoteIp: string;
}) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    throw new Error("TURNSTILE_SECRET_KEY is not configured.");
  }

  if (!token || token.length > 2048) {
    return false;
  }

  const response = await fetch(TURNSTILE_SITEVERIFY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      secret,
      response: token,
      remoteip: remoteIp,
      idempotency_key: crypto.randomUUID(),
    }),
  });

  if (!response.ok) {
    return false;
  }

  const result = (await response.json()) as TurnstileSiteverifyResponse;

  if (!result.success) {
    return false;
  }

  if (result.action && result.action !== "request_proposal") {
    return false;
  }

  const expectedHostname = process.env.TURNSTILE_EXPECTED_HOSTNAME;
  if (expectedHostname && result.hostname !== expectedHostname) {
    return false;
  }

  return true;
}

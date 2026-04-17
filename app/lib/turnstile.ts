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

type TurnstileVerificationResult =
  | {
      success: true;
    }
  | {
      success: false;
      reason: string;
    };

function normalizeHostname(value: string) {
  const trimmed = value.trim().toLowerCase();

  if (!trimmed) {
    return "";
  }

  try {
    return new URL(trimmed).hostname;
  } catch {
    return trimmed.split("/")[0]?.split(":")[0] ?? "";
  }
}

function getExpectedHostnames() {
  return (process.env.TURNSTILE_EXPECTED_HOSTNAME ?? "")
    .split(",")
    .map(normalizeHostname)
    .filter(Boolean);
}

export async function verifyTurnstileToken({
  token,
  remoteIp,
}: {
  token: string;
  remoteIp: string;
}): Promise<TurnstileVerificationResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    throw new Error("TURNSTILE_SECRET_KEY is not configured.");
  }

  if (!token || token.length > 2048) {
    return {
      success: false,
      reason: "missing_or_invalid_token",
    };
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
    console.warn("Turnstile siteverify HTTP error", {
      status: response.status,
      statusText: response.statusText,
    });

    return {
      success: false,
      reason: `siteverify_http_${response.status}`,
    };
  }

  const result = (await response.json()) as TurnstileSiteverifyResponse;

  if (!result.success) {
    console.warn("Turnstile siteverify rejected token", {
      errorCodes: result["error-codes"],
      hostname: result.hostname,
      action: result.action,
    });

    return {
      success: false,
      reason: result["error-codes"]?.join("_") || "siteverify_rejected",
    };
  }

  if (result.action && result.action !== "request_proposal") {
    console.warn("Turnstile action mismatch", {
      action: result.action,
      expectedAction: "request_proposal",
    });

    return {
      success: false,
      reason: "action_mismatch",
    };
  }

  const expectedHostnames = getExpectedHostnames();
  const verifiedHostname = normalizeHostname(result.hostname ?? "");

  if (
    expectedHostnames.length > 0 &&
    !expectedHostnames.includes(verifiedHostname)
  ) {
    console.warn("Turnstile hostname mismatch", {
      verifiedHostname,
      expectedHostnames,
    });

    return {
      success: false,
      reason: "hostname_mismatch",
    };
  }

  return {
    success: true,
  };
}

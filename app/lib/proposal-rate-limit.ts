import "server-only";

import { createHmac } from "node:crypto";
import { createAdminClient } from "@/app/lib/supabase-admin";

type RateLimitResult =
  | {
      allowed: true;
      ipHash: string;
      emailHash: string;
    }
  | {
      allowed: false;
      ipHash: string;
      emailHash: string;
      reason: string;
      retryAfterSeconds: number;
    };

type CountOptions = {
  column: "ip_hash" | "email_hash";
  value: string;
  since: Date;
};

const ACCEPTED_IP_LIMIT_PER_HOUR = 5;
const ACCEPTED_EMAIL_LIMIT_PER_DAY = 5;

function getHashSecret() {
  const secret = process.env.RATE_LIMIT_HASH_SECRET;

  if (!secret) {
    throw new Error("RATE_LIMIT_HASH_SECRET is not configured.");
  }

  return secret;
}

function hashRateLimitValue(value: string) {
  return createHmac("sha256", getHashSecret())
    .update(value.trim().toLowerCase())
    .digest("hex");
}

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60 * 1000);
}

async function countAttempts({
  column,
  value,
  since,
}: CountOptions) {
  const { count, error } = await createAdminClient()
    .from("proposal_submission_attempts")
    .select("id", { count: "exact", head: true })
    .eq(column, value)
    .eq("accepted", true)
    .gte("created_at", since.toISOString());

  if (error) {
    throw new Error(`Unable to check proposal rate limit: ${error.message}`);
  }

  return count ?? 0;
}

export async function checkProposalRateLimit({
  ip,
  email,
}: {
  ip: string;
  email: string;
}): Promise<RateLimitResult> {
  const ipHash = hashRateLimitValue(ip || "unknown");
  const emailHash = hashRateLimitValue(email);

  const acceptedIpAttempts = await countAttempts({
    column: "ip_hash",
    value: ipHash,
    since: minutesAgo(60),
  });

  if (acceptedIpAttempts >= ACCEPTED_IP_LIMIT_PER_HOUR) {
    return {
      allowed: false,
      ipHash,
      emailHash,
      reason: "ip_accepted_1h",
      retryAfterSeconds: 60 * 60,
    };
  }

  const acceptedEmailAttempts = await countAttempts({
    column: "email_hash",
    value: emailHash,
    since: minutesAgo(24 * 60),
  });

  if (acceptedEmailAttempts >= ACCEPTED_EMAIL_LIMIT_PER_DAY) {
    return {
      allowed: false,
      ipHash,
      emailHash,
      reason: "email_accepted_24h",
      retryAfterSeconds: 24 * 60 * 60,
    };
  }

  return {
    allowed: true,
    ipHash,
    emailHash,
  };
}

export async function recordAcceptedProposalAttempt({
  ipHash,
  emailHash,
}: {
  ipHash: string;
  emailHash: string;
}) {
  const { error } = await createAdminClient()
    .from("proposal_submission_attempts")
    .insert({
      ip_hash: ipHash,
      email_hash: emailHash,
      accepted: true,
      reason: "accepted",
    });

  if (error) {
    throw new Error(`Unable to record proposal attempt: ${error.message}`);
  }
}

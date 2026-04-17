"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/app/lib/supabase-admin";
import {
  checkProposalRateLimit,
  createProposalAttemptHashes,
  recordProposalAttempt,
} from "@/app/lib/proposal-rate-limit";
import { verifyTurnstileToken } from "@/app/lib/turnstile";

type ProposalField = "name" | "company" | "email" | "contactNumber" | "terms";

export type ProposalFormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Partial<Record<ProposalField, string>>;
  resetCaptcha?: boolean;
  submittedAt?: number;
};

const genericError =
  "We could not send your request right now. Please try again later.";

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getClientIp(headersList: Headers) {
  const forwardedFor = headersList.get("x-forwarded-for");
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();

  return (
    headersList.get("cf-connecting-ip") ??
    headersList.get("x-real-ip") ??
    forwardedIp ??
    "unknown"
  );
}

function validateProposalForm(formData: FormData) {
  const name = getFormValue(formData, "name");
  const company = getFormValue(formData, "company");
  const email = getFormValue(formData, "email").toLowerCase();
  const contactNumber = getFormValue(formData, "contactNumber");
  const message = getFormValue(formData, "message");
  const terms = formData.get("terms") === "on";
  const captchaToken = getFormValue(formData, "cf-turnstile-response");
  const honeypot = getFormValue(formData, "website");
  const fieldErrors: ProposalFormState["fieldErrors"] = {};

  if (!name || name.length > 120) {
    fieldErrors.name = "Enter your full name.";
  }

  if (!company || company.length > 160) {
    fieldErrors.company = "Enter your company name.";
  }

  if (
    !email ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (
    !contactNumber ||
    contactNumber.length > 40 ||
    !/^[0-9+\-()\s.]+$/.test(contactNumber)
  ) {
    fieldErrors.contactNumber = "Enter a valid contact number.";
  }

  if (!terms) {
    fieldErrors.terms = "Confirm that you have read and agree to the policy.";
  }

  return {
    values: {
      name,
      company,
      email,
      contactNumber,
      message: message.slice(0, 2000),
      captchaToken,
      honeypot,
    },
    fieldErrors,
    isValid: Object.keys(fieldErrors).length === 0,
  };
}

export async function submitProposal(
  _prevState: ProposalFormState,
  formData: FormData
): Promise<ProposalFormState> {
  const { values, fieldErrors, isValid } = validateProposalForm(formData);

  if (!isValid) {
    return {
      status: "error",
      message: "Please review the highlighted fields.",
      fieldErrors,
      resetCaptcha: true,
      submittedAt: Date.now(),
    };
  }

  const headersList = await headers();
  const clientIp = getClientIp(headersList);

  try {
    const attemptHashes = createProposalAttemptHashes({
      ip: clientIp,
      email: values.email,
    });

    if (values.honeypot) {
      await recordProposalAttempt({
        ...attemptHashes,
        accepted: false,
        reason: "honeypot",
      });

      return {
        status: "success",
        message: "Request submitted successfully! We'll be in touch soon.",
        resetCaptcha: true,
        submittedAt: Date.now(),
      };
    }

    const rateLimit = await checkProposalRateLimit({
      ip: clientIp,
      email: values.email,
    });

    if (!rateLimit.allowed) {
      await recordProposalAttempt({
        ipHash: rateLimit.ipHash,
        emailHash: rateLimit.emailHash,
        accepted: false,
        reason: rateLimit.reason,
      });

      return {
        status: "error",
        message:
          "Too many proposal requests were sent recently. Please try again later.",
        resetCaptcha: true,
        submittedAt: Date.now(),
      };
    }

    const turnstileResult = await verifyTurnstileToken({
      token: values.captchaToken,
      remoteIp: clientIp,
    });

    if (!turnstileResult.success) {
      await recordProposalAttempt({
        ipHash: rateLimit.ipHash,
        emailHash: rateLimit.emailHash,
        accepted: false,
        reason: `turnstile_${turnstileResult.reason}`.slice(0, 120),
      });

      return {
        status: "error",
        message: "Please complete the human verification and try again.",
        resetCaptcha: true,
        submittedAt: Date.now(),
      };
    }

    const { error } = await createAdminClient().from("leads").insert({
      name: values.name,
      company: values.company,
      email: values.email,
      contact_number: values.contactNumber,
      message: values.message,
    });

    if (error) {
      await recordProposalAttempt({
        ipHash: rateLimit.ipHash,
        emailHash: rateLimit.emailHash,
        accepted: false,
        reason: "lead_insert_failed",
      });
      console.error("Error submitting proposal request:", error);

      return {
        status: "error",
        message: genericError,
        resetCaptcha: true,
        submittedAt: Date.now(),
      };
    }

    await recordProposalAttempt({
      ipHash: rateLimit.ipHash,
      emailHash: rateLimit.emailHash,
      accepted: true,
      reason: "accepted",
    });

    return {
      status: "success",
      message: "Request submitted successfully! We'll be in touch soon.",
      resetCaptcha: true,
      submittedAt: Date.now(),
    };
  } catch (error) {
    console.error("Error submitting proposal request:", error);

    return {
      status: "error",
      message: genericError,
      resetCaptcha: true,
      submittedAt: Date.now(),
    };
  }
}

"use server";

import { cookies, headers } from "next/headers";
import { sendLeadAutoReplyForLead } from "@/app/lib/lead-auto-reply";
import { createAdminClient } from "@/app/lib/supabase-admin";
import {
  checkProposalRateLimit,
  recordAcceptedProposalAttempt,
} from "@/app/lib/proposal-rate-limit";
import { verifyTurnstileToken } from "@/app/lib/turnstile";
import { getProposalEmailError } from "./email-policy";
import {
  proposalSuccessCookieName,
  proposalSuccessOutcomeCookieName,
  type ProposalSuccessOutcome,
} from "./success-cookie";

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
const successMessage =
  "Your proposal request has been sent successfully. You will receive a confirmation email shortly.";
const partialSuccessMessage =
  "Your proposal request has been received, but we could not send the confirmation email right now.";

const proposalSuccessCookieOptions = {
  httpOnly: true,
  maxAge: 60 * 5,
  path: "/request-proposal/success",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

async function markProposalSuccess(outcome?: ProposalSuccessOutcome) {
  const cookieStore = await cookies();

  cookieStore.set(proposalSuccessCookieName, "1", proposalSuccessCookieOptions);

  if (outcome) {
    cookieStore.set(
      proposalSuccessOutcomeCookieName,
      outcome,
      proposalSuccessCookieOptions
    );
    return;
  }

  cookieStore.set(proposalSuccessOutcomeCookieName, "", {
    ...proposalSuccessCookieOptions,
    maxAge: 0,
  });
}

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

async function validateProposalForm(formData: FormData) {
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

  const emailError = await getProposalEmailError(email);

  if (emailError) {
    fieldErrors.email = emailError;
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
  const { values, fieldErrors, isValid } = await validateProposalForm(formData);

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
    if (values.honeypot) {
      await markProposalSuccess();

      return {
        status: "success",
        message: "Your proposal request has been sent successfully.",
        resetCaptcha: true,
        submittedAt: Date.now(),
      };
    }

    const rateLimit = await checkProposalRateLimit({
      ip: clientIp,
      email: values.email,
    });

    if (!rateLimit.allowed) {
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
      return {
        status: "error",
        message: "Please complete the human verification and try again.",
        resetCaptcha: true,
        submittedAt: Date.now(),
      };
    }

    const { data: lead, error } = await createAdminClient()
      .from("leads")
      .insert({
        name: values.name,
        company: values.company,
        email: values.email,
        contact_number: values.contactNumber,
        message: values.message,
      })
      .select("id, name, company, email")
      .single();

    if (error || !lead) {
      console.error("Error submitting proposal request:", error);

      return {
        status: "error",
        message: genericError,
        resetCaptcha: true,
        submittedAt: Date.now(),
      };
    }

    await recordAcceptedProposalAttempt({
      ipHash: rateLimit.ipHash,
      emailHash: rateLimit.emailHash,
    });

    const autoReplyResult = await sendLeadAutoReplyForLead(lead, {
      actorUserId: null,
      idempotencyKey: `proposal-auto-reply-${lead.id}`,
    });

    if (autoReplyResult.status === "success") {
      await markProposalSuccess("sent");

      return {
        status: "success",
        message: successMessage,
        resetCaptcha: true,
        submittedAt: Date.now(),
      };
    }

    console.error(
      "Auto reply could not be sent for proposal request:",
      autoReplyResult.message
    );
    await markProposalSuccess("email_failed");

    return {
      status: "success",
      message: partialSuccessMessage,
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

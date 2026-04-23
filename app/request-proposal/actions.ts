"use server";

import { cookies, headers } from "next/headers";
import { createAdminClient } from "@/app/lib/supabase-admin";
import {
  checkProposalRateLimit,
  recordAcceptedProposalAttempt,
} from "@/app/lib/proposal-rate-limit";
import { verifyTurnstileToken } from "@/app/lib/turnstile";
import { getProposalEmailError } from "./email-policy";
import { proposalSuccessCookieName } from "./success-cookie";

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
  "Your proposal request has been sent successfully.";

async function markProposalSuccess() {
  const cookieStore = await cookies();

  cookieStore.set(proposalSuccessCookieName, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/request-proposal/success",
    maxAge: 60 * 5,
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
        message: successMessage,
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

    const { error } = await createAdminClient().from("leads").insert({
      name: values.name,
      company: values.company,
      email: values.email,
      contact_number: values.contactNumber,
      message: values.message,
    });

    if (error) {
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
    await markProposalSuccess();

    return {
      status: "success",
      message: successMessage,
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

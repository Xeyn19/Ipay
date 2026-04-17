"use client";

import { submitProposal, type ProposalFormState } from "./actions";
import Link from "next/link";
import Script from "next/script";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

type TurnstileRenderOptions = {
  sitekey: string;
  action?: string;
  theme?: "auto" | "light" | "dark";
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
};

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: TurnstileRenderOptions
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const initialState: ProposalFormState = {
  status: "idle",
  message: "",
};

const formStorageKeys = [
  "ipp_form_name",
  "ipp_form_company",
  "ipp_form_email",
  "ipp_form_contact_number",
  "ipp_form_message",
];

export function ProposalForm() {
  const [state, formAction, pending] = useActionState(
    submitProposal,
    initialState
  );
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [message, setMessage] = useState("");
  const [hasReadPrivacy, setHasReadPrivacy] = useState(false);
  const [isTurnstileLoaded, setIsTurnstileLoaded] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const turnstileSiteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  const updateField = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    key: string,
    value: string
  ) => {
    setter(value);
    sessionStorage.setItem(key, value);
  };

  useEffect(() => {
    const checkPrivacyStatus = () => {
      const status = sessionStorage.getItem("ipp_privacy_read") === "true";
      setHasReadPrivacy(status);
    };

    queueMicrotask(() => {
      const savedName = sessionStorage.getItem("ipp_form_name");
      if (savedName) setName(savedName);
      const savedCompany = sessionStorage.getItem("ipp_form_company");
      if (savedCompany) setCompany(savedCompany);
      const savedEmail = sessionStorage.getItem("ipp_form_email");
      if (savedEmail) setEmail(savedEmail);
      const savedContactNumber = sessionStorage.getItem(
        "ipp_form_contact_number"
      );
      if (savedContactNumber) setContactNumber(savedContactNumber);
      const savedMessage = sessionStorage.getItem("ipp_form_message");
      if (savedMessage) setMessage(savedMessage);
      checkPrivacyStatus();
    });

    window.addEventListener("storage", checkPrivacyStatus);
    window.addEventListener("ipp_privacy_read", checkPrivacyStatus);

    return () => {
      window.removeEventListener("storage", checkPrivacyStatus);
      window.removeEventListener("ipp_privacy_read", checkPrivacyStatus);
    };
  }, []);

  useEffect(() => {
    if (
      !turnstileSiteKey ||
      !isTurnstileLoaded ||
      !window.turnstile ||
      !turnstileContainerRef.current ||
      turnstileWidgetIdRef.current
    ) {
      return;
    }

    turnstileWidgetIdRef.current = window.turnstile.render(
      turnstileContainerRef.current,
      {
        sitekey: turnstileSiteKey,
        action: "request_proposal",
        theme: "auto",
        callback: (token) => {
          setCaptchaToken(token);
          setCaptchaError("");
        },
        "expired-callback": () => {
          setCaptchaToken("");
          setCaptchaError("Human verification expired. Please verify again.");
        },
        "error-callback": () => {
          setCaptchaToken("");
          setCaptchaError("Human verification failed. Please try again.");
        },
      }
    );

    return () => {
      if (turnstileWidgetIdRef.current && window.turnstile) {
        window.turnstile.remove(turnstileWidgetIdRef.current);
        turnstileWidgetIdRef.current = null;
      }
    };
  }, [isTurnstileLoaded, turnstileSiteKey]);

  useEffect(() => {
    if (!state.submittedAt) return;

    queueMicrotask(() => {
      if (state.status === "success") {
        setName("");
        setCompany("");
        setEmail("");
        setContactNumber("");
        setMessage("");
        formStorageKeys.forEach((key) => sessionStorage.removeItem(key));
        formRef.current?.reset();
        toast.success(state.message);
      }

      if (state.status === "error") {
        toast.error(state.message);
      }

      if (state.resetCaptcha) {
        setCaptchaToken("");
        setCaptchaError("");

        if (turnstileWidgetIdRef.current && window.turnstile) {
          window.turnstile.reset(turnstileWidgetIdRef.current);
        }
      }
    });
  }, [state.submittedAt, state.status, state.message, state.resetCaptcha]);

  const isSubmitDisabled =
    !hasReadPrivacy || pending || !turnstileSiteKey || !captchaToken;

  return (
    <>
      {turnstileSiteKey && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={() => setIsTurnstileLoaded(true)}
        />
      )}

      <form
        id="proposal-request-form"
        ref={formRef}
        action={formAction}
        className="space-y-5"
      >
        <input
          type="hidden"
          name="cf-turnstile-response"
          value={captchaToken}
          readOnly
        />

        <div
          aria-hidden="true"
          className="absolute left-[-9999px] h-px w-px overflow-hidden"
        >
          <label htmlFor="proposal-website">Website</label>
          <input
            id="proposal-website"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Name */}
        <div>
          <label
            htmlFor="proposal-name"
            className="mb-1.5 block text-xs font-semibold tracking-[0.06em] text-[var(--text-secondary)]"
          >
            Full Name <span className="text-[var(--brand)]">*</span>
          </label>
          <input
            id="proposal-name"
            type="text"
            name="name"
            value={name}
            onChange={(e) =>
              updateField(setName, "ipp_form_name", e.target.value)
            }
            required
            aria-invalid={Boolean(state.fieldErrors?.name)}
            aria-describedby={
              state.fieldErrors?.name ? "proposal-name-error" : undefined
            }
            placeholder="Juan dela Cruz"
            className="w-full rounded-xl border border-[var(--border-light)] bg-[var(--bg-base)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none transition-all focus:border-[var(--brand)] focus:ring-3 focus:ring-[rgba(241,122,30,0.12)]"
          />
          {state.fieldErrors?.name && (
            <p id="proposal-name-error" className="mt-1 text-xs text-red-500">
              {state.fieldErrors.name}
            </p>
          )}
        </div>

        {/* Company */}
        <div>
          <label
            htmlFor="proposal-company"
            className="mb-1.5 block text-xs font-semibold tracking-[0.06em] text-[var(--text-secondary)]"
          >
            Company <span className="text-[var(--brand)]">*</span>
          </label>
          <input
            id="proposal-company"
            type="text"
            name="company"
            value={company}
            onChange={(e) =>
              updateField(setCompany, "ipp_form_company", e.target.value)
            }
            required
            aria-invalid={Boolean(state.fieldErrors?.company)}
            aria-describedby={
              state.fieldErrors?.company
                ? "proposal-company-error"
                : undefined
            }
            placeholder="Company Name"
            className="w-full rounded-xl border border-[var(--border-light)] bg-[var(--bg-base)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none transition-all focus:border-[var(--brand)] focus:ring-3 focus:ring-[rgba(241,122,30,0.12)]"
          />
          {state.fieldErrors?.company && (
            <p
              id="proposal-company-error"
              className="mt-1 text-xs text-red-500"
            >
              {state.fieldErrors.company}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="proposal-email"
            className="mb-1.5 block text-xs font-semibold tracking-[0.06em] text-[var(--text-secondary)]"
          >
            Email <span className="text-[var(--brand)]">*</span>
          </label>
          <input
            id="proposal-email"
            type="email"
            name="email"
            value={email}
            onChange={(e) =>
              updateField(setEmail, "ipp_form_email", e.target.value)
            }
            required
            aria-invalid={Boolean(state.fieldErrors?.email)}
            aria-describedby={
              state.fieldErrors?.email ? "proposal-email-error" : undefined
            }
            placeholder="you@company.com"
            className="w-full rounded-xl border border-[var(--border-light)] bg-[var(--bg-base)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none transition-all focus:border-[var(--brand)] focus:ring-3 focus:ring-[rgba(241,122,30,0.12)]"
          />
          {state.fieldErrors?.email && (
            <p id="proposal-email-error" className="mt-1 text-xs text-red-500">
              {state.fieldErrors.email}
            </p>
          )}
        </div>

        {/* Contact Number */}
        <div>
          <label
            htmlFor="proposal-contact"
            className="mb-1.5 block text-xs font-semibold tracking-[0.06em] text-[var(--text-secondary)]"
          >
            Contact Number <span className="text-[var(--brand)]">*</span>
          </label>
          <input
            id="proposal-contact"
            type="tel"
            name="contactNumber"
            value={contactNumber}
            onChange={(e) =>
              updateField(
                setContactNumber,
                "ipp_form_contact_number",
                e.target.value
              )
            }
            required
            aria-invalid={Boolean(state.fieldErrors?.contactNumber)}
            aria-describedby={
              state.fieldErrors?.contactNumber
                ? "proposal-contact-error"
                : undefined
            }
            placeholder="+63 900 000 0000"
            className="w-full rounded-xl border border-[var(--border-light)] bg-[var(--bg-base)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none transition-all focus:border-[var(--brand)] focus:ring-3 focus:ring-[rgba(241,122,30,0.12)]"
          />
          {state.fieldErrors?.contactNumber && (
            <p
              id="proposal-contact-error"
              className="mt-1 text-xs text-red-500"
            >
              {state.fieldErrors.contactNumber}
            </p>
          )}
        </div>

        {/* Message */}
        <div>
          <label
            htmlFor="proposal-message"
            className="mb-1.5 block text-xs font-semibold tracking-[0.06em] text-[var(--text-secondary)]"
          >
            Message
          </label>
          <textarea
            id="proposal-message"
            name="message"
            value={message}
            onChange={(e) =>
              updateField(setMessage, "ipp_form_message", e.target.value)
            }
            rows={4}
            maxLength={2000}
            placeholder="How can we help your business? Share a few details..."
            className="w-full resize-none rounded-xl border border-[var(--border-light)] bg-[var(--bg-base)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none transition-all focus:border-[var(--brand)] focus:ring-3 focus:ring-[rgba(241,122,30,0.12)]"
          />
        </div>

        {/* Consent Checkbox */}
        <div className="flex items-start gap-3">
          <div className="flex h-5 items-center">
            <input
              id="terms-checkbox"
              name="terms"
              type="checkbox"
              required
              disabled={!hasReadPrivacy}
              title={
                !hasReadPrivacy
                  ? "Please scroll through our Privacy Policy first"
                  : ""
              }
              aria-invalid={Boolean(state.fieldErrors?.terms)}
              aria-describedby={
                state.fieldErrors?.terms ? "proposal-terms-error" : undefined
              }
              className="h-4 w-4 rounded border-[var(--border-medium)] text-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/40 focus:ring-offset-1 focus:ring-offset-[var(--bg-base)] disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="terms-checkbox"
              className={`text-xs leading-5 text-[var(--text-secondary)] ${
                !hasReadPrivacy ? "opacity-70" : ""
              }`}
            >
              By checking this box, you confirm that you have read and agree to
              our <strong>Terms of Use</strong> and that you consent to our
              processing of your Personal Data in accordance with our{" "}
              <Link
                href="/privacy-policy"
                className="text-[var(--text-primary)] underline hover:text-[var(--brand)]"
              >
                <strong>Privacy Policy</strong>
              </Link>
              .
            </label>

            {!hasReadPrivacy && (
              <p className="text-[0.65rem] font-medium text-orange-500/80">
                For compliance purposes, kindly review our Privacy Policy to
                proceed.
              </p>
            )}
            {state.fieldErrors?.terms && (
              <p id="proposal-terms-error" className="text-xs text-red-500">
                {state.fieldErrors.terms}
              </p>
            )}
          </div>
        </div>

        {/* Human verification */}
        <div className="space-y-2">
          {turnstileSiteKey ? (
            <div className="flex w-full items-center justify-start overflow-hidden">
              <div
                ref={turnstileContainerRef}
                className="max-w-full overflow-hidden"
              />
            </div>
          ) : (
            <p className="rounded-lg border border-red-300/40 bg-red-50/60 px-3 py-2 text-xs text-red-700">
              Human verification is not configured yet.
            </p>
          )}
          {captchaError && (
            <p className="mt-2 text-xs text-red-500">{captchaError}</p>
          )}
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            id="proposal-submit-btn"
            disabled={isSubmitDisabled}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-cta)] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-white shadow-[var(--shadow-button)] transition-all duration-200 hover:brightness-110 hover:shadow-[var(--shadow-button-hover)] focus:outline-none focus:ring-3 focus:ring-[rgba(241,122,30,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:hover:shadow-none"
          >
            {pending ? "Submitting..." : "Submit"}
            {!pending && (
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M4 10h12M11 6l4 4-4 4" />
              </svg>
            )}
          </button>
          <p className="mt-3 text-center text-xs text-[var(--text-faint)]">
            No commitment required. We&apos;ll respond within one business day.
          </p>
        </div>
      </form>
    </>
  );
}

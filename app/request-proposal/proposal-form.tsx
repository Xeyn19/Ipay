"use client";

import { supabase } from "@/app/lib/supabase";

import { useEffect, useState } from "react";
import Link from "next/link";

export function ProposalForm() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [hasReadPrivacy, setHasReadPrivacy] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // To prevent hydration mismatch for the checkbox text

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { data, error } = await supabase.from("leads").insert({
      name,
      company,
      email,
      message,
    });
    if (error) {
      console.error("Error submitting proposal request:", error);
    } else {
      setName("");
      setCompany("");
      setEmail("");
      setMessage("");
      console.log("Proposal request submitted successfully:", data);
    }
  }

  useEffect(() => {
    setIsMounted(true);
    // Check if the user has read the privacy policy
    const checkPrivacyStatus = () => {
      const status = sessionStorage.getItem("ipp_privacy_read") === "true";
      setHasReadPrivacy(status);
    };

    checkPrivacyStatus();

    // Listen for custom event in case they check it in another tab or the same window
    window.addEventListener("storage", checkPrivacyStatus);
    window.addEventListener("ipp_privacy_read", checkPrivacyStatus);

    return () => {
      window.removeEventListener("storage", checkPrivacyStatus);
      window.removeEventListener("ipp_privacy_read", checkPrivacyStatus);
    };
  }, []);

  return (
    <form id="proposal-request-form" onSubmit={handleSubmit} className="space-y-5" action="#" method="POST">
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
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Juan dela Cruz"
          className="w-full rounded-xl border border-[var(--border-light)] bg-[var(--bg-base)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none transition-all focus:border-[var(--brand)] focus:ring-3 focus:ring-[rgba(241,122,30,0.12)]"
        />
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
          onChange={(e) => setCompany(e.target.value)}
          required
          placeholder="Acme Corp"
          className="w-full rounded-xl border border-[var(--border-light)] bg-[var(--bg-base)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none transition-all focus:border-[var(--brand)] focus:ring-3 focus:ring-[rgba(241,122,30,0.12)]"
        />
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
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@company.com"
          className="w-full rounded-xl border border-[var(--border-light)] bg-[var(--bg-base)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none transition-all focus:border-[var(--brand)] focus:ring-3 focus:ring-[rgba(241,122,30,0.12)]"
        />
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
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
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
            title={!hasReadPrivacy ? "Please scroll through our Privacy Policy first" : ""}
            className="h-4 w-4 rounded border-[var(--border-medium)] text-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/40 focus:ring-offset-1 focus:ring-offset-[var(--bg-base)] disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="terms-checkbox"
            className={`text-xs leading-5 text-[var(--text-secondary)] ${!hasReadPrivacy ? "opacity-70" : ""}`}
          >
            By checking this box, you confirm that you have read and agree to our <strong>Terms of Use</strong> and that you consent to our processing of your Personal Data in accordance with our <Link href="/privacy-policy" className="text-[var(--text-primary)] underline hover:text-[var(--brand)]"><strong>Privacy Policy</strong></Link>.
          </label>

          {/* Helper text shown only on client side if not read yet */}
          {isMounted && !hasReadPrivacy && (
            <p className="text-[0.65rem] font-medium text-orange-500/80">
              For compliance purposes, kindly review our Privacy Policy to proceed.
            </p>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          id="proposal-submit-btn"
          disabled={!hasReadPrivacy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-cta)] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-white shadow-[var(--shadow-button)] transition-all duration-200 hover:brightness-110 hover:shadow-[var(--shadow-button-hover)] focus:outline-none focus:ring-3 focus:ring-[rgba(241,122,30,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:hover:shadow-none"
        >
          Submit
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
            <path d="M4 10h12M11 6l4 4-4 4" />
          </svg>
        </button>
        <p className="mt-3 text-center text-xs text-[var(--text-faint)]">
          No commitment required. We&apos;ll respond within one business day.
        </p>
      </div>
    </form>
  );
}

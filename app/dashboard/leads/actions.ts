"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/app/lib/supabase-admin";
import { sendResendEmail } from "@/app/lib/resend";
import { createClient } from "@/app/lib/supabase-server";

type LeadRecord = {
  auto_reply_last_error?: string | null;
  auto_reply_message_id?: string | null;
  auto_reply_sent_at?: string | null;
  auto_reply_sent_by?: string | null;
  auto_reply_status?: string | null;
  auto_reply_subject?: string | null;
  company?: string | null;
  email?: string | null;
  id: number;
  name?: string | null;
};

export type SendAutoReplyResult = {
  lead?: Pick<
    LeadRecord,
    | "auto_reply_last_error"
    | "auto_reply_message_id"
    | "auto_reply_sent_at"
    | "auto_reply_sent_by"
    | "auto_reply_status"
    | "auto_reply_subject"
    | "id"
  >;
  message: string;
  status: "error" | "success";
};

const AUTO_REPLY_SUBJECT = "Thanks for reaching out to iPay";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getGreeting(name: string | null | undefined) {
  return name?.trim() ? `Hi ${name.trim()},` : "Hi,";
}

function buildAutoReplyMessage(lead: LeadRecord) {
  const greeting = getGreeting(lead.name);
  const companyLine = lead.company?.trim()
    ? `We have received your request for ${lead.company.trim()}.`
    : "We have received your request proposal.";
  const replyTo = process.env.RESEND_REPLY_TO_EMAIL?.trim() || "our team";

  const text = [
    greeting,
    "",
    "Thank you for reaching out to iPay.",
    companyLine,
    "Our team is reviewing the details and will follow up with you soon.",
    `If you need to add anything else, reply to this email and it will go to ${replyTo}.`,
    "",
    "Regards,",
    "iPay Team",
  ].join("\n");

  const html = [
    `<p>${escapeHtml(greeting)}</p>`,
    "<p>Thank you for reaching out to iPay.</p>",
    `<p>${escapeHtml(companyLine)}</p>`,
    "<p>Our team is reviewing the details and will follow up with you soon.</p>",
    `<p>If you need to add anything else, reply to this email and it will go to ${escapeHtml(replyTo)}.</p>`,
    "<p>Regards,<br />iPay Team</p>",
  ].join("");

  return { html, text };
}

async function getAuthenticatedUserId() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  return user.id;
}

async function markLeadReplyFailed(leadId: number, userId: string, message: string) {
  const admin = createAdminClient();
  const truncatedMessage = message.slice(0, 500);

  const { data, error } = await admin
    .from("leads")
    .update({
      auto_reply_last_error: truncatedMessage,
      auto_reply_sent_by: userId,
      auto_reply_status: "failed",
      auto_reply_subject: AUTO_REPLY_SUBJECT,
    })
    .eq("id", leadId)
    .select(
      "id, auto_reply_status, auto_reply_sent_at, auto_reply_message_id, auto_reply_subject, auto_reply_sent_by, auto_reply_last_error"
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as SendAutoReplyResult["lead"];
}

export async function sendLeadAutoReply(
  leadId: number
): Promise<SendAutoReplyResult> {
  if (!Number.isInteger(leadId) || leadId <= 0) {
    return {
      message: "Invalid lead selection.",
      status: "error",
    };
  }

  let userId: string;

  try {
    userId = await getAuthenticatedUserId();
  } catch {
    return {
      message: "You must be signed in to send replies.",
      status: "error",
    };
  }

  const admin = createAdminClient();
  const { data: lead, error } = await admin
    .from("leads")
    .select(
      "id, name, company, email, auto_reply_status, auto_reply_sent_at, auto_reply_message_id, auto_reply_subject, auto_reply_sent_by, auto_reply_last_error"
    )
    .eq("id", leadId)
    .single();

  if (error || !lead) {
    return {
      message: "Lead not found.",
      status: "error",
    };
  }

  const leadRecord = lead as LeadRecord;
  const recipientEmail = leadRecord.email?.trim().toLowerCase();

  if (!recipientEmail) {
    return {
      message: "This lead does not have an email address.",
      status: "error",
    };
  }

  if (leadRecord.auto_reply_sent_at) {
    return {
      lead: {
        auto_reply_last_error: leadRecord.auto_reply_last_error ?? null,
        auto_reply_message_id: leadRecord.auto_reply_message_id ?? null,
        auto_reply_sent_at: leadRecord.auto_reply_sent_at,
        auto_reply_sent_by: leadRecord.auto_reply_sent_by ?? null,
        auto_reply_status: leadRecord.auto_reply_status ?? "sent",
        auto_reply_subject:
          leadRecord.auto_reply_subject ?? AUTO_REPLY_SUBJECT,
        id: leadRecord.id,
      },
      message: "An auto reply was already sent for this lead.",
      status: "error",
    };
  }

  if (leadRecord.auto_reply_status === "sending") {
    return {
      lead: {
        auto_reply_last_error: leadRecord.auto_reply_last_error ?? null,
        auto_reply_message_id: leadRecord.auto_reply_message_id ?? null,
        auto_reply_sent_at: leadRecord.auto_reply_sent_at ?? null,
        auto_reply_sent_by: leadRecord.auto_reply_sent_by ?? null,
        auto_reply_status: "sending",
        auto_reply_subject:
          leadRecord.auto_reply_subject ?? AUTO_REPLY_SUBJECT,
        id: leadRecord.id,
      },
      message: "An auto reply is already being sent for this lead.",
      status: "error",
    };
  }

  const { data: sendingLead, error: sendingError } = await admin
    .from("leads")
    .update({
      auto_reply_last_error: null,
      auto_reply_sent_by: userId,
      auto_reply_status: "sending",
      auto_reply_subject: AUTO_REPLY_SUBJECT,
    })
    .eq("id", leadId)
    .select(
      "id, auto_reply_status, auto_reply_sent_at, auto_reply_message_id, auto_reply_subject, auto_reply_sent_by, auto_reply_last_error"
    )
    .single();

  if (sendingError) {
    return {
      message: sendingError.message,
      status: "error",
    };
  }

  try {
    const { html, text } = buildAutoReplyMessage(leadRecord);
    const response = await sendResendEmail({
      html,
      idempotencyKey: `lead-auto-reply-${leadId}`,
      subject: AUTO_REPLY_SUBJECT,
      text,
      to: recipientEmail,
    });

    const { data: updatedLead, error: updateError } = await admin
      .from("leads")
      .update({
        auto_reply_last_error: null,
        auto_reply_message_id: response.id,
        auto_reply_sent_at: new Date().toISOString(),
        auto_reply_sent_by: userId,
        auto_reply_status: "sent",
        auto_reply_subject: AUTO_REPLY_SUBJECT,
      })
      .eq("id", leadId)
      .select(
        "id, auto_reply_status, auto_reply_sent_at, auto_reply_message_id, auto_reply_subject, auto_reply_sent_by, auto_reply_last_error"
      )
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    revalidatePath("/dashboard/leads");

    return {
      lead: updatedLead as SendAutoReplyResult["lead"],
      message: "Auto reply sent successfully.",
      status: "success",
    };
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Auto reply could not be sent.";

    const failedLead = await markLeadReplyFailed(leadId, userId, message);

    return {
      lead:
        failedLead ??
        (sendingLead as SendAutoReplyResult["lead"]) ??
        undefined,
      message,
      status: "error",
    };
  }
}

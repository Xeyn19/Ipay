import "server-only";

import { sendAutoReplyEmail } from "@/app/lib/mailer";
import { createAdminClient } from "@/app/lib/supabase-admin";

export type LeadAutoReplyRecord = {
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

export type LeadAutoReplyState = Pick<
  LeadAutoReplyRecord,
  | "auto_reply_last_error"
  | "auto_reply_message_id"
  | "auto_reply_sent_at"
  | "auto_reply_sent_by"
  | "auto_reply_status"
  | "auto_reply_subject"
  | "id"
>;

export type SendLeadAutoReplyResult = {
  lead?: LeadAutoReplyState;
  message: string;
  status: "error" | "success";
};

type SendLeadAutoReplyOptions = {
  actorUserId?: string | null;
  idempotencyKey?: string;
};

export const AUTO_REPLY_SUBJECT = "Thanks for reaching out to iPay";

const leadAutoReplyStateSelect =
  "id, auto_reply_status, auto_reply_sent_at, auto_reply_message_id, auto_reply_subject, auto_reply_sent_by, auto_reply_last_error";

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

function buildAutoReplyMessage(lead: LeadAutoReplyRecord) {
  const greeting = getGreeting(lead.name);
  const companyLine = lead.company?.trim()
    ? `We have received your request for ${lead.company.trim()}.`
    : "We have received your request proposal.";
  const replyTo = process.env.AUTO_REPLY_REPLY_TO_EMAIL?.trim() || "our team";

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

function serializeLeadState(lead: LeadAutoReplyRecord): LeadAutoReplyState {
  return {
    auto_reply_last_error: lead.auto_reply_last_error ?? null,
    auto_reply_message_id: lead.auto_reply_message_id ?? null,
    auto_reply_sent_at: lead.auto_reply_sent_at ?? null,
    auto_reply_sent_by: lead.auto_reply_sent_by ?? null,
    auto_reply_status:
      lead.auto_reply_status ?? (lead.auto_reply_sent_at ? "sent" : null),
    auto_reply_subject: lead.auto_reply_subject ?? AUTO_REPLY_SUBJECT,
    id: lead.id,
  };
}

async function markLeadReplyFailed(
  leadId: number,
  actorUserId: string | null,
  message: string
) {
  const admin = createAdminClient();
  const truncatedMessage = message.slice(0, 500);

  const { data, error } = await admin
    .from("leads")
    .update({
      auto_reply_last_error: truncatedMessage,
      auto_reply_sent_by: actorUserId,
      auto_reply_status: "failed",
      auto_reply_subject: AUTO_REPLY_SUBJECT,
    })
    .eq("id", leadId)
    .select(leadAutoReplyStateSelect)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as LeadAutoReplyState;
}

export async function sendLeadAutoReplyForLead(
  lead: LeadAutoReplyRecord,
  {
    actorUserId = null,
    idempotencyKey = `lead-auto-reply-${lead.id}`,
  }: SendLeadAutoReplyOptions = {}
): Promise<SendLeadAutoReplyResult> {
  const recipientEmail = lead.email?.trim().toLowerCase();

  if (!recipientEmail) {
    return {
      message: "This lead does not have an email address.",
      status: "error",
    };
  }

  if (lead.auto_reply_sent_at) {
    return {
      lead: serializeLeadState(lead),
      message: "An auto reply was already sent for this lead.",
      status: "error",
    };
  }

  if (lead.auto_reply_status === "sending") {
    return {
      lead: serializeLeadState({
        ...lead,
        auto_reply_status: "sending",
      }),
      message: "An auto reply is already being sent for this lead.",
      status: "error",
    };
  }

  const admin = createAdminClient();
  const { data: sendingLead, error: sendingError } = await admin
    .from("leads")
    .update({
      auto_reply_last_error: null,
      auto_reply_sent_by: actorUserId,
      auto_reply_status: "sending",
      auto_reply_subject: AUTO_REPLY_SUBJECT,
    })
    .eq("id", lead.id)
    .select(leadAutoReplyStateSelect)
    .single();

  if (sendingError) {
    return {
      message: sendingError.message,
      status: "error",
    };
  }

  try {
    const { html, text } = buildAutoReplyMessage(lead);
    const response = await sendAutoReplyEmail({
      html,
      idempotencyKey,
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
        auto_reply_sent_by: actorUserId,
        auto_reply_status: "sent",
        auto_reply_subject: AUTO_REPLY_SUBJECT,
      })
      .eq("id", lead.id)
      .select(leadAutoReplyStateSelect)
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    return {
      lead: updatedLead as LeadAutoReplyState,
      message: "Auto reply sent successfully.",
      status: "success",
    };
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Auto reply could not be sent.";
    let failedLead: LeadAutoReplyState | undefined;

    try {
      failedLead = await markLeadReplyFailed(lead.id, actorUserId, message);
    } catch (markFailedError) {
      console.error("Unable to record auto reply failure.", markFailedError);
    }

    return {
      lead: failedLead ?? (sendingLead as LeadAutoReplyState) ?? undefined,
      message,
      status: "error",
    };
  }
}

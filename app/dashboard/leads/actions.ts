"use server";

import { revalidatePath } from "next/cache";
import {
  LEAD_REPLY_ALLOWED_EXTENSIONS,
  LEAD_REPLY_ALLOWED_MIME_TYPES,
  LEAD_REPLY_MAX_ATTACHMENTS,
  LEAD_REPLY_MAX_FILE_SIZE_BYTES,
  LEAD_REPLY_MAX_MESSAGE_LENGTH,
  LEAD_REPLY_MAX_SUBJECT_LENGTH,
  LEAD_REPLY_MAX_TOTAL_SIZE_BYTES,
  LEAD_REPLY_TEMPLATE_MAX_LABEL_LENGTH,
  type LeadReplyAttachmentMetadata,
} from "@/app/dashboard/leads/reply-config";
import {
  sendLeadAutoReplyForLead,
  type LeadAutoReplyRecord,
  type SendLeadAutoReplyResult,
} from "@/app/lib/lead-auto-reply";
import { sendEmail } from "@/app/lib/mailer";
import { createAdminClient } from "@/app/lib/supabase-admin";
import { createClient } from "@/app/lib/supabase-server";
import {
  getBuiltInLeadReplyTemplates,
  mapCustomLeadReplyTemplate,
  type LeadReplyTemplateDefinition,
  type LeadReplyTemplateRecord,
} from "./reply-templates";

export type SendAutoReplyResult = SendLeadAutoReplyResult;
export type SendLeadReplyResult = {
  fieldErrors?: Partial<Record<"attachments" | "message" | "subject", string>>;
  message: string;
  status: "error" | "success";
};

export type CreateLeadReplyTemplateResult = {
  fieldErrors?: Partial<Record<"label" | "message" | "subject", string>>;
  message: string;
  status: "error" | "success";
  template?: LeadReplyTemplateDefinition;
};

type LeadMutationPayload = {
  id: number;
  read_at: string | null;
  trashed_at: string | null;
};

type LeadMutationResult = {
  lead?: LeadMutationPayload;
  message: string;
  status: "error" | "success";
};

type BulkLeadMutationResult = {
  deletedLeadIds?: number[];
  message: string;
  status: "error" | "success";
  updatedLeads?: LeadMutationPayload[];
};

type ParsedReplyAttachment = {
  content: Buffer;
  metadata: LeadReplyAttachmentMetadata;
};

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

function getUniqueLeadIds(leadIds: number[]) {
  return [...new Set(leadIds.filter((leadId) => Number.isInteger(leadId) && leadId > 0))];
}

function formatRequestCount(count: number) {
  return `${count} request${count === 1 ? "" : "s"}`;
}

function revalidateLeadPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");
}

function revalidateLeadReplyTemplatePaths() {
  revalidateLeadPaths();
  revalidatePath("/dashboard/leads/[leadId]/reply", "page");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildReplyHtml(message: string) {
  const lines = escapeHtml(message).split("\n");
  return `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#0f172a;white-space:pre-wrap;">${lines.join("<br />")}</div>`;
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getAttachmentExtension(filename: string) {
  const segments = filename.split(".");
  return segments.length > 1 ? segments.at(-1)?.toLowerCase() ?? "" : "";
}

function formatFileSize(bytes: number) {
  const megabytes = bytes / (1024 * 1024);

  if (megabytes >= 1) {
    return `${megabytes.toFixed(megabytes >= 10 ? 0 : 1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function getReplyFromEmail() {
  return (
    process.env.MANUAL_REPLY_FROM_EMAIL?.trim() ||
    process.env.AUTO_REPLY_FROM_EMAIL?.trim() ||
    ""
  );
}

function getReplyToEmail() {
  return (
    process.env.MANUAL_REPLY_REPLY_TO_EMAIL?.trim() ||
    process.env.AUTO_REPLY_REPLY_TO_EMAIL?.trim() ||
    getReplyFromEmail()
  );
}

function isMissingLeadReplyTemplatesTableError(message: string | undefined) {
  if (!message) {
    return false;
  }

  const normalizedMessage = message.toLowerCase();

  return (
    normalizedMessage.includes("lead_reply_templates") &&
    (normalizedMessage.includes("schema cache") ||
      normalizedMessage.includes("does not exist") ||
      normalizedMessage.includes("could not find the table") ||
      normalizedMessage.includes("relation"))
  );
}

async function parseReplyAttachments(
  formData: FormData
): Promise<
  | {
      attachments: ParsedReplyAttachment[];
      fieldError?: undefined;
    }
  | {
      attachments: [];
      fieldError: string;
    }
> {
  const files = formData
    .getAll("attachments")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (files.length === 0) {
    return {
      attachments: [],
    };
  }

  if (files.length > LEAD_REPLY_MAX_ATTACHMENTS) {
    return {
      attachments: [],
      fieldError: `You can attach up to ${LEAD_REPLY_MAX_ATTACHMENTS} files.`,
    };
  }

  const parsedAttachments: ParsedReplyAttachment[] = [];
  let totalSize = 0;

  for (const file of files) {
    const filename = file.name.trim();
    const extension = getAttachmentExtension(filename);
    const mimeType = file.type.trim().toLowerCase();

    if (!filename) {
      return {
        attachments: [],
        fieldError: "Each attachment must have a file name.",
      };
    }

    if (!LEAD_REPLY_ALLOWED_EXTENSIONS.includes(extension as (typeof LEAD_REPLY_ALLOWED_EXTENSIONS)[number])) {
      return {
        attachments: [],
        fieldError:
          "One or more attachments use an unsupported file type. Please upload common document, archive, or image files only.",
      };
    }

    if (
      mimeType &&
      !LEAD_REPLY_ALLOWED_MIME_TYPES.includes(
        mimeType as (typeof LEAD_REPLY_ALLOWED_MIME_TYPES)[number]
      )
    ) {
      return {
        attachments: [],
        fieldError:
          "One or more attachments use an unsupported file type. Please upload common document, archive, or image files only.",
      };
    }

    if (file.size > LEAD_REPLY_MAX_FILE_SIZE_BYTES) {
      return {
        attachments: [],
        fieldError: `${filename} exceeds the ${formatFileSize(
          LEAD_REPLY_MAX_FILE_SIZE_BYTES
        )} file size limit.`,
      };
    }

    totalSize += file.size;

    if (totalSize > LEAD_REPLY_MAX_TOTAL_SIZE_BYTES) {
      return {
        attachments: [],
        fieldError: `Attachments exceed the ${formatFileSize(
          LEAD_REPLY_MAX_TOTAL_SIZE_BYTES
        )} total size limit.`,
      };
    }

    parsedAttachments.push({
      content: Buffer.from(await file.arrayBuffer()),
      metadata: {
        filename,
        mimeType: mimeType || "application/octet-stream",
        size: file.size,
      },
    });
  }

  return {
    attachments: parsedAttachments,
  };
}

async function getLeadById(admin: ReturnType<typeof createAdminClient>, leadId: number) {
  return admin
    .from("leads")
    .select("id, read_at, trashed_at")
    .eq("id", leadId)
    .single();
}

async function getLeadsByIds(
  admin: ReturnType<typeof createAdminClient>,
  leadIds: number[]
) {
  return admin
    .from("leads")
    .select("id, read_at, trashed_at")
    .in("id", leadIds);
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

  const result = await sendLeadAutoReplyForLead(lead as LeadAutoReplyRecord, {
    actorUserId: userId,
    idempotencyKey: `lead-auto-reply-${leadId}`,
  });

  if (result.status === "success") {
    revalidatePath("/dashboard/leads");
  }

  return result;
}

export async function sendLeadReply(
  formData: FormData
): Promise<SendLeadReplyResult> {
  const leadId = Number(getFormValue(formData, "leadId"));
  const templateKey = getFormValue(formData, "templateKey");
  const subject = getFormValue(formData, "subject");
  const message = getFormValue(formData, "message");
  const fieldErrors: SendLeadReplyResult["fieldErrors"] = {};

  if (!Number.isInteger(leadId) || leadId <= 0) {
    return {
      message: "Invalid lead selection.",
      status: "error",
    };
  }

  if (!subject || subject.length > LEAD_REPLY_MAX_SUBJECT_LENGTH) {
    fieldErrors.subject = "Enter a subject line before sending.";
  }

  if (!message || message.length > LEAD_REPLY_MAX_MESSAGE_LENGTH) {
    fieldErrors.message = "Enter your reply message before sending.";
  }

  const parsedAttachments = await parseReplyAttachments(formData);

  if (parsedAttachments.fieldError) {
    fieldErrors.attachments = parsedAttachments.fieldError;
  }

  if (fieldErrors.subject || fieldErrors.message || fieldErrors.attachments) {
    return {
      fieldErrors,
      message: "Please review the reply form and try again.",
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

  const from = getReplyFromEmail();
  const replyTo = getReplyToEmail();

  if (!from) {
    return {
      message: "Reply email settings are not configured.",
      status: "error",
    };
  }

  const admin = createAdminClient();
  const { data: lead, error } = await admin
    .from("leads")
    .select("id, email, name, company")
    .eq("id", leadId)
    .single();

  if (error || !lead) {
    return {
      message: "Lead not found.",
      status: "error",
    };
  }

  const recipientEmail =
    typeof lead.email === "string" ? lead.email.trim().toLowerCase() : "";

  if (!recipientEmail) {
    return {
      message: "This lead does not have an email address.",
      status: "error",
    };
  }

  const attachmentMetadata = parsedAttachments.attachments.map(
    (attachment) => attachment.metadata
  );
  const sentAt = new Date().toISOString();

  try {
    const response = await sendEmail({
      attachments: parsedAttachments.attachments.map((attachment) => ({
        content: attachment.content,
        contentType: attachment.metadata.mimeType,
        filename: attachment.metadata.filename,
      })),
      from,
      html: buildReplyHtml(message),
      idempotencyKey: `lead-manual-reply-${leadId}-${Date.now()}`,
      replyTo,
      subject,
      text: message,
      to: recipientEmail,
    });

    const { error: insertError } = await admin.from("lead_replies").insert({
      attachment_metadata: attachmentMetadata,
      error_message: null,
      lead_id: leadId,
      message_text: message,
      recipient_email: recipientEmail,
      sender_user_id: userId,
      sent_at: sentAt,
      smtp_message_id: response.id,
      status: "sent",
      subject,
      template_key: templateKey || null,
    });

    if (insertError) {
      console.error("Unable to record sent lead reply.", insertError);
    }

    revalidateLeadPaths();

    return {
      message: "Reply sent successfully.",
      status: "success",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error && error.message
        ? error.message
        : "Reply could not be sent.";

    const { error: insertError } = await admin.from("lead_replies").insert({
      attachment_metadata: attachmentMetadata,
      error_message: errorMessage.slice(0, 500),
      lead_id: leadId,
      message_text: message,
      recipient_email: recipientEmail,
      sender_user_id: userId,
      sent_at: null,
      smtp_message_id: null,
      status: "failed",
      subject,
      template_key: templateKey || null,
    });

    if (insertError) {
      console.error("Unable to record failed lead reply.", insertError);
    }

    return {
      message: errorMessage,
      status: "error",
    };
  }
}

export async function createLeadReplyTemplate(
  formData: FormData
): Promise<CreateLeadReplyTemplateResult> {
  const label = getFormValue(formData, "label");
  const subject = getFormValue(formData, "subject");
  const message = getFormValue(formData, "message");
  const sourceTemplateKey = getFormValue(formData, "sourceTemplateKey") || null;
  const fieldErrors: CreateLeadReplyTemplateResult["fieldErrors"] = {};

  if (!label || label.length > LEAD_REPLY_TEMPLATE_MAX_LABEL_LENGTH) {
    fieldErrors.label = `Enter a template name up to ${LEAD_REPLY_TEMPLATE_MAX_LABEL_LENGTH} characters.`;
  }

  if (!subject || subject.length > LEAD_REPLY_MAX_SUBJECT_LENGTH) {
    fieldErrors.subject = "Enter a subject before saving this template.";
  }

  if (!message || message.length > LEAD_REPLY_MAX_MESSAGE_LENGTH) {
    fieldErrors.message = "Enter a message before saving this template.";
  }

  if (fieldErrors.label || fieldErrors.subject || fieldErrors.message) {
    return {
      fieldErrors,
      message: "Please review the template details and try again.",
      status: "error",
    };
  }

  let userId: string;

  try {
    userId = await getAuthenticatedUserId();
  } catch {
    return {
      message: "You must be signed in to save templates.",
      status: "error",
    };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("lead_reply_templates")
    .insert({
      label,
      message_text: message,
      source_template_key: sourceTemplateKey,
      subject,
      user_id: userId,
    })
    .select("id, label, subject, message_text, source_template_key, created_at")
    .single();

  if (error || !data) {
    return {
      message: isMissingLeadReplyTemplatesTableError(error?.message)
        ? "Saved templates are not available yet. Apply the latest lead reply template migration first."
        : error?.message ?? "Template could not be saved.",
      status: "error",
    };
  }

  revalidateLeadReplyTemplatePaths();

  return {
    message: "Template saved.",
    status: "success",
    template: mapCustomLeadReplyTemplate(
      data as LeadReplyTemplateRecord,
      getBuiltInLeadReplyTemplates({})
    ),
  };
}

export async function markLeadAsRead(
  leadId: number
): Promise<LeadMutationResult> {
  if (!Number.isInteger(leadId) || leadId <= 0) {
    return {
      message: "Invalid lead selection.",
      status: "error",
    };
  }

  try {
    await getAuthenticatedUserId();
  } catch {
    return {
      message: "You must be signed in to update read status.",
      status: "error",
    };
  }

  const admin = createAdminClient();
  const { data: lead, error } = await getLeadById(admin, leadId);

  if (error || !lead) {
    return {
      message: "Lead not found.",
      status: "error",
    };
  }

  if (lead.trashed_at) {
    return {
      message: "Restore the lead before changing its read status.",
      status: "error",
    };
  }

  if (lead.read_at) {
    return {
      lead: lead as LeadMutationPayload,
      message: "Lead is already marked as read.",
      status: "success",
    };
  }

  const { data: updatedLead, error: updateError } = await admin
    .from("leads")
    .update({
      read_at: new Date().toISOString(),
    })
    .eq("id", leadId)
    .select("id, read_at, trashed_at")
    .single();

  if (updateError || !updatedLead) {
    return {
      message: updateError?.message ?? "Read status could not be updated.",
      status: "error",
    };
  }

  revalidateLeadPaths();

  return {
    lead: updatedLead as LeadMutationPayload,
    message: "Marked as read.",
    status: "success",
  };
}

export async function markLeadAsUnread(
  leadId: number
): Promise<LeadMutationResult> {
  if (!Number.isInteger(leadId) || leadId <= 0) {
    return {
      message: "Invalid lead selection.",
      status: "error",
    };
  }

  try {
    await getAuthenticatedUserId();
  } catch {
    return {
      message: "You must be signed in to update read status.",
      status: "error",
    };
  }

  const admin = createAdminClient();
  const { data: lead, error } = await getLeadById(admin, leadId);

  if (error || !lead) {
    return {
      message: "Lead not found.",
      status: "error",
    };
  }

  if (lead.trashed_at) {
    return {
      message: "Restore the lead before changing its read status.",
      status: "error",
    };
  }

  if (!lead.read_at) {
    return {
      lead: lead as LeadMutationPayload,
      message: "Lead is already unread.",
      status: "success",
    };
  }

  const { data: updatedLead, error: updateError } = await admin
    .from("leads")
    .update({
      read_at: null,
    })
    .eq("id", leadId)
    .select("id, read_at, trashed_at")
    .single();

  if (updateError || !updatedLead) {
    return {
      message: updateError?.message ?? "Read status could not be updated.",
      status: "error",
    };
  }

  revalidateLeadPaths();

  return {
    lead: updatedLead as LeadMutationPayload,
    message: "Marked as unread.",
    status: "success",
  };
}

export async function archiveLead(leadId: number): Promise<LeadMutationResult> {
  if (!Number.isInteger(leadId) || leadId <= 0) {
    return {
      message: "Invalid lead selection.",
      status: "error",
    };
  }

  try {
    await getAuthenticatedUserId();
  } catch {
    return {
      message: "You must be signed in to archive leads.",
      status: "error",
    };
  }

  const admin = createAdminClient();
  const { data: lead, error } = await getLeadById(admin, leadId);

  if (error || !lead) {
    return {
      message: "Lead not found.",
      status: "error",
    };
  }

  if (lead.trashed_at) {
    return {
      lead: lead as LeadMutationPayload,
      message: "Lead is already archived.",
      status: "success",
    };
  }

  const { data: updatedLead, error: updateError } = await admin
    .from("leads")
    .update({
      trashed_at: new Date().toISOString(),
    })
    .eq("id", leadId)
    .select("id, read_at, trashed_at")
    .single();

  if (updateError || !updatedLead) {
    return {
      message: updateError?.message ?? "Lead could not be archived.",
      status: "error",
    };
  }

  revalidateLeadPaths();

  return {
    lead: updatedLead as LeadMutationPayload,
    message: "Lead archived.",
    status: "success",
  };
}

export async function restoreLead(leadId: number): Promise<LeadMutationResult> {
  if (!Number.isInteger(leadId) || leadId <= 0) {
    return {
      message: "Invalid lead selection.",
      status: "error",
    };
  }

  try {
    await getAuthenticatedUserId();
  } catch {
    return {
      message: "You must be signed in to restore leads.",
      status: "error",
    };
  }

  const admin = createAdminClient();
  const { data: lead, error } = await getLeadById(admin, leadId);

  if (error || !lead) {
    return {
      message: "Lead not found.",
      status: "error",
    };
  }

  if (!lead.trashed_at) {
    return {
      lead: lead as LeadMutationPayload,
      message: "Lead is already active.",
      status: "success",
    };
  }

  const { data: updatedLead, error: updateError } = await admin
    .from("leads")
    .update({
      trashed_at: null,
    })
    .eq("id", leadId)
    .select("id, read_at, trashed_at")
    .single();

  if (updateError || !updatedLead) {
    return {
      message: updateError?.message ?? "Lead could not be restored.",
      status: "error",
    };
  }

  revalidateLeadPaths();

  return {
    lead: updatedLead as LeadMutationPayload,
    message: "Lead restored from archive.",
    status: "success",
  };
}

export async function permanentlyDeleteLead(
  leadId: number
): Promise<{ leadId?: number; message: string; status: "error" | "success" }> {
  if (!Number.isInteger(leadId) || leadId <= 0) {
    return {
      message: "Invalid lead selection.",
      status: "error",
    };
  }

  try {
    await getAuthenticatedUserId();
  } catch {
    return {
      message: "You must be signed in to permanently delete leads.",
      status: "error",
    };
  }

  const admin = createAdminClient();
  const { data: lead, error } = await admin
    .from("leads")
    .select("id, trashed_at")
    .eq("id", leadId)
    .single();

  if (error || !lead) {
    return {
      message: "Lead not found.",
      status: "error",
    };
  }

  if (!lead.trashed_at) {
    return {
      message: "Move the lead to archive before deleting it permanently.",
      status: "error",
    };
  }

  const { error: deleteError } = await admin
    .from("leads")
    .delete()
    .eq("id", leadId);

  if (deleteError) {
    return {
      message: deleteError.message || "Lead could not be deleted permanently.",
      status: "error",
    };
  }

  revalidateLeadPaths();

  return {
    leadId,
    message: "Lead permanently deleted.",
    status: "success",
  };
}

export async function bulkArchiveLeads(
  leadIds: number[]
): Promise<BulkLeadMutationResult> {
  const uniqueLeadIds = getUniqueLeadIds(leadIds);

  if (uniqueLeadIds.length === 0) {
    return {
      message: "Invalid lead selection.",
      status: "error",
    };
  }

  try {
    await getAuthenticatedUserId();
  } catch {
    return {
      message: "You must be signed in to archive leads.",
      status: "error",
    };
  }

  const admin = createAdminClient();
  const { data: leads, error } = await getLeadsByIds(admin, uniqueLeadIds);

  if (error || !leads?.length) {
    return {
      message: "No matching leads were found.",
      status: "error",
    };
  }

  const actionableLeadIds = leads
    .filter((lead) => !lead.trashed_at)
    .map((lead) => lead.id);

  if (actionableLeadIds.length === 0) {
    return {
      message: "Selected requests are already archived.",
      status: "success",
      updatedLeads: leads as LeadMutationPayload[],
    };
  }

  const { data: updatedLeads, error: updateError } = await admin
    .from("leads")
    .update({
      trashed_at: new Date().toISOString(),
    })
    .in("id", actionableLeadIds)
    .select("id, read_at, trashed_at");

  if (updateError || !updatedLeads) {
    return {
      message: updateError?.message ?? "Selected requests could not be archived.",
      status: "error",
    };
  }

  revalidateLeadPaths();

  return {
    message: `Archived ${formatRequestCount(updatedLeads.length)}.`,
    status: "success",
    updatedLeads: updatedLeads as LeadMutationPayload[],
  };
}

export async function bulkRestoreLeads(
  leadIds: number[]
): Promise<BulkLeadMutationResult> {
  const uniqueLeadIds = getUniqueLeadIds(leadIds);

  if (uniqueLeadIds.length === 0) {
    return {
      message: "Invalid lead selection.",
      status: "error",
    };
  }

  try {
    await getAuthenticatedUserId();
  } catch {
    return {
      message: "You must be signed in to restore leads.",
      status: "error",
    };
  }

  const admin = createAdminClient();
  const { data: leads, error } = await getLeadsByIds(admin, uniqueLeadIds);

  if (error || !leads?.length) {
    return {
      message: "No matching leads were found.",
      status: "error",
    };
  }

  const actionableLeadIds = leads
    .filter((lead) => Boolean(lead.trashed_at))
    .map((lead) => lead.id);

  if (actionableLeadIds.length === 0) {
    return {
      message: "Selected requests are already active.",
      status: "success",
      updatedLeads: leads as LeadMutationPayload[],
    };
  }

  const { data: updatedLeads, error: updateError } = await admin
    .from("leads")
    .update({
      trashed_at: null,
    })
    .in("id", actionableLeadIds)
    .select("id, read_at, trashed_at");

  if (updateError || !updatedLeads) {
    return {
      message: updateError?.message ?? "Selected requests could not be restored.",
      status: "error",
    };
  }

  revalidateLeadPaths();

  return {
    message: `Restored ${formatRequestCount(updatedLeads.length)}.`,
    status: "success",
    updatedLeads: updatedLeads as LeadMutationPayload[],
  };
}

export async function bulkPermanentlyDeleteLeads(
  leadIds: number[]
): Promise<BulkLeadMutationResult> {
  const uniqueLeadIds = getUniqueLeadIds(leadIds);

  if (uniqueLeadIds.length === 0) {
    return {
      message: "Invalid lead selection.",
      status: "error",
    };
  }

  try {
    await getAuthenticatedUserId();
  } catch {
    return {
      message: "You must be signed in to permanently delete leads.",
      status: "error",
    };
  }

  const admin = createAdminClient();
  const { data: leads, error } = await admin
    .from("leads")
    .select("id, trashed_at")
    .in("id", uniqueLeadIds);

  if (error || !leads?.length) {
    return {
      message: "No matching leads were found.",
      status: "error",
    };
  }

  const actionableLeadIds = leads
    .filter((lead) => Boolean(lead.trashed_at))
    .map((lead) => lead.id);

  if (actionableLeadIds.length === 0) {
    return {
      message: "Only archived requests can be deleted permanently.",
      status: "error",
    };
  }

  const { error: deleteError } = await admin
    .from("leads")
    .delete()
    .in("id", actionableLeadIds);

  if (deleteError) {
    return {
      message:
        deleteError.message || "Selected requests could not be deleted permanently.",
      status: "error",
    };
  }

  revalidateLeadPaths();

  return {
    deletedLeadIds: actionableLeadIds,
    message: `Deleted ${formatRequestCount(actionableLeadIds.length)} permanently.`,
    status: "success",
  };
}

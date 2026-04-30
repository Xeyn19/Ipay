"use server";

import { revalidatePath } from "next/cache";
import {
  sendLeadAutoReplyForLead,
  type LeadAutoReplyRecord,
  type SendLeadAutoReplyResult,
} from "@/app/lib/lead-auto-reply";
import { createAdminClient } from "@/app/lib/supabase-admin";
import { createClient } from "@/app/lib/supabase-server";

export type SendAutoReplyResult = SendLeadAutoReplyResult;
export type ToggleLeadReadResult = {
  lead?: {
    id: number;
    read_at: string | null;
  };
  message: string;
  status: "error" | "success";
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

export async function toggleLeadReadStatus(
  leadId: number
): Promise<ToggleLeadReadResult> {
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
  const { data: lead, error } = await admin
    .from("leads")
    .select("id, read_at")
    .eq("id", leadId)
    .single();

  if (error || !lead) {
    return {
      message: "Lead not found.",
      status: "error",
    };
  }

  const nextReadAt = lead.read_at ? null : new Date().toISOString();
  const { data: updatedLead, error: updateError } = await admin
    .from("leads")
    .update({
      read_at: nextReadAt,
    })
    .eq("id", leadId)
    .select("id, read_at")
    .single();

  if (updateError || !updatedLead) {
    return {
      message: updateError?.message ?? "Read status could not be updated.",
      status: "error",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");

  return {
    lead: updatedLead as ToggleLeadReadResult["lead"],
    message: nextReadAt ? "Marked as read." : "Marked as unread.",
    status: "success",
  };
}

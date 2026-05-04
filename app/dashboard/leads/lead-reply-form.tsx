'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgePlus,
  Check,
  Mail,
  LoaderCircle,
  Paperclip,
  SendHorizontal,
  X,
} from "lucide-react";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";
import toast from "react-hot-toast";
import {
  LEAD_REPLY_ATTACHMENT_ACCEPT,
  LEAD_REPLY_MAX_ATTACHMENTS,
  LEAD_REPLY_MAX_FILE_SIZE_BYTES,
  LEAD_REPLY_MAX_MESSAGE_LENGTH,
  LEAD_REPLY_MAX_SUBJECT_LENGTH,
  LEAD_REPLY_MAX_TOTAL_SIZE_BYTES,
  LEAD_REPLY_TEMPLATE_MAX_LABEL_LENGTH,
} from "@/app/dashboard/leads/reply-config";
import type { LeadReplyTemplateDefinition } from "./reply-templates";
import { createLeadReplyTemplate, sendLeadReply } from "./actions";

type LeadReplyLead = {
  company?: string | null;
  email?: string | null;
  id: number;
  name?: string | null;
};

type ReplyFieldErrors = Partial<
  Record<"attachments" | "message" | "subject", string>
>;

const leadToastOptions = {
  position: "top-right" as const,
};

function getDefaultReplyDraftFromTemplates(
  templates: LeadReplyTemplateDefinition[]
) {
  const defaultTemplate = templates[0] ?? null;

  return {
    message: defaultTemplate?.message ?? "",
    subject: defaultTemplate?.subject ?? "",
    templateKey: defaultTemplate?.key ?? "",
  };
}

function formatAttachmentSize(bytes: number) {
  const megabytes = bytes / (1024 * 1024);

  if (megabytes >= 1) {
    return `${megabytes.toFixed(megabytes >= 10 ? 0 : 1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function LeadReplyForm({
  backHref,
  initialTemplates,
  lead,
}: {
  backHref: string;
  initialTemplates: LeadReplyTemplateDefinition[];
  lead: LeadReplyLead;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTemplateButtonRef = useRef<HTMLButtonElement>(null);
  const saveTemplateNameInputRef = useRef<HTMLInputElement>(null);
  const saveTemplateModalTitleId = useId();
  const saveTemplateModalDescriptionId = useId();
  const [replyTemplates, setReplyTemplates] = useState(initialTemplates);
  const defaultReplyDraft = getDefaultReplyDraftFromTemplates(initialTemplates);
  const [replyFeedback, setReplyFeedback] = useState<{
    message: string;
    status: "error" | "success";
  } | null>(null);
  const [replyFieldErrors, setReplyFieldErrors] = useState<ReplyFieldErrors>({});
  const [saveTemplateFieldErrors, setSaveTemplateFieldErrors] = useState<
    Partial<Record<"label" | "message" | "subject", string>>
  >({});
  const [saveTemplateFeedback, setSaveTemplateFeedback] = useState<{
    message: string;
    status: "error" | "success";
  } | null>(null);
  const [replyTemplateKey, setReplyTemplateKey] = useState(
    defaultReplyDraft.templateKey
  );
  const [replySubject, setReplySubject] = useState(defaultReplyDraft.subject);
  const [replyMessage, setReplyMessage] = useState(defaultReplyDraft.message);
  const [replyAttachments, setReplyAttachments] = useState<File[]>([]);
  const [isSendingReply, startReplyTransition] = useTransition();
  const [isSavingTemplate, startSaveTemplateTransition] = useTransition();
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [saveTemplateName, setSaveTemplateName] = useState("");
  const selectedLeadEmail = lead.email?.trim() ?? "";
  const canReply = Boolean(selectedLeadEmail);
  const selectedReplyTemplate =
    replyTemplates.find((template) => template.key === replyTemplateKey) ??
    replyTemplates[0] ??
    null;
  const builtInReplyTemplates = replyTemplates.filter(
    (template) => template.kind === "built-in"
  );
  const customReplyTemplates = replyTemplates.filter(
    (template) => template.kind === "custom"
  );

  useEffect(() => {
    if (!isSaveTemplateModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const triggerElement = saveTemplateButtonRef.current;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      saveTemplateNameInputRef.current?.focus();
      saveTemplateNameInputRef.current?.select();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSavingTemplate) {
        setIsSaveTemplateModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      triggerElement?.focus();
    };
  }, [isSaveTemplateModalOpen, isSavingTemplate]);

  function handleReplyTemplateChange(nextTemplateKey: string) {
    const nextTemplate =
      replyTemplates.find((template) => template.key === nextTemplateKey) ??
      replyTemplates[0];

    if (!nextTemplate) {
      return;
    }

    setReplyFeedback(null);
    setReplyFieldErrors({});
    setReplyTemplateKey(nextTemplate.key);
    setReplySubject(nextTemplate.subject);
    setReplyMessage(nextTemplate.message);
  }

  function getSuggestedTemplateName() {
    if (selectedReplyTemplate?.kind === "custom") {
      return selectedReplyTemplate.label;
    }

    if (selectedReplyTemplate?.label) {
      return `${selectedReplyTemplate.label} Copy`;
    }

    if (replySubject.trim()) {
      return replySubject.trim().slice(0, LEAD_REPLY_TEMPLATE_MAX_LABEL_LENGTH);
    }

    return "Custom reply template";
  }

  function openSaveTemplateModal() {
    setSaveTemplateFeedback(null);
    setSaveTemplateFieldErrors({});
    setSaveTemplateName(getSuggestedTemplateName());
    setIsSaveTemplateModalOpen(true);
  }

  function closeSaveTemplateModal() {
    if (isSavingTemplate) {
      return;
    }

    setIsSaveTemplateModalOpen(false);
  }

  function handleReplyAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFiles = Array.from(event.target.files ?? []);

    if (!nextFiles.length) {
      return;
    }

    const tooLargeFile = nextFiles.find(
      (file) => file.size > LEAD_REPLY_MAX_FILE_SIZE_BYTES
    );

    if (tooLargeFile) {
      setReplyFieldErrors((currentErrors) => ({
        ...currentErrors,
        attachments: `${tooLargeFile.name} exceeds the ${formatAttachmentSize(
          LEAD_REPLY_MAX_FILE_SIZE_BYTES
        )} file size limit.`,
      }));
      event.target.value = "";
      return;
    }

    const mergedFiles = [...replyAttachments, ...nextFiles];

    if (mergedFiles.length > LEAD_REPLY_MAX_ATTACHMENTS) {
      setReplyFieldErrors((currentErrors) => ({
        ...currentErrors,
        attachments: `You can attach up to ${LEAD_REPLY_MAX_ATTACHMENTS} files.`,
      }));
      event.target.value = "";
      return;
    }

    const totalSize = mergedFiles.reduce((sum, file) => sum + file.size, 0);

    if (totalSize > LEAD_REPLY_MAX_TOTAL_SIZE_BYTES) {
      setReplyFieldErrors((currentErrors) => ({
        ...currentErrors,
        attachments: `Attachments exceed the ${formatAttachmentSize(
          LEAD_REPLY_MAX_TOTAL_SIZE_BYTES
        )} total size limit.`,
      }));
      event.target.value = "";
      return;
    }

    setReplyFeedback(null);
    setReplyFieldErrors((currentErrors) => ({
      ...currentErrors,
      attachments: undefined,
    }));
    setReplyAttachments(mergedFiles);
    event.target.value = "";
  }

  function removeReplyAttachment(indexToRemove: number) {
    setReplyAttachments((currentFiles) =>
      currentFiles.filter((_, index) => index !== indexToRemove)
    );
    setReplyFieldErrors((currentErrors) => ({
      ...currentErrors,
      attachments: undefined,
    }));
  }

  function handleSaveTemplateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveTemplateFeedback(null);
    setSaveTemplateFieldErrors({});

    startSaveTemplateTransition(async () => {
      const formData = new FormData();
      formData.set("label", saveTemplateName);
      formData.set("subject", replySubject);
      formData.set("message", replyMessage);

      if (selectedReplyTemplate?.key) {
        formData.set("sourceTemplateKey", selectedReplyTemplate.key);
      }

      const result = await createLeadReplyTemplate(formData);

      if (result.fieldErrors) {
        setSaveTemplateFieldErrors(result.fieldErrors);
      }

      setSaveTemplateFeedback({
        message: result.message,
        status: result.status,
      });

      if (result.status !== "success" || !result.template) {
        toast.error(result.message, leadToastOptions);
        return;
      }

      const savedTemplate = result.template;

      setReplyTemplates((currentTemplates) => [
        ...currentTemplates.filter((template) => template.key !== savedTemplate.key),
        savedTemplate,
      ]);
      setReplyTemplateKey(savedTemplate.key);
      setIsSaveTemplateModalOpen(false);
      toast.success(result.message, leadToastOptions);
    });
  }

  function handleReplySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canReply) {
      return;
    }

    setReplyFieldErrors({});
    setReplyFeedback(null);

    startReplyTransition(async () => {
      const formData = new FormData();
      formData.set("leadId", String(lead.id));
      formData.set("templateKey", replyTemplateKey);
      formData.set("subject", replySubject);
      formData.set("message", replyMessage);

      replyAttachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const result = await sendLeadReply(formData);

      if (result.fieldErrors) {
        setReplyFieldErrors(result.fieldErrors);
      }

      setReplyFeedback({
        message: result.message,
        status: result.status,
      });

      if (result.status === "success") {
        toast.success(result.message, leadToastOptions);
        router.push(backHref);
        return;
      }

      toast.error(result.message, leadToastOptions);
    });
  }

  return (
    <div className="rounded-[28px] border border-[var(--border-light)] bg-[var(--bg-elevated)] shadow-[var(--shadow-card)]">
      <form onSubmit={handleReplySubmit}>
        <div className="px-5 py-5 sm:px-6">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)]">
            <aside className="space-y-4 rounded-2xl border border-[var(--border-light)] bg-[var(--bg-subtle)]/70 p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                  Recipient
                </p>
                <div className="mt-3 flex items-start gap-3 rounded-2xl border border-[var(--border-light)] bg-[var(--bg-elevated)] p-3">
                  <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-light)] bg-[var(--bg-subtle)] text-[var(--brand)]">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {lead.name?.trim() || "Lead contact"}
                    </p>
                    <p className="mt-1 break-words text-sm text-[var(--text-secondary)]">
                      {selectedLeadEmail || "No email provided"}
                    </p>
                    {lead.company?.trim() ? (
                      <p className="mt-1 text-xs text-[var(--text-faint)]">
                        {lead.company.trim()}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="reply-template"
                    className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]"
                  >
                    Template
                  </label>
                  <button
                    ref={saveTemplateButtonRef}
                    type="button"
                    onClick={openSaveTemplateModal}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] px-3 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:border-[var(--border-orange)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-subtle)]"
                  >
                    <BadgePlus className="h-3.5 w-3.5" aria-hidden="true" />
                    Add new template
                  </button>
                </div>
                <select
                  id="reply-template"
                  value={replyTemplateKey}
                  onChange={(event) => handleReplyTemplateChange(event.target.value)}
                  className="mt-3 h-11 w-full rounded-xl border border-[var(--border-light)] bg-[var(--bg-elevated)] px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-orange)] focus:ring-2 focus:ring-[var(--brand)]/20"
                >
                  {builtInReplyTemplates.length > 0 ? (
                    <optgroup label="Built-in templates">
                      {builtInReplyTemplates.map((template) => (
                        <option key={template.key} value={template.key}>
                          {template.label}
                        </option>
                      ))}
                    </optgroup>
                  ) : null}
                  {customReplyTemplates.length > 0 ? (
                    <optgroup label="My saved templates">
                      {customReplyTemplates.map((template) => (
                        <option key={template.key} value={template.key}>
                          {template.label}
                        </option>
                      ))}
                    </optgroup>
                  ) : null}
                </select>
                {selectedReplyTemplate ? (
                  <div className="mt-2 rounded-xl border border-[var(--border-light)] bg-[var(--bg-elevated)]/80 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.08em] ${
                          selectedReplyTemplate.kind === "custom"
                            ? "border-emerald-200/80 bg-emerald-50 text-emerald-700"
                            : "border-[var(--border-light)] bg-[var(--bg-subtle)] text-[var(--text-faint)]"
                        }`}
                      >
                        {selectedReplyTemplate.kind === "custom"
                          ? "Saved template"
                          : "Built-in"}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-6 text-[var(--text-faint)]">
                      {selectedReplyTemplate.description}
                    </p>
                  </div>
                ) : null}
                <p className="mt-2 text-xs leading-6 text-[var(--text-faint)]">
                  Save your current subject and message as a reusable template for
                  future replies.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                    Attachments
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] px-3 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:border-[var(--border-orange)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-subtle)]"
                  >
                    <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
                    Add files
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={LEAD_REPLY_ATTACHMENT_ACCEPT}
                  multiple
                  onChange={handleReplyAttachmentChange}
                  className="hidden"
                />
                <p className="mt-2 text-xs leading-6 text-[var(--text-faint)]">
                  Upload up to {LEAD_REPLY_MAX_ATTACHMENTS} files. Maximum{" "}
                  {formatAttachmentSize(LEAD_REPLY_MAX_FILE_SIZE_BYTES)} per file and{" "}
                  {formatAttachmentSize(LEAD_REPLY_MAX_TOTAL_SIZE_BYTES)} total.
                </p>
                {replyFieldErrors.attachments ? (
                  <p className="mt-2 text-xs text-red-500">
                    {replyFieldErrors.attachments}
                  </p>
                ) : null}
                {replyAttachments.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {replyAttachments.map((file, index) => (
                      <div
                        key={`${file.name}-${file.size}-${index}`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-light)] bg-[var(--bg-elevated)] px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                            {file.name}
                          </p>
                          <p className="text-xs text-[var(--text-faint)]">
                            {formatAttachmentSize(file.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeReplyAttachment(index)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-light)] text-[var(--text-faint)] transition-colors hover:border-red-300 hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
                        >
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 rounded-2xl border border-dashed border-[var(--border-light)] bg-[var(--bg-elevated)]/50 px-4 py-5 text-center">
                    <p className="text-sm text-[var(--text-secondary)]">
                      No files attached yet.
                    </p>
                  </div>
                )}
              </div>
            </aside>

            <div className="space-y-4">
              {replyFeedback ? (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    replyFeedback.status === "success"
                      ? "border-emerald-200/70 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-300"
                      : "border-red-200/70 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-300"
                  }`}
                >
                  {replyFeedback.message}
                </div>
              ) : null}

              <div>
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="reply-subject"
                    className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]"
                  >
                    Subject
                  </label>
                  <span className="text-xs text-[var(--text-faint)]">
                    {replySubject.trim().length}/{LEAD_REPLY_MAX_SUBJECT_LENGTH}
                  </span>
                </div>
                <input
                  id="reply-subject"
                  type="text"
                  value={replySubject}
                  onChange={(event) => {
                    setReplyFeedback(null);
                    setReplyFieldErrors((currentErrors) => ({
                      ...currentErrors,
                      subject: undefined,
                    }));
                    setReplySubject(event.target.value);
                  }}
                  className="mt-3 h-11 w-full rounded-xl border border-[var(--border-light)] bg-[var(--bg-elevated)] px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-orange)] focus:ring-2 focus:ring-[var(--brand)]/20"
                  placeholder="Enter the email subject"
                />
                {replyFieldErrors.subject ? (
                  <p className="mt-2 text-xs text-red-500">
                    {replyFieldErrors.subject}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="reply-message"
                  className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]"
                >
                  Message
                </label>
                <textarea
                  id="reply-message"
                  value={replyMessage}
                  onChange={(event) => {
                    setReplyFeedback(null);
                    setReplyFieldErrors((currentErrors) => ({
                      ...currentErrors,
                      message: undefined,
                    }));
                    setReplyMessage(event.target.value);
                  }}
                  rows={16}
                  className="mt-3 min-h-[22rem] w-full rounded-2xl border border-[var(--border-light)] bg-[var(--bg-elevated)] px-4 py-3 text-sm leading-7 text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-orange)] focus:ring-2 focus:ring-[var(--brand)]/20"
                  placeholder="Write your reply message"
                />
                <div className="mt-2 flex items-center justify-between gap-3 text-xs text-[var(--text-faint)]">
                  <span>Use a clear, client-ready response before sending.</span>
                  <span>
                    {replyMessage.trim().length}/{LEAD_REPLY_MAX_MESSAGE_LENGTH}
                  </span>
                </div>
                {replyFieldErrors.message ? (
                  <p className="mt-2 text-xs text-red-500">
                    {replyFieldErrors.message}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border-light)] bg-[var(--bg-elevated-muted)] px-5 py-4 sm:px-6">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Link
              href={backHref}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] px-4 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated-muted)]"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSendingReply || !canReply}
              className="inline-flex h-10 min-w-[10.5rem] items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated-muted)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSendingReply ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <SendHorizontal className="h-4 w-4" aria-hidden="true" />
              )}
              {isSendingReply ? "Sending..." : "Send reply"}
            </button>
          </div>
        </div>
      </form>

      {isSaveTemplateModalOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6 sm:px-6">
          <button
            type="button"
            aria-label="Close save template dialog"
            onClick={closeSaveTemplateModal}
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={saveTemplateModalTitleId}
            aria-describedby={saveTemplateModalDescriptionId}
            className="relative flex max-h-[calc(100vh-3rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-[var(--border-light)] bg-[var(--bg-elevated)] shadow-[var(--shadow-large)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border-light)] bg-[linear-gradient(180deg,var(--bg-subtle)_0%,var(--bg-elevated)_100%)] px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--brand)]">
                  Reply Templates
                </p>
                <h3
                  id={saveTemplateModalTitleId}
                  className="mt-1 font-heading text-xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]"
                >
                  Create a new reply template
                </h3>
                <p
                  id={saveTemplateModalDescriptionId}
                  className="mt-1 text-sm text-[var(--text-muted)]"
                >
                  Save this subject and message so you can reuse them in future
                  replies.
                </p>
              </div>
              <button
                type="button"
                onClick={closeSaveTemplateModal}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] text-[var(--text-muted)] transition-colors hover:border-[var(--border-orange)] hover:bg-[var(--bg-elevated-muted)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-subtle)]"
                aria-label="Close save template dialog"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplateSubmit} className="min-h-0 flex-1">
              <div className="space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
                {saveTemplateFeedback ? (
                  <div
                    className={`rounded-2xl border px-4 py-3 text-sm ${
                      saveTemplateFeedback.status === "success"
                        ? "border-emerald-200/70 bg-emerald-50 text-emerald-700"
                        : "border-red-200/70 bg-red-50 text-red-600"
                    }`}
                  >
                    {saveTemplateFeedback.message}
                  </div>
                ) : null}

                <div>
                  <label
                    htmlFor="save-template-name"
                    className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]"
                  >
                    Template name
                  </label>
                  <input
                    ref={saveTemplateNameInputRef}
                    id="save-template-name"
                    type="text"
                    value={saveTemplateName}
                    onChange={(event) => {
                      setSaveTemplateFeedback(null);
                      setSaveTemplateFieldErrors((currentErrors) => ({
                        ...currentErrors,
                        label: undefined,
                      }));
                      setSaveTemplateName(event.target.value);
                    }}
                    className="mt-3 h-11 w-full rounded-xl border border-[var(--border-light)] bg-[var(--bg-elevated)] px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-orange)] focus:ring-2 focus:ring-[var(--brand)]/20"
                    placeholder="Enter a template name"
                  />
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs text-[var(--text-faint)]">
                    <span>Use a short internal label your team can recognize.</span>
                    <span>
                      {saveTemplateName.trim().length}/{LEAD_REPLY_TEMPLATE_MAX_LABEL_LENGTH}
                    </span>
                  </div>
                  {saveTemplateFieldErrors.label ? (
                    <p className="mt-2 text-xs text-red-500">
                      {saveTemplateFieldErrors.label}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-subtle)]/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <label
                        htmlFor="save-template-subject"
                        className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]"
                      >
                        <Mail
                          className="h-4 w-4 text-[var(--brand)]"
                          aria-hidden="true"
                        />
                        Subject
                      </label>
                      <span className="text-xs text-[var(--text-faint)]">
                        {replySubject.trim().length}/{LEAD_REPLY_MAX_SUBJECT_LENGTH}
                      </span>
                    </div>
                    <input
                      id="save-template-subject"
                      type="text"
                      value={replySubject}
                      onChange={(event) => {
                        setSaveTemplateFeedback(null);
                        setSaveTemplateFieldErrors((currentErrors) => ({
                          ...currentErrors,
                          subject: undefined,
                        }));
                        setReplyFieldErrors((currentErrors) => ({
                          ...currentErrors,
                          subject: undefined,
                        }));
                        setReplySubject(event.target.value);
                      }}
                      className="mt-3 h-11 w-full rounded-xl border border-[var(--border-light)] bg-[var(--bg-elevated)] px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-orange)] focus:ring-2 focus:ring-[var(--brand)]/20"
                      placeholder="Enter the subject for this template"
                    />
                    <p className="mt-2 text-xs leading-6 text-[var(--text-faint)]">
                      This updates the current reply subject too.
                    </p>
                    {saveTemplateFieldErrors.subject ? (
                      <p className="mt-3 text-xs text-red-500">
                        {saveTemplateFieldErrors.subject}
                      </p>
                    ) : null}
                  </div>

                  <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-subtle)]/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <label
                        htmlFor="save-template-message"
                        className="text-sm font-semibold text-[var(--text-primary)]"
                      >
                        Message
                      </label>
                      <span className="text-xs text-[var(--text-faint)]">
                        {replyMessage.trim().length}/{LEAD_REPLY_MAX_MESSAGE_LENGTH}
                      </span>
                    </div>
                    <textarea
                      id="save-template-message"
                      value={replyMessage}
                      onChange={(event) => {
                        setSaveTemplateFeedback(null);
                        setSaveTemplateFieldErrors((currentErrors) => ({
                          ...currentErrors,
                          message: undefined,
                        }));
                        setReplyFieldErrors((currentErrors) => ({
                          ...currentErrors,
                          message: undefined,
                        }));
                        setReplyMessage(event.target.value);
                      }}
                      rows={9}
                      className="mt-3 min-h-[14rem] w-full rounded-2xl border border-[var(--border-light)] bg-[var(--bg-elevated)] px-4 py-3 text-sm leading-7 text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-orange)] focus:ring-2 focus:ring-[var(--brand)]/20"
                      placeholder="Write the template message"
                    />
                    <p className="mt-2 text-xs leading-6 text-[var(--text-faint)]">
                      Changes here also update the reply draft behind the modal.
                    </p>
                    {saveTemplateFieldErrors.message ? (
                      <p className="mt-3 text-xs text-red-500">
                        {saveTemplateFieldErrors.message}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="border-t border-[var(--border-light)] bg-[var(--bg-elevated-muted)] px-5 py-4 sm:px-6">
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={closeSaveTemplateModal}
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] px-4 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated-muted)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingTemplate}
                    className="inline-flex h-10 min-w-[11rem] items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated-muted)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingTemplate ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    )}
                    {isSavingTemplate ? "Saving..." : "Save template"}
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}

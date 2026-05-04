export const LEAD_REPLY_MAX_ATTACHMENTS = 5;
export const LEAD_REPLY_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const LEAD_REPLY_MAX_TOTAL_SIZE_BYTES = 25 * 1024 * 1024;
export const LEAD_REPLY_MAX_SUBJECT_LENGTH = 200;
export const LEAD_REPLY_MAX_MESSAGE_LENGTH = 10000;
export const LEAD_REPLY_TEMPLATE_MAX_LABEL_LENGTH = 80;

export const LEAD_REPLY_ALLOWED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
  "csv",
  "zip",
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
] as const;

export const LEAD_REPLY_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/x-zip-compressed",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

export const LEAD_REPLY_ATTACHMENT_ACCEPT = LEAD_REPLY_ALLOWED_EXTENSIONS.map(
  (extension) => `.${extension}`
).join(",");

export type LeadReplyAttachmentMetadata = {
  filename: string;
  mimeType: string;
  size: number;
};

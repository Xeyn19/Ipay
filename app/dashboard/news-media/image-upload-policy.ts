export const NEWS_MEDIA_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const NEWS_MEDIA_IMAGE_MAX_SIZE_LABEL = "5 MB";
export const NEWS_MEDIA_IMAGE_ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
] as const;
export const NEWS_MEDIA_IMAGE_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const NEWS_MEDIA_INVALID_IMAGE_TYPE_MESSAGE =
  "Upload a JPG, PNG, or WEBP image.";
export const NEWS_MEDIA_IMAGE_TOO_LARGE_MESSAGE = `Image must be ${NEWS_MEDIA_IMAGE_MAX_SIZE_LABEL} or smaller.`;
export const NEWS_MEDIA_FEATURED_IMAGE_TOO_LARGE_MESSAGE = `Featured image must be ${NEWS_MEDIA_IMAGE_MAX_SIZE_LABEL} or smaller.`;
export const NEWS_MEDIA_IMAGE_UPLOAD_FAILURE_MESSAGE =
  "The image upload failed. Try again.";
export const NEWS_MEDIA_IMAGE_UPLOAD_AUTH_MESSAGE =
  "You must be signed in to upload newsroom images.";

const SERVER_ACTION_BODY_SIZE_ERROR_PATTERN = /body exceeded .*limit/i;

type NewsMediaImageFile = Pick<File, "name" | "size" | "type">;

export function getNewsMediaImageExtension(filename: string, mimeType: string) {
  const segments = filename.split(".");
  const fromFilename =
    segments.length > 1 ? segments.at(-1)?.trim().toLowerCase() ?? "" : "";

  if (fromFilename) {
    return fromFilename;
  }

  if (mimeType === "image/jpeg") {
    return "jpg";
  }

  if (mimeType === "image/png") {
    return "png";
  }

  if (mimeType === "image/webp") {
    return "webp";
  }

  return "";
}

export function validateNewsMediaImageFile(
  file: NewsMediaImageFile | null,
  options?: {
    sizeMessage?: string;
    typeMessage?: string;
  },
) {
  if (!file) {
    return null;
  }

  const mimeType = file.type.trim().toLowerCase();
  const extension = getNewsMediaImageExtension(file.name, mimeType);
  const typeMessage =
    options?.typeMessage ?? NEWS_MEDIA_INVALID_IMAGE_TYPE_MESSAGE;

  if (
    !NEWS_MEDIA_IMAGE_ALLOWED_EXTENSIONS.includes(
      extension as (typeof NEWS_MEDIA_IMAGE_ALLOWED_EXTENSIONS)[number],
    )
  ) {
    return typeMessage;
  }

  if (
    mimeType &&
    !NEWS_MEDIA_IMAGE_ALLOWED_MIME_TYPES.includes(
      mimeType as (typeof NEWS_MEDIA_IMAGE_ALLOWED_MIME_TYPES)[number],
    )
  ) {
    return typeMessage;
  }

  if (file.size > NEWS_MEDIA_IMAGE_MAX_BYTES) {
    return options?.sizeMessage ?? NEWS_MEDIA_IMAGE_TOO_LARGE_MESSAGE;
  }

  return null;
}

export function getNewsMediaImageUploadErrorMessage(
  error: unknown,
  options?: {
    fallbackMessage?: string;
    sizeMessage?: string;
  },
) {
  if (error instanceof Error) {
    if (error.message === "Unauthorized") {
      return NEWS_MEDIA_IMAGE_UPLOAD_AUTH_MESSAGE;
    }

    if (SERVER_ACTION_BODY_SIZE_ERROR_PATTERN.test(error.message)) {
      return options?.sizeMessage ?? NEWS_MEDIA_IMAGE_TOO_LARGE_MESSAGE;
    }
  }

  return options?.fallbackMessage ?? NEWS_MEDIA_IMAGE_UPLOAD_FAILURE_MESSAGE;
}

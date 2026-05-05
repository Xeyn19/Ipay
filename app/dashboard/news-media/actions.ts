"use server";

import { Buffer } from "node:buffer";
import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import type { JSONContent } from "@tiptap/react";
import {
  buildNewsSlug,
  type NewsArticleStatus,
  type NewsPostCategory,
} from "@/app/lib/news-media";
import { createAdminClient } from "@/app/lib/supabase-admin";
import { createClient } from "@/app/lib/supabase-server";

const NEWS_MEDIA_BUCKET = "news-media";
const MAX_FEATURED_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const FEATURED_IMAGE_ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;
const FEATURED_IMAGE_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

type NewsPostFieldErrorKey =
  | "body"
  | "category"
  | "excerpt"
  | "featuredImage"
  | "publishDate"
  | "slug"
  | "title";

type NewsPostFieldErrors = Partial<Record<NewsPostFieldErrorKey, string>>;

type NewsPostCategoryFieldErrors = Partial<Record<"name", string>>;

export type NewsPostFormState = {
  fieldErrors: NewsPostFieldErrors;
  message: string;
  status: "error" | "idle" | "success";
  submittedAt: number | null;
};

export type NewsPostMutationResult = {
  message: string;
  status: "error" | "success";
};

export type NewsPostCategoryFormState = {
  createdCategory: NewsPostCategory | null;
  fieldErrors: NewsPostCategoryFieldErrors;
  message: string;
  status: "error" | "idle" | "success";
  submittedAt: number | null;
};

type NewsPostRecord = {
  featured_image_path: string | null;
  id: string;
  published_at: string | null;
  status: NewsArticleStatus;
};

type ValidatedNewsPostPayload = {
  body: JSONContent;
  categoryId: string;
  excerpt: string;
  publishDate: string;
  slug: string;
  status: NewsArticleStatus;
  title: string;
};

const NEWS_POST_FORM_INITIAL_STATE: NewsPostFormState = {
  fieldErrors: {},
  message: "",
  status: "idle",
  submittedAt: null,
};

const NEWS_POST_CATEGORY_FORM_INITIAL_STATE: NewsPostCategoryFormState = {
  createdCategory: null,
  fieldErrors: {},
  message: "",
  status: "idle",
  submittedAt: null,
};

function buildActionState(
  overrides: Partial<NewsPostFormState>,
): NewsPostFormState {
  return {
    ...NEWS_POST_FORM_INITIAL_STATE,
    ...overrides,
    fieldErrors: overrides.fieldErrors ?? {},
    submittedAt: overrides.submittedAt ?? Date.now(),
  };
}

function buildCategoryActionState(
  overrides: Partial<NewsPostCategoryFormState>,
): NewsPostCategoryFormState {
  return {
    ...NEWS_POST_CATEGORY_FORM_INITIAL_STATE,
    ...overrides,
    createdCategory: overrides.createdCategory ?? null,
    fieldErrors: overrides.fieldErrors ?? {},
    submittedAt: overrides.submittedAt ?? Date.now(),
  };
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeCategoryName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function isValidPublishDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  return !Number.isNaN(new Date(`${value}T12:00:00`).getTime());
}

function parseBody(value: string) {
  try {
    const parsed = JSON.parse(value) as JSONContent;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function getImageExtension(filename: string, mimeType: string) {
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

function getFeaturedImageFile(formData: FormData) {
  const value = formData.get("featuredImage");

  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  return value;
}

function validateFeaturedImage(file: File | null) {
  if (!file) {
    return null;
  }

  const mimeType = file.type.trim().toLowerCase();
  const extension = getImageExtension(file.name, mimeType);

  if (!FEATURED_IMAGE_ALLOWED_EXTENSIONS.includes(
    extension as (typeof FEATURED_IMAGE_ALLOWED_EXTENSIONS)[number],
  )) {
    return "Upload a JPG, PNG, or WEBP image.";
  }

  if (
    mimeType &&
    !FEATURED_IMAGE_ALLOWED_MIME_TYPES.includes(
      mimeType as (typeof FEATURED_IMAGE_ALLOWED_MIME_TYPES)[number],
    )
  ) {
    return "Upload a JPG, PNG, or WEBP image.";
  }

  if (file.size > MAX_FEATURED_IMAGE_SIZE_BYTES) {
    return "Featured image must be 5 MB or smaller.";
  }

  return null;
}

function normalizeStatus(
  rawStatus: string,
  allowArchivedStatus: boolean,
): NewsArticleStatus | null {
  if (rawStatus === "draft" || rawStatus === "published") {
    return rawStatus;
  }

  if (allowArchivedStatus && rawStatus === "archived") {
    return rawStatus;
  }

  return null;
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

function revalidateNewsPaths(postId?: string) {
  revalidatePath("/dashboard/news-media");
  revalidatePath("/dashboard/news-media/new");
  revalidatePath("/news-media");

  if (postId) {
    revalidatePath(`/dashboard/news-media/${postId}`);
  }
}

function revalidateNewsCategoryPaths() {
  revalidatePath("/dashboard/news-media/new");
  revalidatePath("/dashboard/news-media/[postId]", "page");
}

function validateNewsPostPayload(
  formData: FormData,
  options?: {
    allowArchivedStatus?: boolean;
  },
):
  | {
      fieldErrors: NewsPostFieldErrors;
      payload?: undefined;
    }
  | {
      fieldErrors: NewsPostFieldErrors;
      payload: ValidatedNewsPostPayload;
    } {
  const allowArchivedStatus = options?.allowArchivedStatus ?? false;
  const fieldErrors: NewsPostFieldErrors = {};
  const title = getFormValue(formData, "title");
  const slugInput = getFormValue(formData, "slug");
  const slug = buildNewsSlug(slugInput || title);
  const categoryId = getFormValue(formData, "categoryId");
  const excerpt = getFormValue(formData, "excerpt");
  const publishDate = getFormValue(formData, "publishDate");
  const bodyValue = getFormValue(formData, "body");
  const statusValue = normalizeStatus(
    getFormValue(formData, "status"),
    allowArchivedStatus,
  );
  const body = parseBody(bodyValue);

  if (!title) {
    fieldErrors.title = "Enter a post title.";
  }

  if (!slug) {
    fieldErrors.slug = "Enter a URL slug.";
  }

  if (!categoryId) {
    fieldErrors.category = "Choose a category.";
  }

  if (!excerpt) {
    fieldErrors.excerpt = "Enter a short excerpt.";
  }

  if (!publishDate || !isValidPublishDate(publishDate)) {
    fieldErrors.publishDate = "Choose a valid publish date.";
  }

  if (!body) {
    fieldErrors.body = "The article body could not be saved. Try again.";
  }

  if (!statusValue) {
    fieldErrors.title = fieldErrors.title ?? "Choose a valid newsroom status.";
  }

  if (Object.keys(fieldErrors).length > 0 || !body || !statusValue) {
    return { fieldErrors };
  }

  return {
    fieldErrors,
    payload: {
      body,
      categoryId,
      excerpt,
      publishDate,
      slug,
      status: statusValue,
      title,
    },
  };
}

async function ensureUniqueSlug(slug: string, postId?: string) {
  const admin = createAdminClient();
  let query = admin.from("news_posts").select("id").eq("slug", slug);

  if (postId) {
    query = query.neq("id", postId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw error;
  }

  return !data;
}

async function ensureNewsPostCategoryExists(categoryId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("news_post_categories")
    .select("id")
    .eq("id", categoryId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

async function getNewsPostRecord(postId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("news_posts")
    .select("id, status, published_at, featured_image_path")
    .eq("id", postId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as NewsPostRecord | null;
}

async function uploadFeaturedImage(
  postId: string,
  slug: string,
  file: File,
) {
  const mimeType = file.type.trim().toLowerCase() || "application/octet-stream";
  const extension = getImageExtension(file.name, mimeType);
  const safeSlug = buildNewsSlug(slug) || "news-post";
  const path = `posts/${postId}/${Date.now()}-${safeSlug}.${extension}`;
  const admin = createAdminClient();
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await admin.storage.from(NEWS_MEDIA_BUCKET).upload(path, buffer, {
    cacheControl: "3600",
    contentType: mimeType,
    upsert: false,
  });

  if (error) {
    throw error;
  }

  return path;
}

async function deleteFeaturedImage(path: string | null) {
  if (!path) {
    return;
  }

  const admin = createAdminClient();
  const { error } = await admin.storage.from(NEWS_MEDIA_BUCKET).remove([path]);

  if (error) {
    console.error("Unable to remove newsroom image.", error);
  }
}

export async function createNewsPost(
  _prevState: NewsPostFormState,
  formData: FormData,
): Promise<NewsPostFormState> {
  const validation = validateNewsPostPayload(formData);
  const featuredImage = getFeaturedImageFile(formData);
  const featuredImageError = validateFeaturedImage(featuredImage);

  if (featuredImageError) {
    return buildActionState({
      fieldErrors: {
        ...validation.fieldErrors,
        featuredImage: featuredImageError,
      },
      message: "Please review the post details and try again.",
      status: "error",
    });
  }

  if (!validation.payload) {
    return buildActionState({
      fieldErrors: validation.fieldErrors,
      message: "Please review the post details and try again.",
      status: "error",
    });
  }

  try {
    const userId = await getAuthenticatedUserId();
    const isSlugAvailable = await ensureUniqueSlug(validation.payload.slug);
    const categoryExists = await ensureNewsPostCategoryExists(
      validation.payload.categoryId,
    );

    if (!isSlugAvailable) {
      return buildActionState({
        fieldErrors: {
          slug: "That slug is already in use.",
        },
        message: "Choose a different slug before saving.",
        status: "error",
      });
    }

    if (!categoryExists) {
      return buildActionState({
        fieldErrors: {
          category: "Choose a valid category.",
        },
        message: "Please review the post details and try again.",
        status: "error",
      });
    }

    const postId = crypto.randomUUID();
    let uploadedImagePath: string | null = null;

    if (featuredImage) {
      uploadedImagePath = await uploadFeaturedImage(
        postId,
        validation.payload.slug,
        featuredImage,
      );
    }

    const now = new Date().toISOString();
    const admin = createAdminClient();
    const { error } = await admin.from("news_posts").insert({
      body: validation.payload.body,
      category_id: validation.payload.categoryId,
      created_by: userId,
      excerpt: validation.payload.excerpt,
      featured_image_path: uploadedImagePath,
      id: postId,
      publish_date: validation.payload.publishDate,
      published_at:
        validation.payload.status === "published" ? now : null,
      slug: validation.payload.slug,
      status: validation.payload.status,
      title: validation.payload.title,
      updated_by: userId,
    });

    if (error) {
      if (uploadedImagePath) {
        await deleteFeaturedImage(uploadedImagePath);
      }

      return buildActionState({
        message: error.message ?? "The post could not be created.",
        status: "error",
      });
    }

    revalidateNewsPaths(postId);
    redirect(`/dashboard/news-media/${postId}`);
  } catch (error) {
    unstable_rethrow(error);

    return buildActionState({
      message:
        error instanceof Error && error.message === "Unauthorized"
          ? "You must be signed in to create newsroom posts."
          : error instanceof Error && error.message
            ? error.message
            : "The post could not be created.",
      status: "error",
    });
  }
}

export async function updateNewsPost(
  postId: string,
  _prevState: NewsPostFormState,
  formData: FormData,
): Promise<NewsPostFormState> {
  try {
    const existingPost = await getNewsPostRecord(postId);

    if (!existingPost) {
      return buildActionState({
        message: "This post no longer exists.",
        status: "error",
      });
    }

    const validation = validateNewsPostPayload(formData, {
      allowArchivedStatus: existingPost.status === "archived",
    });
    const featuredImage = getFeaturedImageFile(formData);
    const featuredImageError = validateFeaturedImage(featuredImage);

    if (featuredImageError) {
      return buildActionState({
        fieldErrors: {
          ...validation.fieldErrors,
          featuredImage: featuredImageError,
        },
        message: "Please review the post details and try again.",
        status: "error",
      });
    }

    if (!validation.payload) {
      return buildActionState({
        fieldErrors: validation.fieldErrors,
        message: "Please review the post details and try again.",
        status: "error",
      });
    }

    const userId = await getAuthenticatedUserId();
    const isSlugAvailable = await ensureUniqueSlug(validation.payload.slug, postId);
    const categoryExists = await ensureNewsPostCategoryExists(
      validation.payload.categoryId,
    );

    if (!isSlugAvailable) {
      return buildActionState({
        fieldErrors: {
          slug: "That slug is already in use.",
        },
        message: "Choose a different slug before saving.",
        status: "error",
      });
    }

    if (!categoryExists) {
      return buildActionState({
        fieldErrors: {
          category: "Choose a valid category.",
        },
        message: "Please review the post details and try again.",
        status: "error",
      });
    }

    let uploadedImagePath: string | null = null;

    if (featuredImage) {
      uploadedImagePath = await uploadFeaturedImage(
        postId,
        validation.payload.slug,
        featuredImage,
      );
    }

    const nextPublishedAt =
      validation.payload.status === "published"
        ? existingPost.published_at ?? new Date().toISOString()
        : existingPost.published_at;
    const admin = createAdminClient();
    const { error } = await admin
      .from("news_posts")
      .update({
        body: validation.payload.body,
        category_id: validation.payload.categoryId,
        excerpt: validation.payload.excerpt,
        featured_image_path:
          uploadedImagePath ?? existingPost.featured_image_path,
        publish_date: validation.payload.publishDate,
        published_at: nextPublishedAt,
        slug: validation.payload.slug,
        status: validation.payload.status,
        title: validation.payload.title,
        updated_by: userId,
      })
      .eq("id", postId);

    if (error) {
      if (uploadedImagePath) {
        await deleteFeaturedImage(uploadedImagePath);
      }

      return buildActionState({
        message: error.message ?? "The post could not be updated.",
        status: "error",
      });
    }

    if (uploadedImagePath && existingPost.featured_image_path) {
      await deleteFeaturedImage(existingPost.featured_image_path);
    }

    revalidateNewsPaths(postId);

    return buildActionState({
      message: existingPost.status === "archived" ? "Archived post saved." : "Post saved.",
      status: "success",
    });
  } catch (error) {
    unstable_rethrow(error);

    return buildActionState({
      message:
        error instanceof Error && error.message === "Unauthorized"
          ? "You must be signed in to update newsroom posts."
          : error instanceof Error && error.message
            ? error.message
            : "The post could not be updated.",
      status: "error",
    });
  }
}

export async function createNewsPostCategory(
  _prevState: NewsPostCategoryFormState,
  formData: FormData,
): Promise<NewsPostCategoryFormState> {
  const name = normalizeCategoryName(getFormValue(formData, "name"));

  if (!name) {
    return buildCategoryActionState({
      fieldErrors: {
        name: "Enter a category name.",
      },
      message: "Please review the category details and try again.",
      status: "error",
    });
  }

  try {
    await getAuthenticatedUserId();
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("news_post_categories")
      .insert({
        name,
      })
      .select("id, name")
      .single();

    if (error) {
      if (error.code === "23505") {
        return buildCategoryActionState({
          fieldErrors: {
            name: "That category already exists.",
          },
          message: "Choose a different category name.",
          status: "error",
        });
      }

      return buildCategoryActionState({
        message: error.message ?? "The category could not be created.",
        status: "error",
      });
    }

    revalidateNewsCategoryPaths();

    return buildCategoryActionState({
      createdCategory: data as NewsPostCategory,
      message: "Category created.",
      status: "success",
    });
  } catch (error) {
    unstable_rethrow(error);

    return buildCategoryActionState({
      message:
        error instanceof Error && error.message === "Unauthorized"
          ? "You must be signed in to create categories."
          : error instanceof Error && error.message
            ? error.message
            : "The category could not be created.",
      status: "error",
    });
  }
}

export async function archiveNewsPost(
  postId: string,
): Promise<NewsPostMutationResult> {
  if (!postId.trim()) {
    return {
      message: "Invalid post selection.",
      status: "error",
    };
  }

  try {
    const userId = await getAuthenticatedUserId();
    const existingPost = await getNewsPostRecord(postId);

    if (!existingPost) {
      return {
        message: "Post not found.",
        status: "error",
      };
    }

    if (existingPost.status === "archived") {
      return {
        message: "Post is already archived.",
        status: "success",
      };
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("news_posts")
      .update({
        status: "archived",
        updated_by: userId,
      })
      .eq("id", postId);

    if (error) {
      return {
        message: error.message ?? "The post could not be archived.",
        status: "error",
      };
    }

    revalidateNewsPaths(postId);

    return {
      message: "Post archived.",
      status: "success",
    };
  } catch (error) {
    unstable_rethrow(error);

    return {
      message:
        error instanceof Error && error.message === "Unauthorized"
          ? "You must be signed in to archive newsroom posts."
          : error instanceof Error && error.message
            ? error.message
            : "The post could not be archived.",
      status: "error",
    };
  }
}

export async function restoreNewsPost(
  postId: string,
): Promise<NewsPostMutationResult> {
  if (!postId.trim()) {
    return {
      message: "Invalid post selection.",
      status: "error",
    };
  }

  try {
    const userId = await getAuthenticatedUserId();
    const existingPost = await getNewsPostRecord(postId);

    if (!existingPost) {
      return {
        message: "Post not found.",
        status: "error",
      };
    }

    if (existingPost.status !== "archived") {
      return {
        message: "Post is already active.",
        status: "success",
      };
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("news_posts")
      .update({
        status: "draft",
        updated_by: userId,
      })
      .eq("id", postId);

    if (error) {
      return {
        message: error.message ?? "The post could not be restored.",
        status: "error",
      };
    }

    revalidateNewsPaths(postId);

    return {
      message: "Post restored to drafts.",
      status: "success",
    };
  } catch (error) {
    unstable_rethrow(error);

    return {
      message:
        error instanceof Error && error.message === "Unauthorized"
          ? "You must be signed in to restore newsroom posts."
          : error instanceof Error && error.message
            ? error.message
            : "The post could not be restored.",
      status: "error",
    };
  }
}

export async function permanentlyDeleteNewsPost(
  postId: string,
): Promise<NewsPostMutationResult> {
  if (!postId.trim()) {
    return {
      message: "Invalid post selection.",
      status: "error",
    };
  }

  try {
    await getAuthenticatedUserId();
    const existingPost = await getNewsPostRecord(postId);

    if (!existingPost) {
      return {
        message: "Post not found.",
        status: "error",
      };
    }

    if (existingPost.status !== "archived") {
      return {
        message: "Archive the post before deleting it permanently.",
        status: "error",
      };
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("news_posts")
      .delete()
      .eq("id", postId);

    if (error) {
      return {
        message: error.message ?? "The post could not be deleted.",
        status: "error",
      };
    }

    await deleteFeaturedImage(existingPost.featured_image_path);
    revalidateNewsPaths(postId);

    return {
      message: "Post permanently deleted.",
      status: "success",
    };
  } catch (error) {
    unstable_rethrow(error);

    return {
      message:
        error instanceof Error && error.message === "Unauthorized"
          ? "You must be signed in to delete newsroom posts."
          : error instanceof Error && error.message
            ? error.message
            : "The post could not be deleted.",
      status: "error",
    };
  }
}

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
import {
  NEWS_MEDIA_FEATURED_IMAGE_REQUIRED_MESSAGE,
  NEWS_MEDIA_FEATURED_IMAGE_TOO_LARGE_MESSAGE,
  getNewsMediaImageUploadErrorMessage,
  getNewsMediaImageExtension,
  validateNewsMediaImageFile,
} from "./image-upload-policy";

const NEWS_MEDIA_BUCKET = "news-media";

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

export type NewsBodyImageUploadResult = NewsPostMutationResult & {
  url?: string;
};

export type NewsPostCategoryFormState = {
  createdCategory: NewsPostCategory | null;
  fieldErrors: NewsPostCategoryFieldErrors;
  message: string;
  status: "error" | "idle" | "success";
  submittedAt: number | null;
};

export type NewsPostCategoryDeletePreviewResult = {
  categoryId: string | null;
  message: string;
  postCount: number;
  status: "error" | "success";
};

export type NewsPostCategoryDeleteResult = {
  deletedCategoryId: string | null;
  message: string;
  reassignedPostCount: number;
  replacementCategoryId: string | null;
  status: "error" | "success";
};

type NewsPostRecord = {
  featured_image_path: string | null;
  id: string;
  is_featured: boolean;
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

function getImageFile(formData: FormData, key: string) {
  const value = formData.get(key);

  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  return value;
}

function getFeaturedImageFile(formData: FormData) {
  return getImageFile(formData, "featuredImage");
}

function validateImageFile(
  file: File | null,
  options?: {
    sizeMessage?: string;
  },
) {
  return validateNewsMediaImageFile(file, options);
}

function validateFeaturedImage(file: File | null) {
  if (!file) {
    return NEWS_MEDIA_FEATURED_IMAGE_REQUIRED_MESSAGE;
  }

  return validateImageFile(file, {
    sizeMessage: NEWS_MEDIA_FEATURED_IMAGE_TOO_LARGE_MESSAGE,
  });
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
  revalidatePath("/dashboard/news-media/[postId]", "page");
  revalidatePath("/news-media");
  revalidatePath("/news-media/[slug]", "page");

  if (postId) {
    revalidatePath(`/dashboard/news-media/${postId}`);
  }
}

function revalidateNewsCategoryPaths() {
  revalidatePath("/dashboard/news-media");
  revalidatePath("/dashboard/news-media/new");
  revalidatePath("/dashboard/news-media/[postId]", "page");
  revalidatePath("/news-media");
  revalidatePath("/news-media/[slug]", "page");
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

async function getNewsPostCategoryUsageCount(categoryId: string) {
  const admin = createAdminClient();
  const { count, error } = await admin
    .from("news_posts")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("category_id", categoryId);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

async function getNewsPostRecord(postId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("news_posts")
    .select("id, status, published_at, featured_image_path, is_featured")
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
  const extension = getNewsMediaImageExtension(file.name, mimeType);
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

function getPublicNewsMediaUrl(path: string) {
  const admin = createAdminClient();
  const {
    data: { publicUrl },
  } = admin.storage.from(NEWS_MEDIA_BUCKET).getPublicUrl(path);

  if (!publicUrl) {
    throw new Error("The uploaded image URL could not be created.");
  }

  return publicUrl;
}

async function uploadNewsBodyImageFile(userId: string, file: File) {
  const mimeType = file.type.trim().toLowerCase() || "application/octet-stream";
  const extension = getNewsMediaImageExtension(file.name, mimeType);
  const safeName = buildNewsSlug(file.name.replace(/\.[^.]+$/, "")) || "image";
  const path = `body/${userId}/${Date.now()}-${safeName}.${extension}`;
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

  return {
    path,
    url: getPublicNewsMediaUrl(path),
  };
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

export async function uploadNewsBodyImage(
  formData: FormData,
): Promise<NewsBodyImageUploadResult> {
  const file = getImageFile(formData, "image");
  const imageError = validateImageFile(file);

  if (imageError) {
    return {
      message: imageError,
      status: "error",
    };
  }

  if (!file) {
    return {
      message: "Choose an image to upload.",
      status: "error",
    };
  }

  let uploadedPath: string | null = null;

  try {
    const userId = await getAuthenticatedUserId();
    const uploadedImage = await uploadNewsBodyImageFile(userId, file);
    uploadedPath = uploadedImage.path;

    return {
      message: "Image uploaded.",
      status: "success",
      url: uploadedImage.url,
    };
  } catch (error) {
    if (uploadedPath) {
      await deleteFeaturedImage(uploadedPath);
    }

    unstable_rethrow(error);

    return {
      message: getNewsMediaImageUploadErrorMessage(error),
      status: "error",
    };
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
    const featuredImageError =
      featuredImage || existingPost.featured_image_path
        ? validateImageFile(featuredImage, {
            sizeMessage: NEWS_MEDIA_FEATURED_IMAGE_TOO_LARGE_MESSAGE,
          })
        : NEWS_MEDIA_FEATURED_IMAGE_REQUIRED_MESSAGE;

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
        is_featured:
          validation.payload.status === "published"
            ? existingPost.is_featured
            : false,
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

export async function inspectNewsPostCategoryDeletion(
  categoryId: string,
): Promise<NewsPostCategoryDeletePreviewResult> {
  if (!categoryId.trim()) {
    return {
      categoryId: null,
      message: "Invalid category selection.",
      postCount: 0,
      status: "error",
    };
  }

  try {
    await getAuthenticatedUserId();
    const categoryExists = await ensureNewsPostCategoryExists(categoryId);

    if (!categoryExists) {
      return {
        categoryId: null,
        message: "Category not found.",
        postCount: 0,
        status: "error",
      };
    }

    const postCount = await getNewsPostCategoryUsageCount(categoryId);

    return {
      categoryId,
      message:
        postCount > 0
          ? `${postCount} post${postCount === 1 ? "" : "s"} currently use this category.`
          : "This category is not assigned to any posts.",
      postCount,
      status: "success",
    };
  } catch (error) {
    unstable_rethrow(error);

    return {
      categoryId: null,
      message:
        error instanceof Error && error.message === "Unauthorized"
          ? "You must be signed in to manage categories."
          : error instanceof Error && error.message
            ? error.message
            : "The category usage could not be checked.",
      postCount: 0,
      status: "error",
    };
  }
}

export async function deleteNewsPostCategory(
  categoryId: string,
  replacementCategoryId?: string,
): Promise<NewsPostCategoryDeleteResult> {
  const normalizedCategoryId = categoryId.trim();
  const normalizedReplacementCategoryId = replacementCategoryId?.trim() ?? "";

  if (!normalizedCategoryId) {
    return {
      deletedCategoryId: null,
      message: "Invalid category selection.",
      reassignedPostCount: 0,
      replacementCategoryId: null,
      status: "error",
    };
  }

  try {
    await getAuthenticatedUserId();
    const categoryExists = await ensureNewsPostCategoryExists(
      normalizedCategoryId,
    );

    if (!categoryExists) {
      return {
        deletedCategoryId: null,
        message: "Category not found.",
        reassignedPostCount: 0,
        replacementCategoryId: null,
        status: "error",
      };
    }

    const postCount = await getNewsPostCategoryUsageCount(normalizedCategoryId);

    if (postCount > 0) {
      if (!normalizedReplacementCategoryId) {
        return {
          deletedCategoryId: null,
          message: "Choose a replacement category before deleting this category.",
          reassignedPostCount: 0,
          replacementCategoryId: null,
          status: "error",
        };
      }

      if (normalizedReplacementCategoryId === normalizedCategoryId) {
        return {
          deletedCategoryId: null,
          message: "Choose a different replacement category.",
          reassignedPostCount: 0,
          replacementCategoryId: null,
          status: "error",
        };
      }

      const replacementExists = await ensureNewsPostCategoryExists(
        normalizedReplacementCategoryId,
      );

      if (!replacementExists) {
        return {
          deletedCategoryId: null,
          message: "Choose a valid replacement category.",
          reassignedPostCount: 0,
          replacementCategoryId: null,
          status: "error",
        };
      }

      const admin = createAdminClient();
      const { data, error } = await admin.rpc(
        "reassign_and_delete_news_post_category",
        {
          replacement_category_id: normalizedReplacementCategoryId,
          target_category_id: normalizedCategoryId,
        },
      );

      if (error) {
        return {
          deletedCategoryId: null,
          message: error.message ?? "The category could not be deleted.",
          reassignedPostCount: 0,
          replacementCategoryId: null,
          status: "error",
        };
      }

      const reassignedPostCount = Array.isArray(data)
        ? Number(data[0]?.reassigned_post_count ?? postCount)
        : postCount;

      revalidateNewsCategoryPaths();

      return {
        deletedCategoryId: normalizedCategoryId,
        message: `Category deleted. ${reassignedPostCount} post${reassignedPostCount === 1 ? "" : "s"} reassigned.`,
        reassignedPostCount,
        replacementCategoryId: normalizedReplacementCategoryId,
        status: "success",
      };
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("news_post_categories")
      .delete()
      .eq("id", normalizedCategoryId);

    if (error) {
      return {
        deletedCategoryId: null,
        message: error.message ?? "The category could not be deleted.",
        reassignedPostCount: 0,
        replacementCategoryId: null,
        status: "error",
      };
    }

    revalidateNewsCategoryPaths();

    return {
      deletedCategoryId: normalizedCategoryId,
      message: "Category deleted.",
      reassignedPostCount: 0,
      replacementCategoryId: null,
      status: "success",
    };
  } catch (error) {
    unstable_rethrow(error);

    return {
      deletedCategoryId: null,
      message:
        error instanceof Error && error.message === "Unauthorized"
          ? "You must be signed in to manage categories."
          : error instanceof Error && error.message
            ? error.message
            : "The category could not be deleted.",
      reassignedPostCount: 0,
      replacementCategoryId: null,
      status: "error",
    };
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
        is_featured: false,
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
        is_featured: false,
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

export async function publishNewsPost(
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

    if (existingPost.status === "published") {
      return {
        message: "Post is already published.",
        status: "success",
      };
    }

    if (existingPost.status === "archived") {
      return {
        message: "Archived posts cannot be published from preview.",
        status: "error",
      };
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("news_posts")
      .update({
        published_at: existingPost.published_at ?? new Date().toISOString(),
        status: "published",
        updated_by: userId,
      })
      .eq("id", postId);

    if (error) {
      return {
        message: error.message ?? "The post could not be published.",
        status: "error",
      };
    }

    revalidateNewsPaths(postId);

    return {
      message: "Post published.",
      status: "success",
    };
  } catch (error) {
    unstable_rethrow(error);

    return {
      message:
        error instanceof Error && error.message === "Unauthorized"
          ? "You must be signed in to publish newsroom posts."
          : error instanceof Error && error.message
            ? error.message
            : "The post could not be published.",
      status: "error",
    };
  }
}

export async function unpublishNewsPost(
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

    if (existingPost.status === "draft") {
      return {
        message: "Post is already unpublished.",
        status: "success",
      };
    }

    if (existingPost.status === "archived") {
      return {
        message: "Archived posts cannot be unpublished.",
        status: "error",
      };
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("news_posts")
      .update({
        is_featured: false,
        published_at: existingPost.published_at,
        status: "draft",
        updated_by: userId,
      })
      .eq("id", postId);

    if (error) {
      return {
        message: error.message ?? "The post could not be unpublished.",
        status: "error",
      };
    }

    revalidateNewsPaths(postId);

    return {
      message: "Post moved back to drafts.",
      status: "success",
    };
  } catch (error) {
    unstable_rethrow(error);

    return {
      message:
        error instanceof Error && error.message === "Unauthorized"
          ? "You must be signed in to unpublish newsroom posts."
          : error instanceof Error && error.message
            ? error.message
            : "The post could not be unpublished.",
      status: "error",
    };
  }
}

export async function publishNewsPostFromPreview(
  postId: string,
  redirectTo: string,
  _formData: FormData,
) {
  void _formData;
  const result = await publishNewsPost(postId);

  if (result.status === "error") {
    throw new Error(result.message);
  }

  redirect(redirectTo);
}

export async function unpublishNewsPostFromPreview(
  postId: string,
  redirectTo: string,
  _formData: FormData,
) {
  void _formData;
  const result = await unpublishNewsPost(postId);

  if (result.status === "error") {
    throw new Error(result.message);
  }

  redirect(redirectTo);
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

export async function toggleFeaturedNewsPost(
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

    const admin = createAdminClient();

    if (existingPost.is_featured) {
      const { error } = await admin
        .from("news_posts")
        .update({
          is_featured: false,
          updated_by: userId,
        })
        .eq("id", postId);

      if (error) {
        return {
          message: error.message ?? "The featured post could not be cleared.",
          status: "error",
        };
      }

      revalidateNewsPaths(postId);

      return {
        message: "Featured post cleared.",
        status: "success",
      };
    }

    if (existingPost.status !== "published") {
      return {
        message: "Only published posts can be featured.",
        status: "error",
      };
    }

    const { error } = await admin.rpc("set_featured_news_post", {
      actor_user_id: userId,
      target_post_id: postId,
    });

    if (error) {
      return {
        message: error.message ?? "The featured post could not be updated.",
        status: "error",
      };
    }

    revalidateNewsPaths(postId);

    return {
      message: "Featured post updated.",
      status: "success",
    };
  } catch (error) {
    unstable_rethrow(error);

    return {
      message:
        error instanceof Error && error.message === "Unauthorized"
          ? "You must be signed in to manage the featured post."
          : error instanceof Error && error.message
            ? error.message
            : "The featured post could not be updated.",
      status: "error",
    };
  }
}

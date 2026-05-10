'use client';

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Expand, ExternalLink, Pencil, Plus, X } from "lucide-react";
import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent,
} from "react";
import toast from "react-hot-toast";
import {
  createNewsPost,
  createNewsPostCategory,
  updateNewsPost,
  type NewsPostCategoryFormState,
} from "@/app/dashboard/news-media/actions";
import {
  buildNewsSlug,
  formatNewsDate,
  type NewsArticle,
  type NewsPostCategory,
} from "@/app/lib/news-media";
import {
  dashboardInputClassName,
  NewsModal,
} from "./news-modal";
import { NewsBodyEditor } from "./news-body-editor";

const initialFormState = {
  fieldErrors: {},
  message: "",
  status: "idle" as const,
  submittedAt: null,
};

const initialCategoryFormState: NewsPostCategoryFormState = {
  createdCategory: null,
  fieldErrors: {},
  message: "",
  status: "idle",
  submittedAt: null,
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-2 text-xs font-medium text-[#dc2626]">
      {message}
    </p>
  );
}

function sortCategories(categories: NewsPostCategory[]) {
  return [...categories].sort((left, right) =>
    left.name.localeCompare(right.name, undefined, { sensitivity: "base" }),
  );
}

function NewsPostCategoryModal({
  onCategoryCreated,
  onClose,
}: {
  onCategoryCreated: (category: NewsPostCategory) => void;
  onClose: () => void;
}) {
  const [formState, formAction, isPending] = useActionState(
    createNewsPostCategory,
    initialCategoryFormState,
  );
  const formRef = useRef<HTMLFormElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPending, onClose]);

  useEffect(() => {
    if (!formState.submittedAt || !formState.message) {
      return;
    }

    if (formState.status === "success") {
      toast.success(formState.message);
      return;
    }

    if (formState.status === "error") {
      toast.error(formState.message);
    }
  }, [formState.message, formState.status, formState.submittedAt]);

  useEffect(() => {
    if (formState.status !== "success" || !formState.createdCategory) {
      return;
    }

    onCategoryCreated(formState.createdCategory);
    formRef.current?.reset();
    onClose();
  }, [formState.createdCategory, formState.status, onCategoryCreated, onClose]);

  return (
    <NewsModal
      ariaDescribedBy={descriptionId}
      ariaLabel="Close category dialog"
      ariaLabelledBy={titleId}
      onClose={() => {
        if (!isPending) {
          onClose();
        }
      }}
      title={
        <p
          id={titleId}
          className="font-heading text-base font-bold tracking-[-0.02em] text-[var(--text-primary)]"
        >
          Create category
        </p>
      }
    >
      <form
        ref={formRef}
        action={formAction}
        className="space-y-4 px-5 py-5 sm:px-6"
      >
        <p id={descriptionId} className="sr-only">
          Create a category for newsroom posts.
        </p>
        <label>
          <span className="text-sm font-medium text-[var(--text-primary)]">
            Category Name
          </span>
          <input
            autoFocus
            type="text"
            name="name"
            placeholder="Product Update"
            className={dashboardInputClassName}
          />
          <FieldError message={formState.fieldErrors.name} />
        </label>

        <div className="flex flex-col-reverse gap-2 border-t border-[var(--border-light)] pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] px-4 text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--brand-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Saving..." : "Save category"}
          </button>
        </div>
      </form>
    </NewsModal>
  );
}

export function NewsPostForm({
  initialArticle,
  initialCategories,
  mode,
}: {
  initialArticle: NewsArticle;
  initialCategories: NewsPostCategory[];
  mode: "create" | "edit";
}) {
  const updateAction = updateNewsPost.bind(null, initialArticle.id);
  const [formState, formAction, isPending] = useActionState(
    mode === "create" ? createNewsPost : updateAction,
    initialFormState,
  );
  const router = useRouter();
  const fieldErrors = formState.fieldErrors ?? {};
  const [article, setArticle] = useState<NewsArticle>(initialArticle);
  const [categories, setCategories] = useState<NewsPostCategory[]>(
    sortCategories(initialCategories),
  );
  const [bodyContent, setBodyContent] = useState(initialArticle.body);
  const [hasCustomSlug, setHasCustomSlug] = useState(mode === "edit");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageName, setSelectedImageName] = useState("");
  const [imagePreviewSrc, setImagePreviewSrc] = useState(initialArticle.coverImage);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const previewObjectUrlRef = useRef<string | null>(null);
  const imageModalTitleId = useId();
  const imageModalDescriptionId = useId();
  const isArchived = article.status === "archived";
  const hasImagePreview = imagePreviewSrc.length > 0;
  const isObjectUrlPreview = imagePreviewSrc.startsWith("blob:");
  const previewHref = initialArticle.slug
    ? `/news-media/${initialArticle.slug}?preview=true`
    : "";
  const imagePreviewLabel =
    selectedImageName ||
    (hasImagePreview
      ? "Current featured image"
      : "Choose an image file");
  const imageModalTitle = article.title.trim() || "Untitled post";
  const imageModalDate = article.publishDate
    ? formatNewsDate(article.publishDate)
    : "No publish date selected";
  const saveButtonLabel =
    mode === "create"
      ? isPending
        ? "Creating..."
        : "Create post"
      : isPending
        ? "Saving..."
        : "Save";

  useEffect(() => {
    if (!formState.submittedAt || !formState.message) {
      return;
    }

    if (formState.status === "success") {
      if (mode === "edit") {
        router.refresh();
      }
      toast.success(formState.message);
      return;
    }

    if (formState.status === "error") {
      toast.error(formState.message);
    }
  }, [formState.message, formState.status, formState.submittedAt, mode, router]);

  function clearPreviewObjectUrl() {
    if (!previewObjectUrlRef.current) {
      return;
    }

    URL.revokeObjectURL(previewObjectUrlRef.current);
    previewObjectUrlRef.current = null;
  }

  useEffect(() => clearPreviewObjectUrl, []);

  useEffect(() => {
    if (!isImageModalOpen) {
      return;
    }

    const originalBodyOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsImageModalOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isImageModalOpen]);

  function handleTitleChange(value: string) {
    setArticle((current) => ({
      ...current,
      title: value,
      slug: hasCustomSlug ? current.slug : buildNewsSlug(value),
    }));
  }

  function handleSlugChange(value: string) {
    const nextSlug = buildNewsSlug(value);
    setHasCustomSlug(nextSlug.length > 0);
    setArticle((current) => ({
      ...current,
      slug: nextSlug,
    }));
  }

  function handleFieldChange<Field extends "excerpt" | "publishDate">(
    field: Field,
    value: NewsArticle[Field],
  ) {
    setArticle((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleCategoryChange(categoryId: string) {
    const selectedCategory = categories.find((category) => category.id === categoryId);

    setArticle((current) => ({
      ...current,
      categoryId,
      categoryName: selectedCategory?.name ?? "",
    }));
  }

  function handleCategoryCreated(category: NewsPostCategory) {
    setCategories((current) =>
      sortCategories([
        ...current.filter((existingCategory) => existingCategory.id !== category.id),
        category,
      ]),
    );
    setArticle((current) => ({
      ...current,
      categoryId: category.id,
      categoryName: category.name,
    }));
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      clearPreviewObjectUrl();
      setSelectedImageName("");
      setImagePreviewSrc(initialArticle.coverImage);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(selectedFile);

    clearPreviewObjectUrl();
    previewObjectUrlRef.current = nextPreviewUrl;
    setSelectedImageName(selectedFile.name);
    setImagePreviewSrc(nextPreviewUrl);
  }

  function openImagePicker(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    imageInputRef.current?.click();
  }

  function openImageModal(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!hasImagePreview) {
      return;
    }

    setIsImageModalOpen(true);
  }

  function closeImageModal() {
    setIsImageModalOpen(false);
  }

  function handleToggleStatus() {
    if (isArchived) {
      return;
    }

    setArticle((current) => ({
      ...current,
      status: current.status === "published" ? "draft" : "published",
    }));
  }

  return (
    <>
      <form action={formAction} className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)]">
        <input type="hidden" name="status" value={article.status} />
        <textarea
          hidden
          readOnly
          name="body"
          value={JSON.stringify(bodyContent)}
        />

        <section className="rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] shadow-[var(--shadow-card)]">
          <div className="flex flex-col gap-4 p-6">
            <label>
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Title
              </span>
              <input
                type="text"
                name="title"
                value={article.title}
                onChange={(event) => handleTitleChange(event.target.value)}
                placeholder="Enter the post title"
                className={dashboardInputClassName}
              />
              <FieldError message={fieldErrors.title} />
            </label>

            <div className="grid gap-4 lg:grid-cols-2">
              <label>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  URL slug
                </span>
                <input
                  type="text"
                  name="slug"
                  value={article.slug}
                  onChange={(event) => handleSlugChange(event.target.value)}
                  placeholder="post-url-slug"
                  className={dashboardInputClassName}
                />
                <FieldError message={fieldErrors.slug} />
              </label>

              <label>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  Category
                </span>
                <div className="flex items-end gap-2">
                  <select
                    name="categoryId"
                    value={article.categoryId}
                    onChange={(event) => handleCategoryChange(event.target.value)}
                    className={`${dashboardInputClassName} mt-0`}
                  >
                    <option value="">
                      {categories.length > 0
                        ? "Select a category"
                        : "No categories available"}
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    aria-label="Create category"
                    title="Create category"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                {categories.length === 0 ? (
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    Create the first category before saving this post.
                  </p>
                ) : null}
                <FieldError message={fieldErrors.category} />
              </label>
            </div>

            <label>
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Publish date
              </span>
              <input
                type="date"
                name="publishDate"
                value={article.publishDate}
                onChange={(event) => handleFieldChange("publishDate", event.target.value)}
                className={dashboardInputClassName}
              />
              <FieldError message={fieldErrors.publishDate} />
            </label>

            <label>
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Excerpt
              </span>
              <textarea
                name="excerpt"
                value={article.excerpt}
                onChange={(event) => handleFieldChange("excerpt", event.target.value)}
                rows={5}
                placeholder="Write a short summary for the post listing."
                className={`${dashboardInputClassName} resize-y`}
              />
              <FieldError message={fieldErrors.excerpt} />
            </label>

            <div>
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Body
              </span>
              <NewsBodyEditor
                initialContent={initialArticle.body}
                onChange={setBodyContent}
              />
              <FieldError message={fieldErrors.body} />
            </div>
          </div>
        </section>

        <div className="space-y-6 xl:sticky xl:top-[calc(var(--nav-height)+1.5rem)] xl:self-start">
          <section className="rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-faint)]">
                  Status
                </p>
                <h2 className="mt-1 font-heading text-lg font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                  {article.status === "archived"
                    ? "Archived"
                    : article.status === "published"
                      ? "Published"
                      : "Draft"}
                </h2>
                {isArchived ? (
                  <p className="mt-2 max-w-xs text-xs leading-5 text-[var(--text-muted)]">
                    Restore this post from the manage table to return it to the active newsroom workflow.
                  </p>
                ) : null}
              </div>

              {isArchived ? null : (
                <button
                  type="button"
                  role="switch"
                  aria-checked={article.status === "published"}
                  onClick={handleToggleStatus}
                  className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] ${
                    article.status === "published"
                      ? "border-[var(--tone-green)]/30 bg-[var(--tone-green-soft)]"
                      : "border-[var(--border-light)] bg-[var(--bg-subtle)]"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                      article.status === "published"
                        ? "translate-x-7"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              )}
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow-card)]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-faint)]">
              Featured image
            </p>
            <label className="group block cursor-pointer">
              <span className="sr-only">Upload featured image</span>
              <input
                ref={imageInputRef}
                name="featuredImage"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="sr-only"
              />
              <div className="relative min-h-40 overflow-hidden rounded-2xl border border-[var(--border-light)] bg-[var(--bg-subtle)] transition-colors group-hover:border-[var(--border-orange)] group-focus-within:border-[var(--border-orange)]">
                {hasImagePreview ? (
                  <>
                    <Image
                      src={imagePreviewSrc}
                      alt={article.title || "Featured image preview"}
                      fill
                      sizes="(max-width: 1279px) 100vw, 24rem"
                      className="object-cover transition duration-200 group-hover:scale-[1.02] group-hover:brightness-75 group-focus-within:scale-[1.02] group-focus-within:brightness-75"
                      unoptimized={isObjectUrlPreview}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,17,29,0.04)_0%,rgba(8,17,29,0.16)_45%,rgba(8,17,29,0.7)_100%)] transition group-hover:bg-[linear-gradient(180deg,rgba(8,17,29,0.16)_0%,rgba(8,17,29,0.3)_45%,rgba(8,17,29,0.78)_100%)] group-focus-within:bg-[linear-gradient(180deg,rgba(8,17,29,0.16)_0%,rgba(8,17,29,0.3)_45%,rgba(8,17,29,0.78)_100%)]" />
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-[var(--border-light)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        Add a featured image
                      </p>
                      <p className="text-xs leading-5 text-[var(--text-muted)]">
                        Upload a JPG, PNG, or WEBP image up to 5 MB.
                      </p>
                    </div>
                  </div>
                )}
                {hasImagePreview ? (
                  <div className="absolute right-4 top-4 z-10 flex items-center gap-2 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                    <button
                      type="button"
                      aria-label="View featured image fullscreen"
                      onClick={openImageModal}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/14 text-white shadow-sm backdrop-blur-sm transition hover:bg-white/22 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                    >
                      <Expand className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label="Edit featured image"
                      onClick={openImagePicker}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/14 text-white shadow-sm backdrop-blur-sm transition hover:bg-white/22 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ) : null}
                {hasImagePreview ? (
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-sm font-semibold text-white">
                      {imagePreviewLabel}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/78">
                      JPG, PNG, or WEBP up to 5 MB.
                    </p>
                  </div>
                ) : null}
              </div>
            </label>
            <FieldError message={fieldErrors.featuredImage} />
          </section>

          <section className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--brand-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveButtonLabel}
            </button>
            {mode === "edit" ? (
              initialArticle.slug ? (
                <Link
                  href={previewHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Preview post"
                  title="Preview"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  aria-label="Preview unavailable"
                  title="Preview unavailable"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] text-[var(--text-faint)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </button>
              )
            ) : null}
          </section>
        </div>
      </form>

      {isImageModalOpen && hasImagePreview ? (
        <div className="fixed inset-0 z-[80] bg-black/88 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close image viewer"
            onClick={closeImageModal}
            className="absolute inset-0"
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={imageModalTitleId}
            aria-describedby={imageModalDescriptionId}
            className="relative flex h-full w-full items-center justify-center"
          >
            <button
              type="button"
              aria-label="Close image viewer"
              onClick={closeImageModal}
              className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-black/30 text-white shadow-sm backdrop-blur-sm transition hover:bg-black/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:right-6 sm:top-6"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="relative h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] sm:h-[calc(100vh-3rem)] sm:w-[calc(100vw-3rem)]">
              <Image
                src={imagePreviewSrc}
                alt={article.title || "Featured image preview"}
                fill
                sizes="100vw"
                className="object-contain"
                unoptimized={isObjectUrlPreview}
                priority
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.72)_100%)]" />
              <div className="absolute bottom-4 left-4 z-10 max-w-[min(30rem,calc(100%-2rem))] text-white sm:bottom-6 sm:left-6">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white/65">
                  Featured image
                </p>
                <h2
                  id={imageModalTitleId}
                  className="mt-2 font-heading text-xl font-semibold leading-tight tracking-[-0.03em] sm:text-2xl"
                >
                  {imageModalTitle}
                </h2>
                <p
                  id={imageModalDescriptionId}
                  className="mt-2 text-sm text-white/78"
                >
                  {imageModalDate}
                </p>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {isCategoryModalOpen ? (
        <NewsPostCategoryModal
          onCategoryCreated={handleCategoryCreated}
          onClose={() => setIsCategoryModalOpen(false)}
        />
      ) : null}
    </>
  );
}

"use client";

import {
  useActionState,
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
} from "react";
import { Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { ConfirmationModal } from "@/app/components/dashboard/confirmation-modal";
import { SidePanel } from "@/app/components/dashboard/side-panel";
import type { NewsPostCategory } from "@/app/lib/news-media";
import {
  createNewsPostCategory,
  deleteNewsPostCategory,
  inspectNewsPostCategoryDeletion,
  type NewsPostCategoryDeleteResult,
  type NewsPostCategoryFormState,
} from "./actions";
import { dashboardInputClassName } from "./news-modal";

const initialCategoryFormState: NewsPostCategoryFormState = {
  createdCategory: null,
  fieldErrors: {},
  message: "",
  status: "idle",
  submittedAt: null,
};

type DeleteDraft = {
  categoryId: string;
  postCount: number;
  replacementCategoryId: string;
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-xs font-medium text-[#dc2626]">{message}</p>;
}

function getDefaultReplacementCategoryId(
  categories: NewsPostCategory[],
  excludedCategoryId: string,
) {
  return (
    categories.find((category) => category.id !== excludedCategoryId)?.id ?? ""
  );
}

export function NewsCategoryPanel({
  categories,
  isOpen,
  onCategoryCreated,
  onCategoryDeleted,
  onClose,
  selectedCategoryId,
}: {
  categories: NewsPostCategory[];
  isOpen: boolean;
  onCategoryCreated: (category: NewsPostCategory) => void;
  onCategoryDeleted: (result: NewsPostCategoryDeleteResult) => void;
  onClose: () => void;
  selectedCategoryId: string;
}) {
  const [formState, formAction, isCreatePending] = useActionState(
    createNewsPostCategory,
    initialCategoryFormState,
  );
  const [deleteDraft, setDeleteDraft] = useState<DeleteDraft | null>(null);
  const [previewCategoryId, setPreviewCategoryId] = useState<string | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const lastHandledCreateSubmissionRef = useRef<number | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const isDeleteModalOpen = deleteDraft !== null;
  const isBusy =
    isCreatePending ||
    previewCategoryId !== null ||
    deleteCategoryId !== null;
  const notifyCategoryCreated = useEffectEvent(onCategoryCreated);
  const deleteReplacementOptions = deleteDraft
    ? categories.filter((category) => category.id !== deleteDraft.categoryId)
    : [];

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
    if (
      formState.status !== "success" ||
      !formState.createdCategory ||
      !formState.submittedAt
    ) {
      return;
    }

    if (lastHandledCreateSubmissionRef.current === formState.submittedAt) {
      return;
    }

    lastHandledCreateSubmissionRef.current = formState.submittedAt;
    notifyCategoryCreated(formState.createdCategory);
    formRef.current?.reset();
  }, [
    formState.createdCategory,
    formState.status,
    formState.submittedAt,
  ]);

  useEffect(() => {
    if (!deleteDraft) {
      return;
    }

    if (!categories.some((category) => category.id === deleteDraft.categoryId)) {
      setDeleteDraft(null);
      return;
    }

    if (deleteDraft.postCount === 0) {
      return;
    }

    if (
      deleteDraft.replacementCategoryId &&
      categories.some(
        (category) => category.id === deleteDraft.replacementCategoryId,
      )
    ) {
      return;
    }

    setDeleteDraft((current) =>
      current
        ? {
            ...current,
            replacementCategoryId: getDefaultReplacementCategoryId(
              categories,
              current.categoryId,
            ),
          }
        : current,
    );
  }, [categories, deleteDraft]);

  useEffect(() => {
    if (isOpen) {
      return;
    }

    setDeleteDraft(null);
    setPreviewCategoryId(null);
    setDeleteCategoryId(null);
  }, [isOpen]);

  async function openDeletePrompt(categoryId: string) {
    if (previewCategoryId || deleteCategoryId) {
      return;
    }

    if (deleteDraft?.categoryId === categoryId) {
      setDeleteDraft(null);
      return;
    }

    setPreviewCategoryId(categoryId);

    try {
      const result = await inspectNewsPostCategoryDeletion(categoryId);

      if (result.status === "error" || !result.categoryId) {
        toast.error(result.message);
        return;
      }

      setDeleteDraft({
        categoryId: result.categoryId,
        postCount: result.postCount,
        replacementCategoryId: getDefaultReplacementCategoryId(
          categories,
          result.categoryId,
        ),
      });
    } catch {
      toast.error("The category usage could not be checked.");
    } finally {
      setPreviewCategoryId(null);
    }
  }

  async function confirmDeleteCategory() {
    if (!deleteDraft) {
      return;
    }

    if (deleteDraft.postCount > 0 && !deleteDraft.replacementCategoryId) {
      toast.error("Create another category first so these posts can be reassigned.");
      return;
    }

    setDeleteCategoryId(deleteDraft.categoryId);

    try {
      const result = await deleteNewsPostCategory(
        deleteDraft.categoryId,
        deleteDraft.postCount > 0
          ? deleteDraft.replacementCategoryId
          : undefined,
      );

      if (result.status === "error" || !result.deletedCategoryId) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      onCategoryDeleted(result);
      setDeleteDraft(null);
    } catch {
      toast.error("The category could not be deleted.");
    } finally {
      setDeleteCategoryId(null);
    }
  }

  return (
    <>
      <SidePanel
      ariaDescribedBy={descriptionId}
      ariaLabel="Close category panel"
      ariaLabelledBy={titleId}
      canClose={!isBusy && !isDeleteModalOpen}
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="space-y-1">
          <p
            id={titleId}
            className="font-heading text-base font-bold tracking-[-0.02em] text-[var(--text-primary)]"
          >
            Manage categories
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            Create, review, and safely delete newsroom categories.
          </p>
        </div>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <p id={descriptionId} className="sr-only">
          Create new categories and delete existing categories from a side panel.
        </p>

        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          <form ref={formRef} action={formAction} className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Category Name
              </span>
              <div className="flex items-end gap-2">
                <input
                  autoFocus
                  type="text"
                  name="name"
                  placeholder="Product Update"
                  className={`${dashboardInputClassName} mt-0 flex-1`}
                />
                <button
                  type="submit"
                  disabled={isCreatePending}
                  className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--brand-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreatePending ? "Saving..." : "Save"}
                </button>
              </div>
              <FieldError message={formState.fieldErrors.name} />
            </label>
          </form>

          <div className="my-5 border-t border-[var(--border-light)]" />

          <div className="space-y-3">
            {categories.length > 0 ? (
              categories.map((category) => {
                const isPreviewPending = previewCategoryId === category.id;

                return (
                  <div
                    key={category.id}
                    className="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-subtle)]/55 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                          {category.name}
                        </p>
                        {selectedCategoryId === category.id ? (
                          <p className="mt-1 text-xs text-[var(--text-muted)]">
                            Currently selected in this form
                          </p>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        onClick={() => openDeletePrompt(category.id)}
                        disabled={isBusy}
                        aria-label={`Delete ${category.name}`}
                        title="Delete category"
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] text-[#dc2626] transition hover:border-red-400/40 hover:bg-red-50/70 hover:text-red-600 dark:hover:border-red-500/30 dark:hover:bg-red-950/30 dark:hover:text-red-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f87171] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-subtle)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isPreviewPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--border-light)] bg-[var(--bg-subtle)]/45 px-4 py-6 text-center text-sm text-[var(--text-muted)]">
                No categories yet. Create the first one above.
              </div>
            )}
          </div>
        </div>
      </div>
      </SidePanel>

      <ConfirmationModal
        isOpen={deleteDraft !== null}
        isPending={deleteDraft !== null && deleteCategoryId === deleteDraft.categoryId}
        isConfirmDisabled={
          deleteDraft !== null &&
          deleteDraft.postCount > 0 &&
          deleteReplacementOptions.length === 0
        }
        title="Delete this category?"
        confirmLabel={
          deleteDraft?.postCount
            ? "Reassign and delete"
            : "Delete category"
        }
        pendingLabel="Deleting..."
        tone="danger"
        maxWidthClassName="max-w-lg"
        onClose={() => setDeleteDraft(null)}
        onConfirm={confirmDeleteCategory}
      >
        {deleteDraft ? (
          <div className="space-y-4">
            {deleteDraft.postCount > 0 ? (
              <>
                <p>
                  {deleteDraft.postCount} post
                  {deleteDraft.postCount === 1 ? "" : "s"} currently use this
                  category. Choose a replacement so no post is left without a
                  category.
                </p>

                {deleteReplacementOptions.length > 0 ? (
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      Reassign posts to
                    </span>
                    <select
                      value={deleteDraft.replacementCategoryId}
                      onChange={(event) =>
                        setDeleteDraft((current) =>
                          current
                            ? {
                                ...current,
                                replacementCategoryId: event.target.value,
                              }
                            : current,
                        )
                      }
                      className={dashboardInputClassName}
                    >
                      <option value="">Select a replacement category</option>
                      {deleteReplacementOptions.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <div className="rounded-xl border border-[var(--border-light)] bg-[var(--bg-subtle)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
                    Create another category first, then return here to reassign
                    these posts before deleting this category.
                  </div>
                )}
              </>
            ) : (
              <p>
                Delete this unused category? This action cannot be undone.
              </p>
            )}
          </div>
        ) : null}
      </ConfirmationModal>
    </>
  );
}

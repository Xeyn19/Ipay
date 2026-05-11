"use client";

import type { ReactNode } from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ChevronDown,
  ChevronRight,
  Columns3,
  Eraser,
  ImageUp,
  MessageSquare,
  Palette,
  Rows3,
  TableCellsMerge,
  Trash2,
} from "lucide-react";
import {
  DEFAULT_TEXT_STYLE_COLORS,
} from "@/app/lib/news-body-text-styles";
import {
  getNewsBodyImageSizeLabel,
  NEWS_BODY_IMAGE_SIZE_PRESETS,
  type NewsBodyImageAlignment,
} from "@/app/lib/news-body-images";
import { dashboardInputClassName } from "../../news-modal";
import type {
  ColorMenuMode,
  TableCellHorizontalAlignment,
} from "../types";
import type { NewsBodyEditorController } from "../hooks/use-news-body-editor";
import { CellPropertiesGridIcon } from "./icons";
import {
  ColorGrid,
  MenuItem,
  MenuSectionLabel,
  MenuSeparator,
  MenuToggleItem,
  TableBubbleMenuPanel,
  ToolbarButton,
  ToolbarMenuButton,
  ToolbarSplitMenuButton,
} from "./primitives";

export const textAlignmentOptions: Array<{
  icon: ReactNode;
  label: string;
  value: TableCellHorizontalAlignment;
}> = [
  {
    icon: <AlignLeft className="h-4 w-4" />,
    label: "Align Left",
    value: "left",
  },
  {
    icon: <AlignRight className="h-4 w-4" />,
    label: "Align Right",
    value: "right",
  },
  {
    icon: <AlignCenter className="h-4 w-4" />,
    label: "Align Center",
    value: "center",
  },
  {
    icon: <AlignJustify className="h-4 w-4" />,
    label: "Justify",
    value: "justify",
  },
];

const imageAlignmentOptions: Array<{
  icon: ReactNode;
  label: string;
  value: NewsBodyImageAlignment;
}> = [
  {
    icon: <AlignLeft className="h-4 w-4" />,
    label: "Align left",
    value: "left",
  },
  {
    icon: <AlignCenter className="h-4 w-4" />,
    label: "Align center",
    value: "center",
  },
  {
    icon: <AlignRight className="h-4 w-4" />,
    label: "Align right",
    value: "right",
  },
];

function DocumentColorSection({
  activeColor,
  closeAfterSelect = true,
  colors,
  controller,
  onSelect,
}: {
  activeColor: string | null;
  closeAfterSelect?: boolean;
  colors: string[];
  controller: NewsBodyEditorController;
  onSelect: (color: string) => void;
}) {
  if (colors.length === 0) {
    return (
      <div className="px-3 py-2 text-sm text-[var(--text-faint)]" role="none">
        No document colors yet
      </div>
    );
  }

  return (
    <ColorGrid
      activeColor={activeColor}
      colors={colors}
      columns={5}
      onSelect={(color) => {
        if (closeAfterSelect) {
          controller.commands.runAction(() => onSelect(color));
          return;
        }

        onSelect(color);
      }}
    />
  );
}

export function ColorMenuContent({
  controller,
  includeColorPicker,
  mode,
}: {
  controller: NewsBodyEditorController;
  includeColorPicker: boolean;
  mode: ColorMenuMode;
}) {
  const { colors, commands, derivedState, font, table } = controller;
  const isTextColorMode = mode === "text";
  const isCellBackgroundMode = mode === "cell-background";
  const activeColor = isTextColorMode
    ? derivedState.selectedTextColor
    : isCellBackgroundMode
      ? derivedState.selectedCellBackgroundColor
      : derivedState.selectedBackgroundColor;
  const documentPalette = isTextColorMode
    ? derivedState.documentColors.textColors
    : derivedState.documentColors.backgroundColors;
  const canRemoveColor = isCellBackgroundMode
    ? derivedState.hasSelectedCellBackgroundColor
    : Boolean(activeColor);

  return (
    <>
      <MenuItem
        icon={<Eraser className="h-4 w-4" />}
        disabled={!canRemoveColor}
        onClick={() =>
          isCellBackgroundMode
            ? table.unsetSelectedTableCellBackgroundColor()
            : commands.runAction(() =>
                isTextColorMode
                  ? font.unsetTextColorValue()
                  : font.unsetBackgroundColorValue(),
              )
        }
      >
        Remove color
      </MenuItem>
      <ColorGrid
        activeColor={activeColor}
        colors={DEFAULT_TEXT_STYLE_COLORS}
        columns={5}
        onSelect={(color) => {
          if (isCellBackgroundMode) {
            table.setSelectedTableCellBackgroundColor(color);
            return;
          }

          commands.runAction(() =>
            isTextColorMode
              ? font.setTextColorValue(color)
              : font.setBackgroundColorValue(color),
          );
        }}
      />
      <MenuSectionLabel>Document Colors</MenuSectionLabel>
      <DocumentColorSection
        activeColor={activeColor}
        closeAfterSelect={!isCellBackgroundMode}
        colors={documentPalette}
        controller={controller}
        onSelect={(color) => {
          if (isCellBackgroundMode) {
            table.setSelectedTableCellBackgroundColor(color);
            return;
          }

          if (isTextColorMode) {
            font.setTextColorValue(color);
            return;
          }

          font.setBackgroundColorValue(color);
        }}
      />
      {includeColorPicker ? (
        <>
          <MenuSeparator />
          <MenuItem
            icon={<Palette className="h-4 w-4" />}
            onClick={() => colors.openColorPicker(mode)}
          >
            Color Picker
          </MenuItem>
        </>
      ) : null}
    </>
  );
}

function CellPropertiesPanel({
  controller,
}: {
  controller: NewsBodyEditorController;
}) {
  const { derivedState, menu, table } = controller;
  const backgroundButtonLabel = derivedState.selectedCellBackgroundColor
    ? derivedState.selectedCellBackgroundColor
    : derivedState.hasSelectedCellBackgroundColor
      ? "Mixed"
      : "Select color";

  return (
    <div className="news-body-editor__table-bubble news-body-editor__cell-properties-bubble">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Back to table actions"
          onMouseDown={(event) => event.preventDefault()}
          onClick={menu.closeCellPropertiesView}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
        >
          <ChevronRight className="h-4 w-4 rotate-180" aria-hidden="true" />
        </button>
        <p className="font-heading text-sm font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
          Cell Properties
        </p>
      </div>

      <div className="news-body-editor__cell-properties-grid">
        <div className="space-y-2">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[var(--text-faint)]">
            Background
          </p>
          <div className="relative">
            <button
              type="button"
              aria-label="Cell background color options"
              aria-expanded={menu.openCellPropertiesMenu === "background-color"}
              aria-haspopup="menu"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => menu.toggleCellPropertiesMenu("background-color")}
              className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] ${
                menu.openCellPropertiesMenu === "background-color"
                  ? "border-[var(--border-orange)] bg-[var(--brand-pale)] text-[var(--brand)]"
                  : "border-[var(--border-light)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
              }`}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="h-4 w-4 shrink-0 rounded-md border border-black/10"
                  style={{
                    backgroundColor:
                      derivedState.selectedCellBackgroundColor ?? "var(--bg-subtle)",
                  }}
                />
                <span className="truncate">{backgroundButtonLabel}</span>
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform ${
                  menu.openCellPropertiesMenu === "background-color"
                    ? "rotate-180"
                    : ""
                }`}
                aria-hidden="true"
              />
            </button>

            {menu.openCellPropertiesMenu === "background-color" ? (
              <TableBubbleMenuPanel className="min-w-[17rem]">
                <ColorMenuContent
                  controller={controller}
                  includeColorPicker
                  mode="cell-background"
                />
              </TableBubbleMenuPanel>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[var(--text-faint)]">
            Dimensions
          </p>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              aria-label="Cell padding in pixels"
              placeholder="padding"
              value={table.cellPaddingInputValue}
              onChange={(event) => table.setCellPaddingInputValue(event.target.value)}
              onBlur={table.commitCellPaddingInput}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  table.commitCellPaddingInput();
                }
              }}
              className={`${dashboardInputClassName} !mt-0`}
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
              px
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[var(--text-faint)]">
          Table Cell Text Alignment
        </p>
        <div className="news-body-editor__cell-alignment-group">
          {textAlignmentOptions.map((option) => (
            <ToolbarButton
              key={option.value}
              ariaLabel={option.label}
              isActive={derivedState.selectedCellHorizontalAlignment === option.value}
              onClick={() =>
                table.setSelectedTableCellHorizontalAlignment(option.value)
              }
            >
              {option.icon}
            </ToolbarButton>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TableBubbleMenu({
  controller,
}: {
  controller: NewsBodyEditorController;
}) {
  const { derivedState, editor, menu, table } = controller;

  if (menu.openTableBubbleSubmenu === "cell-properties") {
    return <CellPropertiesPanel controller={controller} />;
  }

  return (
    <div className="news-body-editor__table-bubble">
      <div className="relative">
        <ToolbarMenuButton
          ariaLabel="Column actions"
          icon={<Columns3 className="h-4 w-4" aria-hidden="true" />}
          isOpen={menu.openTableBubbleSubmenu === "columns"}
          onClick={() => menu.toggleTableBubbleSubmenu("columns")}
        />

        {menu.openTableBubbleSubmenu === "columns" ? (
          <TableBubbleMenuPanel className="min-w-52">
            <MenuToggleItem
              checked={derivedState.currentColumnIsHeader}
              disabled={!derivedState.canToggleHeaderColumn}
              onClick={() =>
                table.runTableBubbleAction(() => table.toggleHeaderAxis("columns"))
              }
            >
              Header column
            </MenuToggleItem>
            <MenuSeparator />
            <MenuItem
              onClick={() =>
                table.runTableBubbleAction(() =>
                  editor?.chain().focus().addColumnBefore().run(),
                )
              }
            >
              Insert column left
            </MenuItem>
            <MenuItem
              onClick={() =>
                table.runTableBubbleAction(() =>
                  editor?.chain().focus().addColumnAfter().run(),
                )
              }
            >
              Insert column right
            </MenuItem>
            <MenuItem
              onClick={() =>
                table.runTableBubbleAction(() =>
                  editor?.chain().focus().deleteColumn().run(),
                )
              }
            >
              Delete column
            </MenuItem>
            <MenuItem
              onClick={() =>
                table.runTableBubbleAction(() => table.selectTableAxis("columns"))
              }
            >
              Select column
            </MenuItem>
          </TableBubbleMenuPanel>
        ) : null}
      </div>

      <div className="relative">
        <ToolbarMenuButton
          ariaLabel="Row actions"
          icon={<Rows3 className="h-4 w-4" aria-hidden="true" />}
          isOpen={menu.openTableBubbleSubmenu === "rows"}
          onClick={() => menu.toggleTableBubbleSubmenu("rows")}
        />

        {menu.openTableBubbleSubmenu === "rows" ? (
          <TableBubbleMenuPanel className="min-w-52">
            <MenuToggleItem
              checked={derivedState.currentRowIsHeader}
              disabled={!derivedState.canToggleHeaderRow}
              onClick={() =>
                table.runTableBubbleAction(() => table.toggleHeaderAxis("rows"))
              }
            >
              Header row
            </MenuToggleItem>
            <MenuSeparator />
            <MenuItem
              onClick={() =>
                table.runTableBubbleAction(() =>
                  editor?.chain().focus().addRowBefore().run(),
                )
              }
            >
              Insert row above
            </MenuItem>
            <MenuItem
              onClick={() =>
                table.runTableBubbleAction(() =>
                  editor?.chain().focus().addRowAfter().run(),
                )
              }
            >
              Insert row below
            </MenuItem>
            <MenuItem
              onClick={() =>
                table.runTableBubbleAction(() =>
                  editor?.chain().focus().deleteRow().run(),
                )
              }
            >
              Delete row
            </MenuItem>
            <MenuItem
              onClick={() =>
                table.runTableBubbleAction(() => table.selectTableAxis("rows"))
              }
            >
              Select row
            </MenuItem>
          </TableBubbleMenuPanel>
        ) : null}
      </div>

      <div className="relative">
        <ToolbarSplitMenuButton
          ariaLabel="Merge or split selected cells"
          ariaMenuLabel="Merge and split cell options"
          icon={<TableCellsMerge className="h-4 w-4" aria-hidden="true" />}
          isOpen={menu.openTableBubbleSubmenu === "merge"}
          menuDisabled={
            !derivedState.hasDirectionalMergeAction && !derivedState.canSplitCell
          }
          onClick={() => table.runTableBubbleAction(table.toggleMergeSelectedCells)}
          onMenuClick={() => menu.toggleTableBubbleSubmenu("merge")}
          primaryDisabled={
            !derivedState.canMergeSelection && !derivedState.canSplitCell
          }
        />

        {menu.openTableBubbleSubmenu === "merge" ? (
          <TableBubbleMenuPanel className="min-w-52">
            <MenuItem
              disabled={!derivedState.canMergeDirection.up}
              onClick={() =>
                table.runTableBubbleAction(() => table.mergeCellInDirection("up"))
              }
            >
              Merge cell up
            </MenuItem>
            <MenuItem
              disabled={!derivedState.canMergeDirection.right}
              onClick={() =>
                table.runTableBubbleAction(() =>
                  table.mergeCellInDirection("right"),
                )
              }
            >
              Merge cell right
            </MenuItem>
            <MenuItem
              disabled={!derivedState.canMergeDirection.down}
              onClick={() =>
                table.runTableBubbleAction(() => table.mergeCellInDirection("down"))
              }
            >
              Merge cell down
            </MenuItem>
            <MenuItem
              disabled={!derivedState.canMergeDirection.left}
              onClick={() =>
                table.runTableBubbleAction(() => table.mergeCellInDirection("left"))
              }
            >
              Merge cell left
            </MenuItem>
            <MenuSeparator />
            <MenuItem
              disabled={!derivedState.canSplitCell}
              onClick={() => table.runTableBubbleAction(table.splitSelectedCell)}
            >
              Split cell
            </MenuItem>
          </TableBubbleMenuPanel>
        ) : null}
      </div>

      <div
        className="mx-0.5 h-7 w-px self-center bg-[var(--border-light)]"
        aria-hidden="true"
      />

      <ToolbarButton
        ariaLabel="Cell properties"
        onClick={menu.openCellPropertiesView}
      >
        <CellPropertiesGridIcon />
      </ToolbarButton>

      <div
        className="mx-0.5 h-7 w-px self-center bg-[var(--border-light)]"
        aria-hidden="true"
      />

      <ToolbarButton
        ariaLabel="Delete table"
        onClick={() =>
          table.runTableBubbleAction(() =>
            editor?.chain().focus().deleteTable().run(),
          )
        }
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>
    </div>
  );
}

function ImageAlignmentMenuContent({
  controller,
}: {
  controller: NewsBodyEditorController;
}) {
  const { derivedState, image } = controller;

  return imageAlignmentOptions.map((option) => (
    <MenuItem
      key={option.value}
      icon={option.icon}
      isActive={derivedState.selectedImage?.alignment === option.value}
      onClick={() =>
        image.runImageBubbleAction(() =>
          image.updateSelectedImageAttributes({ alignment: option.value }),
        )
      }
    >
      {option.label}
    </MenuItem>
  ));
}

function ImageSizeMenuContent({
  controller,
}: {
  controller: NewsBodyEditorController;
}) {
  const { derivedState, image } = controller;

  return NEWS_BODY_IMAGE_SIZE_PRESETS.map((option) => (
    <MenuItem
      key={option.label}
      isActive={derivedState.selectedImage?.width === option.value}
      onClick={() =>
        image.runImageBubbleAction(() =>
          image.updateSelectedImageAttributes({ width: option.value }),
        )
      }
    >
      {option.label}
    </MenuItem>
  ));
}

export function ImageBubbleMenu({
  controller,
}: {
  controller: NewsBodyEditorController;
}) {
  const { derivedState, image, menu } = controller;
  const selectedImage = derivedState.selectedImage;

  if (!selectedImage) {
    return null;
  }

  if (menu.isImageAltEditorOpen) {
    return (
      <div className="news-body-editor__table-bubble news-body-editor__image-bubble news-body-editor__image-alt-bubble">
        <input
          autoFocus
          type="text"
          value={image.imageAltInputValue}
          onChange={(event) => image.setImageAltInputValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              image.saveSelectedImageAlt();
            }

            if (event.key === "Escape") {
              event.preventDefault();
              menu.setIsImageAltEditorOpen(false);
            }
          }}
          placeholder="Describe this image"
          className={`${dashboardInputClassName} news-body-editor__image-alt-input !mt-0`}
        />
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={image.saveSelectedImageAlt}
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border-orange)] bg-[var(--brand-pale)] px-3 text-sm font-semibold text-[var(--brand)] transition hover:bg-[var(--brand)]/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
        >
          Save
        </button>
      </div>
    );
  }

  const selectedAlignmentOption = imageAlignmentOptions.find(
    (option) => option.value === selectedImage.alignment,
  );

  return (
    <div className="news-body-editor__table-bubble news-body-editor__image-bubble">
      <ToolbarButton ariaLabel="Edit image alt text" onClick={image.openImageAltEditor}>
        <MessageSquare className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>

      <div
        className="mx-0.5 h-7 w-px self-center bg-[var(--border-light)]"
        aria-hidden="true"
      />

      <div className="relative">
        <ToolbarMenuButton
          ariaLabel="Image alignment options"
          icon={selectedAlignmentOption?.icon ?? <AlignCenter className="h-4 w-4" />}
          isOpen={menu.openImageBubbleSubmenu === "alignment"}
          onClick={() => menu.toggleImageBubbleSubmenu("alignment")}
        />

        {menu.openImageBubbleSubmenu === "alignment" ? (
          <TableBubbleMenuPanel className="min-w-48">
            <ImageAlignmentMenuContent controller={controller} />
          </TableBubbleMenuPanel>
        ) : null}
      </div>

      <div className="relative">
        <ToolbarMenuButton
          ariaLabel="Image size options"
          icon={<ImageUp className="h-4 w-4" aria-hidden="true" />}
          isOpen={menu.openImageBubbleSubmenu === "size"}
          label={getNewsBodyImageSizeLabel(selectedImage.width)}
          onClick={() => menu.toggleImageBubbleSubmenu("size")}
        />

        {menu.openImageBubbleSubmenu === "size" ? (
          <TableBubbleMenuPanel className="min-w-40">
            <ImageSizeMenuContent controller={controller} />
          </TableBubbleMenuPanel>
        ) : null}
      </div>

      <div
        className="mx-0.5 h-7 w-px self-center bg-[var(--border-light)]"
        aria-hidden="true"
      />

      <ToolbarButton ariaLabel="Delete image" onClick={image.deleteSelectedImage}>
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>
    </div>
  );
}

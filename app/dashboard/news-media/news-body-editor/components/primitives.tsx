"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useCanHover } from "../hooks/use-can-hover";

export function ToolbarButton({
  ariaLabel,
  children,
  disabled = false,
  isActive = false,
  onClick,
  title,
}: {
  ariaLabel: string;
  children: ReactNode;
  disabled?: boolean;
  isActive?: boolean;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={isActive}
      title={title}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] disabled:cursor-not-allowed disabled:opacity-50 ${
        isActive
          ? "border-[var(--border-orange)] bg-[var(--brand-pale)] text-[var(--brand)]"
          : "border-[var(--border-light)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
      }`}
    >
      {children}
    </button>
  );
}

export function ToolbarMenuButton({
  ariaLabel,
  icon,
  isActive = false,
  isOpen,
  label,
  swatchColor,
  onClick,
}: {
  ariaLabel: string;
  icon: ReactNode;
  isActive?: boolean;
  isOpen: boolean;
  label?: string;
  swatchColor?: string | null;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-expanded={isOpen}
      aria-haspopup="menu"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`inline-flex h-8 min-w-4 items-center justify-between gap-1 rounded-lg border px-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] ${
        isOpen || isActive
          ? "border-[var(--border-orange)] bg-[var(--brand-pale)] text-[var(--brand)]"
          : "border-[var(--border-light)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
      }`}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
          {icon}
          {swatchColor ? (
            <span
              className="absolute -bottom-1 left-0 right-0 h-1 rounded-full border border-black/10"
              style={{ backgroundColor: swatchColor }}
            />
          ) : null}
        </span>
        {label ? <span className="truncate">{label}</span> : null}
      </span>
      <ChevronDown
        size={12}
        className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        aria-hidden="true"
      />
    </button>
  );
}

export function ToolbarSplitMenuButton({
  ariaLabel,
  ariaMenuLabel,
  isActive = false,
  menuDisabled = false,
  icon,
  isOpen,
  onClick,
  onMenuClick,
  primaryDisabled = false,
}: {
  ariaLabel: string;
  ariaMenuLabel: string;
  isActive?: boolean;
  menuDisabled?: boolean;
  icon: ReactNode;
  isOpen: boolean;
  onClick: () => void;
  onMenuClick: () => void;
  primaryDisabled?: boolean;
}) {
  const isVisuallyActive = isOpen || isActive;
  const isFullyDisabled = primaryDisabled && menuDisabled;

  return (
    <div
      className={`inline-flex h-8 overflow-hidden rounded-lg border transition-colors ${
        isVisuallyActive
          ? "border-[var(--border-orange)] bg-[var(--brand-pale)] text-[var(--brand)]"
          : "border-[var(--border-light)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
      } ${isFullyDisabled ? "opacity-50" : ""}`}
    >
      <button
        type="button"
        aria-label={ariaLabel}
        disabled={primaryDisabled}
        onMouseDown={(event) => event.preventDefault()}
        onClick={onClick}
        className="inline-flex h-full min-w-8 items-center justify-center px-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-inset disabled:cursor-not-allowed"
      >
        {icon}
      </button>
      <button
        type="button"
        aria-label={ariaMenuLabel}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        disabled={menuDisabled}
        onMouseDown={(event) => event.preventDefault()}
        onClick={onMenuClick}
        className="inline-flex h-full w-4 items-center justify-center border-l border-current/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-inset disabled:cursor-not-allowed"
      >
        <ChevronDown
          size={12}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

export function ToolbarSeparator() {
  return (
    <div
      className="mx-0.5 h-8 w-px self-center bg-[var(--border-light)]"
      aria-hidden="true"
    />
  );
}

export function MenuSeparator() {
  return (
    <div className="my-1 h-px bg-[var(--border-light)]" role="separator" />
  );
}

export function MenuSectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      className="px-3 pb-1 pt-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[var(--text-faint)]"
      role="presentation"
    >
      {children}
    </div>
  );
}

export function EmptyMenuItem() {
  return (
    <div className="px-3 py-2 text-sm text-[var(--text-faint)]" role="none">
      No options yet
    </div>
  );
}

export function MenuItem({
  children,
  icon,
  isActive = false,
  shortcut,
  disabled = false,
  onClick,
}: {
  children: ReactNode;
  icon?: ReactNode;
  isActive?: boolean;
  shortcut?: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        isActive
          ? "bg-[var(--brand-pale)] font-medium text-[var(--brand)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
      }`}
    >
      <span
        className="flex h-4 w-4 shrink-0 items-center justify-center"
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
      {shortcut ? (
        <kbd className="ml-4 shrink-0 text-xs font-medium text-[var(--text-faint)]">
          {shortcut}
        </kbd>
      ) : null}
    </button>
  );
}

export function MenuToggleItem({
  checked,
  children,
  disabled = false,
  onClick,
}: {
  checked: boolean;
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-checked={checked}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="min-w-0 flex-1">{children}</span>
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-[var(--brand)]" : "bg-[var(--border-light)]"
        }`}
        aria-hidden="true"
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

export function ColorGrid({
  activeColor,
  colors,
  columns,
  onSelect,
}: {
  activeColor?: string | null;
  colors: string[];
  columns: 3 | 5;
  onSelect: (color: string) => void;
}) {
  const gridClassName = columns === 3 ? "grid-cols-3" : "grid-cols-5";
  const normalizedActiveColor = activeColor?.trim().toLowerCase() ?? null;

  return (
    <div className={`grid ${gridClassName} gap-2 px-3 py-2`} role="none">
      {colors.map((color) => {
        const isActive = normalizedActiveColor === color.trim().toLowerCase();

        return (
          <button
            key={color}
            type="button"
            role="menuitem"
            aria-label={`Select color ${color}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onSelect(color)}
            className={`h-8 w-full rounded-md border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] ${
              isActive
                ? "border-[var(--brand)] ring-2 ring-[var(--brand)]/25"
                : "border-black/10 hover:border-[var(--border-orange)]"
            }`}
            style={{ backgroundColor: color }}
          />
        );
      })}
    </div>
  );
}

export function SubmenuItem({
  children,
  submenu,
  icon,
  submenuClassName = "min-w-64",
}: {
  children: ReactNode;
  submenu: ReactNode;
  icon?: ReactNode;
  submenuClassName?: string;
}) {
  const canHover = useCanHover();
  const [isOpen, setIsOpen] = useState(false);

  function toggleOpen() {
    setIsOpen((currentOpen) => !currentOpen);
  }

  return (
    <div
      className={`relative ${
        canHover
          ? "[&:hover>.submenu-panel]:visible [&:hover>.submenu-panel]:opacity-100"
          : ""
      }`}
      role="none"
    >
      <button
        type="button"
        role="menuitem"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onMouseDown={(event) => event.preventDefault()}
        onClick={toggleOpen}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
      >
        <span
          className="flex h-4 w-4 shrink-0 items-center justify-center"
          aria-hidden="true"
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1">{children}</span>
        <ChevronRight
          className={`h-4 w-4 shrink-0 transition-transform ${
            isOpen ? "rotate-90" : ""
          }`}
          aria-hidden="true"
        />
      </button>
      <div
        data-open={isOpen}
        className={`submenu-panel invisible absolute left-0 right-0 top-full z-30 mt-1 overflow-visible rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] py-1 opacity-0 shadow-[var(--shadow-card)] transition data-[open=true]:visible data-[open=true]:opacity-100 sm:left-full sm:right-auto sm:top-0 sm:-ml-px sm:mt-0 ${submenuClassName}`}
      >
        {submenu}
      </div>
    </div>
  );
}

export function ToolbarMenuPanel({
  children,
  className = "min-w-64",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="menu"
      className={`absolute left-0 z-30 mt-1 overflow-hidden rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] py-1 shadow-[var(--shadow-card)] ${className}`}
    >
      {children}
    </div>
  );
}

export function TableBubbleMenuPanel({
  children,
  className = "min-w-44",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="menu"
      className={`news-body-editor__table-bubble-submenu ${className}`}
    >
      {children}
    </div>
  );
}

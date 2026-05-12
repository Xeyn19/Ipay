"use client";

import { useState } from "react";
import { dashboardInputClassName } from "../../news-modal";
import { useCanHover } from "../hooks/use-can-hover";
import { parseTableDimensionInput } from "../utils";

const TABLE_PICKER_LIMIT = 10;
const DEFAULT_TABLE_DIMENSION = 3;

export function TableInsertPicker({
  onInsert,
}: {
  onInsert: (rows: number, columns: number) => void;
}) {
  const canHover = useCanHover();
  const [hoveredRows, setHoveredRows] = useState(0);
  const [hoveredColumns, setHoveredColumns] = useState(0);
  const [rowValue, setRowValue] = useState(String(DEFAULT_TABLE_DIMENSION));
  const [columnValue, setColumnValue] = useState(String(DEFAULT_TABLE_DIMENSION));

  const parsedRows = parseTableDimensionInput(rowValue);
  const parsedColumns = parseTableDimensionInput(columnValue);
  const canInsertFromInputs = parsedRows !== null && parsedColumns !== null;

  function handleInputInsert() {
    if (!canInsertFromInputs) {
      return;
    }

    onInsert(parsedRows, parsedColumns);
  }

  if (!canHover) {
    return (
      <div className="space-y-3 px-3 py-3" role="none">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--text-faint)]">
          Insert table
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              Rows
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={TABLE_PICKER_LIMIT}
              value={rowValue}
              onChange={(event) => setRowValue(event.target.value)}
              className={dashboardInputClassName}
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              Columns
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={TABLE_PICKER_LIMIT}
              value={columnValue}
              onChange={(event) => setColumnValue(event.target.value)}
              className={dashboardInputClassName}
            />
          </label>
        </div>
        <button
          type="button"
          disabled={!canInsertFromInputs}
          onMouseDown={(event) => event.preventDefault()}
          onClick={handleInputInsert}
          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--brand-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Insert table
        </button>
      </div>
    );
  }

  return (
    <div
      className="px-3 pb-3 pt-2"
      role="none"
      onMouseLeave={() => {
        setHoveredRows(0);
        setHoveredColumns(0);
      }}
    >
      <div className="pb-2 text-xs font-medium uppercase tracking-[0.12em] text-[var(--text-faint)]">
        {hoveredRows > 0 && hoveredColumns > 0
          ? `${hoveredRows} x ${hoveredColumns} table`
          : "Select table size"}
      </div>
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: TABLE_PICKER_LIMIT * TABLE_PICKER_LIMIT }).map(
          (_, index) => {
            const row = Math.floor(index / TABLE_PICKER_LIMIT) + 1;
            const column = (index % TABLE_PICKER_LIMIT) + 1;
            const isActive = row <= hoveredRows && column <= hoveredColumns;

            return (
              <button
                key={`${row}-${column}`}
                type="button"
                role="menuitem"
                aria-label={`Insert ${row} by ${column} table`}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => {
                  setHoveredRows(row);
                  setHoveredColumns(column);
                }}
                onFocus={() => {
                  setHoveredRows(row);
                  setHoveredColumns(column);
                }}
                onClick={() => onInsert(row, column)}
                className={`h-4 w-4 rounded-[0.2rem] border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] ${
                  isActive
                    ? "border-[var(--border-orange)] bg-[var(--brand)]/20"
                    : "border-[var(--border-light)] bg-[var(--bg-subtle)] hover:border-[var(--border-orange)]"
                }`}
              />
            );
          },
        )}
      </div>
    </div>
  );
}

export function CellPropertiesGridIcon({
  className = "h-4 w-4",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {[
        [5, 5],
        [12, 5],
        [19, 5],
        [5, 12],
        [12, 12],
        [19, 12],
        [5, 19],
        [12, 19],
        [19, 19],
      ].map(([cx, cy]) => (
        <rect
          key={`${cx}-${cy}`}
          x={cx - 2}
          y={cy - 2}
          width="4"
          height="4"
          rx="0.75"
        />
      ))}
    </svg>
  );
}

export function TableOfContentsIcon({
  className = "h-4 w-4",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 7h14" />
      <path d="M5 12h8" />
      <path d="M5 17h10" />
      <circle cx="18" cy="12" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="16" cy="17" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TaskListIcon({
  className = "h-4 w-4",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4.5" y="5" width="4" height="4" rx="0.9" />
      <path d="m5.7 6.9 1.1 1.2 1.8-2.2" />
      <path d="M11.5 7h8" />
      <rect x="4.5" y="15" width="4" height="4" rx="0.9" />
      <path d="M11.5 17h8" />
    </svg>
  );
}

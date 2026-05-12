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

export function LineHeightIcon({
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
      <path d="M7 5h12" />
      <path d="M7 12h12" />
      <path d="M7 19h12" />
      <path d="m4 4 2-2 2 2" />
      <path d="M6 2v8" />
      <path d="m4 20 2 2 2-2" />
      <path d="M6 14v8" />
    </svg>
  );
}

export function VerticalEllipsisIcon({
  className = "h-4 w-4",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="12" cy="5" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="12" cy="19" r="1.75" />
    </svg>
  );
}

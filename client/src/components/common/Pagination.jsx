import { ChevronLeft, ChevronRight } from "lucide-react";

function pageNumbers(current, totalPages) {
  const pages = [];
  const window = 1;
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= current - window && p <= current + window)) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }
  return pages;
}

export function Pagination({ page, limit, total, totalPages, onPageChange }) {
  if (total === 0) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row">
      <p>
        Showing <span className="font-medium text-slate-700 dark:text-slate-300">{from}</span> to{" "}
        <span className="font-medium text-slate-700 dark:text-slate-300">{to}</span> of{" "}
        <span className="font-medium text-slate-700 dark:text-slate-300">{total}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 disabled:opacity-40 dark:border-slate-700"
        >
          <ChevronLeft size={14} />
        </button>

        {pageNumbers(page, totalPages).map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-1">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium ${
                p === page
                  ? "bg-brand-600 text-white"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 disabled:opacity-40 dark:border-slate-700"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

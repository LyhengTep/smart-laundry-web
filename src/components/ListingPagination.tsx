import { ChevronLeft, ChevronRight } from "lucide-react";

type ListingPaginationProps = {
  currentPage: number;
  pages: number;
  onPageClick?: (v: any) => void;
  onBackward?: () => void;
  onForward?: () => void;
};
export function ListingPagination({
  currentPage,
  pages,
  onPageClick,
  onBackward,
  onForward,
}: ListingPaginationProps) {
  function getPages(current: number, total: number) {
    const pages = [];

    if (current > 3) {
      pages.push(1);
      pages.push("...");
    }

    for (let i = current - 1; i <= current + 1; i++) {
      if (i > 0 && i <= total) {
        pages.push(i);
      }
    }

    if (current < total - 2) {
      pages.push("...");
      pages.push(total);
    }

    return pages;
  }
  return (
    <div className="flex items-center justify-center gap-4 py-10 border-t border-white/5">
      {currentPage != 1 && (
        <button
          className="p-3 rounded-xl border border-white/5 text-slate-500 hover:text-foreground"
          onClick={onBackward && onBackward}
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {getPages(currentPage, pages).map((p, i) => {
        return (
          <button
            key={i + "_button"}
            onClick={() => onPageClick && onPageClick(p)}
            className={`w-12 h-12 rounded-xl ${p === currentPage ? "bg-blue-600 text-white" : "border border-white/5 text-slate-500 hover:text-foreground"} font-bold`}
          >
            {p}
          </button>
        );
      })}

      {/* <button className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold">
        1
      </button>
      <button className="w-12 h-12 rounded-xl  hover:text-foreground font-bold">
        2
      </button> */}
      <button
        onClick={onForward && onForward}
        className="p-3 rounded-xl border border-white/5 text-slate-500 hover:text-foreground"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers to display
  const pages: (number | string)[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <nav
      aria-label="Product pagination"
      className="flex items-center justify-center gap-1.5 sm:gap-2 pt-12 pb-8"
    >
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-stone-200 bg-white hover:bg-stone-50 flex items-center justify-center text-stone-600 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Number Buttons */}
      {pages.map((p, idx) => {
        if (typeof p === "string") {
          return (
            <span
              key={`ellipsis-${idx}`}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-stone-400 font-bold text-xs sm:text-sm select-none"
            >
              ...
            </span>
          );
        }

        const isCurrent = p === currentPage;

        return (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-current={isCurrent ? "page" : undefined}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center transition-all cursor-pointer ${
              isCurrent
                ? "bg-[#256141] text-white shadow-xs"
                : "bg-white hover:bg-stone-50 text-stone-700 border border-stone-200/80 shadow-2xs hover:border-stone-300"
            }`}
          >
            {p}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-stone-200 bg-white hover:bg-stone-50 flex items-center justify-center text-stone-600 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}

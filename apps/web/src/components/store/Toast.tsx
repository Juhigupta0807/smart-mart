"use client";

import React, { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full px-4 transition-all"
    >
      <div className="bg-[#183928] text-white px-4 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-[#2B6E48]/60">
        <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
        <span className="text-xs sm:text-sm font-medium leading-snug flex-1">
          {message}
        </span>
        <button
          onClick={onClose}
          aria-label="Close notification"
          className="text-stone-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}

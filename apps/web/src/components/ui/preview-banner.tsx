"use client";

import { useEffect, useState } from "react";
import { isDevPreviewActive, setDevPreview } from "@/lib/dev-preview";
import { Sparkles, X } from "lucide-react";

export default function DevPreviewBanner() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(isDevPreviewActive());
  }, []);

  if (!active || process.env.NODE_ENV === "production") return null;

  const handleExit = () => {
    setDevPreview(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("preview");
    window.location.href = url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : "");
  };

  return (
    <aside 
      aria-label="Development Preview Mode Notice"
      className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-medium sticky top-0 z-50 flex items-center justify-between shadow-md print:hidden"
    >
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-slate-950 shrink-0" />
        <span>
          <strong>UI Preview Mode Active</strong> &bull; Inspecting frontend with sample data (no backend connection or real credentials required).
        </span>
      </div>

      <button
        onClick={handleExit}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 text-white rounded-lg text-[11px] font-semibold hover:bg-slate-800 transition-colors shrink-0 ml-4"
      >
        <span>Exit Preview</span>
        <X size={12} />
      </button>
    </aside>
  );
}

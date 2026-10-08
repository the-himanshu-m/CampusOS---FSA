import React from "react";

export function StatusBadge({
  status,
  size = "md"
}: {
  status: string;
  size?: "sm" | "md";
}) {
  const norm = (status || "").toUpperCase();
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  switch (norm) {
    case "ACTIVE":
    case "SUBMITTED":
    case "GRADED":
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500" />
          {status}
        </span>
      );
    case "LATE":
    case "URGENT":
    case "CLOSED":
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-rose-500" />
          {status}
        </span>
      );
    case "IMPORTANT":
    case "DRAFT":
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500" />
          {status}
        </span>
      );
    case "ARCHIVED":
    case "NORMAL":
    default:
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-slate-400" />
          {status}
        </span>
      );
  }
}

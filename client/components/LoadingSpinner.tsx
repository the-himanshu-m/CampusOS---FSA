import React from "react";

export function LoadingSpinner({
  size = "md",
  text = "Loading..."
}: {
  size?: "sm" | "md" | "lg";
  text?: string;
}) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  }[size];

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <div
        className={`${sizeClasses} border-indigo-600 border-t-transparent rounded-full animate-spin`}
      />
      {text && <p className="text-xs font-medium text-gray-500">{text}</p>}
    </div>
  );
}

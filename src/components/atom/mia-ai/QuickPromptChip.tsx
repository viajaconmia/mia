import React from "react";

export interface QuickPromptChipProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "starter" | "suggestion";
}

export const QuickPromptChip: React.FC<QuickPromptChipProps> = ({
  label,
  onClick,
  disabled = false,
  variant = "starter",
}) => {
  if (variant === "suggestion") {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className="shrink-0 text-[11px] px-2.5 py-1 rounded-md bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 transition truncate max-w-[260px] disabled:opacity-50"
      >
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 transition disabled:opacity-50"
    >
      {label}
    </button>
  );
};

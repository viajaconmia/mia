import React from "react";

export interface TravelStatePillProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  variant?: "primary" | "default";
  iconClassName?: string;
}

export const TravelStatePill: React.FC<TravelStatePillProps> = ({
  icon: Icon,
  label,
  value,
  variant = "default",
  iconClassName = "text-slate-500",
}) => {
  if (variant === "primary") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
        <Icon className="w-3.5 h-3.5" />
        {label}: {value}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-slate-100 text-slate-700">
      <Icon className={`w-3.5 h-3.5 ${iconClassName}`} />
      {label}: <strong>{value}</strong>
    </span>
  );
};

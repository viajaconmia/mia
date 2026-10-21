import React from "react";
import { Cpu } from "lucide-react";
import { LLMProviderType } from "../../../services/miaAiService";

export interface ProviderStrategySelectorProps {
  provider: LLMProviderType;
  onChange: (provider: LLMProviderType) => void;
  disabled?: boolean;
}

export const ProviderStrategySelector: React.FC<
  ProviderStrategySelectorProps
> = ({ provider, onChange, disabled = false }) => {
  return (
    <div className="flex items-center gap-1 bg-blue-950/50 p-1 rounded-lg border border-white/10">
      <span className="text-[10px] text-blue-200 px-1.5 flex items-center gap-1">
        <Cpu className="w-3 h-3" /> LLM:
      </span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("gemini")}
        className={`px-2 py-0.5 rounded text-[11px] font-medium transition disabled:opacity-50 ${
          provider === "gemini"
            ? "bg-sky-500 text-white shadow-sm"
            : "text-blue-200 hover:text-white"
        }`}
      >
        Gemini
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("openai")}
        className={`px-2 py-0.5 rounded text-[11px] font-medium transition disabled:opacity-50 ${
          provider === "openai"
            ? "bg-emerald-500 text-white shadow-sm"
            : "text-blue-200 hover:text-white"
        }`}
      >
        OpenAI
      </button>
    </div>
  );
};

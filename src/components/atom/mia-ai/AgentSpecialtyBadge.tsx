import React from "react";
import {
  Plane,
  Bus,
  Train,
  Ship,
  Car,
  UserCheck,
  FileText,
  FileSpreadsheet,
  Sparkles,
} from "lucide-react";
import {
  AgentSpecialtyType,
  ChatResponseMetadata,
} from "../../../services/miaAiService";

export const AGENT_LABELS: Record<
  AgentSpecialtyType,
  { name: string; color: string; icon: React.ElementType }
> = {
  flight: {
    name: "FlightAgent",
    color: "bg-sky-100 text-sky-800 border-sky-200",
    icon: Plane,
  },
  bus: {
    name: "BusAgent",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Bus,
  },
  train: {
    name: "TrainAgent",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: Train,
  },
  ferry: {
    name: "FerryAgent",
    color: "bg-cyan-100 text-cyan-800 border-cyan-200",
    icon: Ship,
  },
  car_rental: {
    name: "CarRentalAgent",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: Car,
  },
  chauffeur: {
    name: "ChauffeurAgent",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: UserCheck,
  },
  pdf_specialist: {
    name: "PdfSpecialist",
    color: "bg-rose-100 text-rose-800 border-rose-200",
    icon: FileText,
  },
  csv_analyst: {
    name: "CsvAnalyst",
    color: "bg-teal-100 text-teal-800 border-teal-200",
    icon: FileSpreadsheet,
  },
  general_assistant: {
    name: "GeneralAssistant",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Sparkles,
  },
};

export interface AgentSpecialtyBadgeProps {
  metadata: ChatResponseMetadata;
}

export const AgentSpecialtyBadge: React.FC<AgentSpecialtyBadgeProps> = ({
  metadata,
}) => {
  const agentKey = metadata.agentUsed || "general_assistant";
  const agentInfo = AGENT_LABELS[agentKey] || AGENT_LABELS.general_assistant;
  const AgentIcon = agentInfo.icon;

  return (
    <div className="flex flex-wrap items-center gap-1.5 pb-1.5 border-b border-slate-100">
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${agentInfo.color}`}
      >
        <AgentIcon className="w-3 h-3" />
        {agentInfo.name}
      </span>

      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium uppercase">
        {metadata.providerUsed === "gemini" ? "Gemini" : "OpenAI"}
      </span>

      {metadata.fallbackTriggered && (
        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold">
          Fallback Activo
        </span>
      )}

      <span className="text-[10px] text-slate-400 ml-auto">
        {metadata.tokenUsage?.totalTokens ?? 0} tok
        {metadata.latencyMs ? ` • ${(metadata.latencyMs / 1000).toFixed(1)}s` : ""}
      </span>
    </div>
  );
};

import React from "react";
import { Briefcase, Sparkles } from "lucide-react";

export interface MiaStudioStatusBarProps {
  activeViewTab: "explorer" | "selection";
  onChangeViewTab: (tab: "explorer" | "selection") => void;
  selectedOptionsCount: number;
}

export const MiaStudioStatusBar: React.FC<MiaStudioStatusBarProps> = ({
  activeViewTab,
  onChangeViewTab,
  selectedOptionsCount,
}) => {
  return (
    <div className="space-y-4">
      {/* PESTAÑAS DEL LIENZO PRINCIPAL */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChangeViewTab("explorer")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
              activeViewTab === "explorer"
                ? "bg-blue-700 text-white shadow-sm"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Explorador / Lo que estás generando</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeViewTab("selection")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
              activeViewTab === "selection"
                ? "bg-blue-700 text-white shadow-sm"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Mi Selección / Itinerario</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                activeViewTab === "selection"
                  ? "bg-white/20 text-white"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {selectedOptionsCount}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import {
  Briefcase,
  Calendar,
  Compass,
  Database,
  FileSpreadsheet,
  FileText,
  Layers,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
import {
  AttachedDocumentMeta,
  TravelState,
} from "../../../services/miaAiService";
import { SERVICE_NAMES_ES } from "../../../hooks/useMiaAiStudio";
import { TravelStatePill } from "../../atom/mia-ai/TravelStatePill";

export interface MiaStudioStatusBarProps {
  travelState: TravelState;
  attachedDocuments: AttachedDocumentMeta[];
  activeViewTab: "explorer" | "selection";
  onChangeViewTab: (tab: "explorer" | "selection") => void;
  selectedOptionsCount: number;
}

export const MiaStudioStatusBar: React.FC<MiaStudioStatusBarProps> = ({
  travelState,
  attachedDocuments,
  activeViewTab,
  onChangeViewTab,
  selectedOptionsCount,
}) => {
  return (
    <div className="space-y-4">
      {/* BARRA DE ESTADO SUPERIOR: MEMORIA DE VIAJE + ARCHIVOS TOKENIZADOS */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-700" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-950">
              Estado del Viaje en Sesión
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <TravelStatePill
              icon={Layers}
              label="Servicio"
              value={
                travelState.activeService
                  ? SERVICE_NAMES_ES[travelState.activeService]
                  : "Multimodal / Por definir"
              }
              variant="primary"
            />

            <TravelStatePill
              icon={MapPin}
              label="Origen"
              value={travelState.origin || "Por definir"}
            />

            <TravelStatePill
              icon={MapPin}
              label="Destino"
              value={travelState.destination || "Por definir"}
              iconClassName="text-blue-600"
            />

            <TravelStatePill
              icon={Calendar}
              label="Fecha"
              value={travelState.departureDate || "Flexible"}
            />

            <TravelStatePill
              icon={Users}
              label="Pasajeros"
              value={travelState.passengers || 1}
            />
          </div>
        </div>

        {/* Píldoras de Documentos Tokenizados */}
        <div className="flex flex-col items-start lg:items-end gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            Documentos Tokenizados ({attachedDocuments.length})
          </span>
          {attachedDocuments.length === 0 ? (
            <span className="text-xs text-slate-400 italic">
              Ningún PDF/CSV adjunto aún
            </span>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {attachedDocuments.map((doc) => (
                <span
                  key={doc.documentId}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                    doc.fileType === "pdf"
                      ? "bg-rose-50 text-rose-800 border-rose-200"
                      : "bg-teal-50 text-teal-800 border-teal-200"
                  }`}
                >
                  {doc.fileType === "pdf" ? (
                    <FileText className="w-3.5 h-3.5" />
                  ) : (
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                  )}
                  <span className="truncate max-w-[140px]">{doc.fileName}</span>
                  <span className="text-[10px] opacity-75">
                    ({doc.totalChunks} chunks • {doc.totalTokens} tok)
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

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

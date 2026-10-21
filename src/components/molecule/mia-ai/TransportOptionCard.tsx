import React from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
} from "lucide-react";
import {
  TransportOptionItem,
  TransportServiceType,
} from "../../../services/miaAiService";

export interface TransportOptionCardProps {
  option: TransportOptionItem;
  serviceType?: TransportServiceType;
  fallbackOrigin?: string;
  fallbackDestination?: string;
  isSelected: boolean;
  onToggleSelect: (
    option: TransportOptionItem,
    serviceType?: TransportServiceType
  ) => void;
}

export const TransportOptionCard: React.FC<TransportOptionCardProps> = ({
  option,
  serviceType,
  fallbackOrigin,
  fallbackDestination,
  isSelected,
  onToggleSelect,
}) => {
  return (
    <div
      className={`rounded-2xl bg-white border p-5 shadow-xs transition flex flex-col justify-between gap-4 ${
        isSelected
          ? "border-emerald-500 ring-2 ring-emerald-500/20"
          : "border-slate-200 hover:border-blue-300"
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              {option.provider}
            </span>
            <h3 className="text-base font-bold text-slate-900">
              {option.serviceName || option.provider}
            </h3>
          </div>
          {(option.serviceClass || option.vehicleCategory) && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
              {option.serviceClass || option.vehicleCategory}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-xl p-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">
              Salida / Origen
            </span>
            <span className="font-semibold text-slate-800">
              {option.departurePoint || fallbackOrigin || "Terminal principal"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">
              Llegada / Destino
            </span>
            <span className="font-semibold text-slate-800">
              {option.arrivalPoint || fallbackDestination || "Destino"}
            </span>
          </div>
          {option.estimatedDuration && (
            <div className="flex items-center gap-1.5 text-slate-600">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Duración: {option.estimatedDuration}</span>
            </div>
          )}
          {option.frequencyOrSchedule && (
            <div className="flex items-center gap-1.5 text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>{option.frequencyOrSchedule}</span>
            </div>
          )}
        </div>

        {option.highlights && option.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {option.highlights.map((hl, hIdx) => (
              <span
                key={hIdx}
                className="px-2.5 py-0.5 rounded-md bg-blue-50/80 text-blue-900 text-[11px] font-medium"
              >
                • {hl}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-3">
        {option.sourceUrl ? (
          <a
            href={option.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Sitio oficial / Fuente
          </a>
        ) : (
          <span className="text-[11px] text-slate-400">
            Ruta verificada por agente
          </span>
        )}

        <button
          type="button"
          onClick={() => onToggleSelect(option, serviceType)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
            isSelected
              ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-800"
              : "bg-blue-700 hover:bg-blue-800 text-white shadow-xs"
          }`}
        >
          {isSelected ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>En tu selección</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Elegir opción</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

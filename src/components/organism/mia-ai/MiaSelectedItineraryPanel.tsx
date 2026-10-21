import React, { useMemo } from "react";
import { Briefcase, ExternalLink, Trash2 } from "lucide-react";
import { TransportServiceType } from "../../../services/miaAiService";
import {
  SelectedItineraryItem,
  SERVICE_NAMES_ES,
} from "../../../hooks/useMiaAiStudio";

export interface MiaSelectedItineraryPanelProps {
  selectedOptions: SelectedItineraryItem[];
  onRemoveOption: (id: string) => void;
  onClearAll?: () => void;
}

export const MiaSelectedItineraryPanel: React.FC<
  MiaSelectedItineraryPanelProps
> = ({ selectedOptions, onRemoveOption, onClearAll }) => {
  const groupedByService = useMemo(() => {
    const groups: Partial<
      Record<TransportServiceType, SelectedItineraryItem[]>
    > = {};
    selectedOptions.forEach((item) => {
      if (!groups[item.serviceType]) {
        groups[item.serviceType] = [];
      }
      groups[item.serviceType]!.push(item);
    });
    return groups;
  }, [selectedOptions]);

  if (selectedOptions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
        <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">
          Aún no has elegido opciones para tu itinerario
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Consulta vuelos, autobuses, trenes, ferries o autos en el chat y haz
          clic en <strong>"Elegir opción"</strong> en cualquiera de las tarjetas
          del Explorador para guardarla aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 px-5 py-3.5 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-blue-950">
            Resumen de tu Selección Multimodal ({selectedOptions.length})
          </h3>
          <p className="text-xs text-slate-500">
            Opciones agrupadas por tipo de servicio de transporte
          </p>
        </div>

        {onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpiar selección</span>
          </button>
        )}
      </div>

      {(Object.keys(groupedByService) as TransportServiceType[]).map(
        (serviceKey) => {
          const items = groupedByService[serviceKey] || [];
          return (
            <div key={serviceKey} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                  {SERVICE_NAMES_ES[serviceKey]} ({items.length})
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                          {item.option.provider}
                        </span>
                        <button
                          type="button"
                          onClick={() => onRemoveOption(item.id)}
                          className="text-rose-600 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 transition"
                          title="Quitar de mi selección"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h4 className="text-base font-bold text-slate-900">
                        {item.option.serviceName || item.option.provider}
                      </h4>

                      <p className="text-xs text-slate-600">
                        Ruta:{" "}
                        <strong>
                          {item.option.departurePoint ||
                            item.origin ||
                            "Origen"}
                        </strong>{" "}
                        →{" "}
                        <strong>
                          {item.option.arrivalPoint ||
                            item.destination ||
                            "Destino"}
                        </strong>
                      </p>

                      {item.option.frequencyOrSchedule && (
                        <p className="text-xs text-slate-500">
                          Horario / Frecuencia:{" "}
                          {item.option.frequencyOrSchedule}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                      <span>Agregado a las {item.addedAt}</span>
                      {item.option.sourceUrl && (
                        <a
                          href={item.option.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Ver proveedor
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
      )}
    </div>
  );
};
